// Main server file.
var auth = require('./auth.js');
var express  = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var constants = require('./constants.js');
var model = require('./model.js');
var utils = require('./utils.js');
var session = require('express-session')
var crypto = require('crypto');

// Configurations
// Connect to mongoDB database.
mongoose.connect(constants.mongopath);

// Session
app.use(session({
  secret: constants.sessionsecret,
  resave: false,
  saveUninitialized: true
}))

// Set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'));

// Log every request to the console
app.use(morgan('dev'));

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({'extended':'true'}));

// Parse application/json
app.use(bodyParser.json());

// Parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());

// API routes

// Register a user.
app.post('/api/register', function(req, res) {
    var name = req.body.name;
    var phone_number = req.body.phone_number;
    var password = req.body.password;
    if (!name || !phone_number || !password) {
        return res.json({
            success: false,
            reason: 'Name, Phone number & password cannot be empty'
        });
    }
    if (phone_number.length != 10 || !utils.isNumeric(phone_number)) {
        return res.json({
            success: false,
            reason: 'Invalid phone number provided'
        });
    }
    if (password.length < 6) {
       return res.json({
            success: false,
            reason: 'Password should be atleast 6 characters long'
        });
    }
    var password_hash =
        crypto.createHash('sha256').update(password).digest('base64');
    model.user.find({phone_number: phone_number}, function(err, users) {
        if (err) {
            return res.json({
                success: false,
                reason: 'Internal error. Could not register !'
            });
        } else if (users.length) {
            return res.json({
                success: false,
                reason: 'Phone number already registered. Could not register !'
            });
        } else {
            // Create user.
            model.user.create({
                phone_number: phone_number,
                password_hash: password_hash,
                name: name,
            }, function(err, todo) {
                if (err) {
                    return res.json({
                        success: false,
                        reason: 'Internal error. Could not register !'
                    });
                }
                return res.json({
                    success: true,
                    reason: 'Successfully registered !'
                });
            });
        }
    })
});

// Login a user.
app.post('/api/login', function(req, res) {
    if (auth.authenticate(req)) {
        // User already logged in.
        return res.json({
            success: true,
            reason: ''
        });
    }
    var phone_number = req.body.phone_number;
    var password = req.body.password;
    if (!phone_number || !password) {
        return res.json({
            success: false,
            reason: 'Invalid credentials !'
        });
    }
    var password_hash =
        crypto.createHash('sha256').update(password).digest('base64');
    model.user.find({
        phone_number: phone_number,
        password_hash: password_hash
    }, function(err, users) {
        if (users.length) {
            auth.login(req, users[0]);
            return res.json({
                success: true,
                reason: 'Successfully logged in !'
            });
        }
        return res.json({
            success: false,
            reason: 'Invalid credentials !'
        });
    });
});

// Logout
app.get('/api/logout', function(req, res) {
    auth.logout(req);
    res.redirect('/login');
});

// Lookup a product with a given product code
app.get('/api/product/:productcode', function(req, res) {
    if (!auth.authenticate(req)) {
        // User already logged in.
        return res.json({});
    }
    var productcode = req.params.productcode;
    console.log(productcode);
    if (!productcode || productcode.length != 8) {
        return res.json({
            success: false,
            reason: 'Invalid product code !'
        });
    }
    model.product.find({
        product_id: productcode,
    }, function(err, products) {
        console.log(products);
        if (products.length) {
            return res.json({
                success: true,
                reason: '',
                product: products[0]
            });
        }
        return res.json({
            success: false,
            reason: 'Could not find product with given product code !'
        });
    });
});

// Buy a product
app.post('/api/buy/:productcode', function(req, res) {
    if (!auth.authenticate(req)) {
        // User already logged in.
        return res.json({});
    }
    var productcode = req.params.productcode;
    if (!productcode || productcode.length != 8) {
        return res.json({
            success: false,
            reason: 'Could not buy product 1!'
        });
    }
    model.product.find({
        product_id: productcode,
    }, function(err, products) {
        if (products.length && products[0].stock > 0) {
            var product = products[0];
            // Product found with valid stock.
            model.order.create({
                phone_number: req.session.phone_number,
                product_id: productcode,
                product_name: product.name,
                price: product.price,
                date_of_purchase: new Date()
            }, function(err, order) {
                if (err) {
                    return res.json({
                        success: false,
                        reason: 'Could not buy product 2!'
                    });
                }
                // Reduce stock count of the product. If this fails then state
                // is inconsistent.
                model.product.update(
                    { product_id: productcode },
                    { stock: product.stock - 1 },
                    { multi: false },
                    function(err, num) {
                        if (err || !num) {
                            console.log("Error, insconsistent state detected. ",
                                "Ordered item but couldn't reduce stock count");
                        }
                    });
                return res.json({
                    success: true,
                    reason: 'Bought product !'
                });
            });
        } else {
            return res.json({
                success: false,
                reason: 'Could not buy product 3!'
            });
        }
    });
});

// Lookup all orders
app.get('/api/orders', function(req, res) {
    if (!auth.authenticate(req)) {
        // User already logged in.
        return res.json({});
    }
    model.order.find({
        phone_number: req.session.phone_number,
    }, function(err, orders) {
        console.log(orders);
        if (orders.length) {
            return res.json({
                success: true,
                orders: orders
            });
        } else {
            return res.json({
                success: false,
            });
        }
    });
});

// Generate pdf of all orders.
app.get('/api/pdf', function(req, res) {
    if (!auth.authenticate(req)) {
        // User already logged in.
        return res.json({});
    }
    model.order.find({
        phone_number: req.session.phone_number,
    }, function(err, orders) {
        console.log(orders);
        if (orders.length) {
            // Generate pdf
            // TODO
            return res.json({
                success: true,
            });
        } else {
            return res.json({
                success: false,
            });
        }
    });
});

// Application routes for pages.

app.get('/', function(req, res) {
    res.redirect('/login');
});

app.get('/home', function(req, res) {
    if (!auth.authenticate(req)) {
        // User not logged in.
        return res.redirect('/login');
    }
    return res.sendfile('./public/home.html');
});

app.get('/product', function(req, res) {
    if (!auth.authenticate(req)) {
        // User not logged in.
        return res.redirect('/login');
    }
    return res.sendfile('./public/product.html');
});

app.get('/orders', function(req, res) {
    if (!auth.authenticate(req)) {
        // User not logged in.
        return res.redirect('/login');
    }
    return res.sendfile('./public/orders.html');
});

app.get('/login', function(req, res) {
    if (auth.authenticate(req)) {
        // User not logged in.
        res.redirect('/home');
    }
    res.sendfile('./public/login.html');
});

app.get('/register', function(req, res) {
    if (auth.authenticate(req)) {
        // User not logged in.
        res.redirect('/home');
    }
    res.sendfile('./public/register.html');
});

// Listen (start app with node server.js) ======================================
app.listen(8080);
console.log("App listening on port 8080");
