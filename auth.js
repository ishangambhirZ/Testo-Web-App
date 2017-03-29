// Authentication module
var auth = {
  login: function(req, user) {
    req.session.user_id = user._id;
    req.session.phone_number = user.phone_number;
    req.session.name = user.name;
  },
  logout: function(req) {
    req.session.user_id = undefined;
    req.session.phone_number = undefined;
    req.session.name = undefined;
  },
  authenticate: function(req) {
    if (req.session && req.session.user_id) {
      return true;
    }
    return false;
  }
};

module.exports = auth;
