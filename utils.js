// Utility functions

var utils = {
  // Returns whether a provided string only contains numbers
  isNumeric: function(str) {
    for (var i = 0; i < str.length; i++) {
      if (str[i] - '0' < 0 || str[i] - '0' > 9) {
        return false;
      }
    }
    return true;
  }
};

module.exports = utils;