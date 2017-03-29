// public/js/register.js
var testo = angular.module('testo', []);

function mainController($scope, $http) {
    $scope.formData = {};
    $scope.success = true;
    $scope.orders = [];
    $scope.pdfSuccess = true;

    // Fetch orders.
    $http.get('/api/orders')
        .success(function(data) {
            $scope.success = data.success;
            if (data.success) {
                // Orders found
                $scope.orders = data.orders;
            }
        })
        .error(function(data) {
            $scope.success = false;
        });

    $scope.getPdf = function() {
        $http.get('/api/pdf')
            .success(function(data) {
                $scope.pdfSuccess = data.success;
            })
            .error(function(data) {
                $scope.pdfSuccess = false;
                $scope.reason = 'Could not generate pdf for orders !';
            });
    };
}