// Define all models needed.
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// User
var userSchema = new Schema({
  phone_number: String,
  password_hash: String,
  name: String,
});
var User = mongoose.model('User', userSchema);

// Product
var productSchema = new Schema({
  product_id: {type: String, maxlength: 8, minlength: 8},
  name: String,
  image_url: String,
  manufacturer: String,
  category: String,
  price: {type: Number, min: 0},
  stock: {type: Number, min: 0}
});
var Product = mongoose.model('Product', productSchema);

// Order
var orderSchema = new Schema({
  phone_number: String, // Phone number of user to which this order belongs
  product_id: {type: String, maxlength: 8, minlength: 8},
  product_name: String,
  price: {type: Number, min: 0},
  date_of_purchase: {type: Date}
});
var Order = mongoose.model('Order', orderSchema);

// Define model to be exported.
var model = {
  user: User,
  product: Product,
  order: Order
};

// Clear tables (if already present)
model.user.remove({}, function(err, user) {});
model.product.remove({}, function(err, user) {});
model.order.remove({}, function(err, user) {});

// Create sample products
model.product.create({
  product_id: '88888888',
  name: 'iPhone 7',
  image_url: 'https://cdn0.iconfinder.com/data/icons/BrushedMetalIcons_meBaze/512/Apple-03.png',
  manufacturer: 'Apple',
  category: 'Phones',
  price: 85000,
  stock: 25
}, function(err, product) {});

model.product.create({
  product_id: '11111111',
  name: 'Galaxy S7',
  image_url: 'http://images.samsung.com/is/image/samsung/in-galaxy-s7-edge-g935fd-sm-g935fzkuins-thumb-Back-61056966?$PG_PRD_CARD_PNG$',
  manufacturer: 'Samsung',
  category: 'Phones',
  price: 80000,
  stock: 0
}, function(err, product) {});

module.exports = model;
