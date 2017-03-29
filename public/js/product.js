// public/js/register.js
var testo = angular.module('testo', []);

function mainController($scope, $http) {
    $scope.formData = {};
    $scope.success = true;
    $scope.reason = '';
    $scope.product = undefined;

    var getParams = window.location.search.substr(1).split("&");
    var productcode;
    getParams.forEach(function(param) {
        if (param.split("=")[0] == 'productcode') {
            productcode = param.split("=")[1];
        }
    });
    // Fetch product.
    $http.get('/api/product/' + productcode)
        .success(function(data) {
            $scope.success = data.success;
            $scope.reason = data.reason;
            if (data.success) {
                // Product found
                $scope.product = data.product;
            }
        })
        .error(function(data) {
            $scope.success = false;
            $scope.reason = 'Could not register !';
        });

    $scope.buy = function() {
        $http.post('/api/buy/' + productcode)
            .success(function(data) {
                $scope.success = data.success;
                $scope.reason = data.reason;
                if (data.success) {
                    // User loggedin.
                    // Redirect to login page after 500 milliseconds.
                    setTimeout(function() {
                        window.location = 'orders';
                    }, 500);
                }
            })
            .error(function(data) {
                $scope.success = false;
                $scope.reason = 'Could not buy product !';
            });
    };
}