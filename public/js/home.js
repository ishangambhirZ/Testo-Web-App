// public/js/register.js
var testo = angular.module('testo', []);

function mainController($scope, $http) {
    $scope.formData = {};
    $scope.success = true;
    $scope.reason = '';

    // When submitting the register form, send the text to the node API
    $scope.lookupProduct = function() {
        if (!$scope.formData.productCode ||
            $scope.formData.productCode.length != 8) {
            // Do nothing.
            return;
        }
        window.location = 'product?productcode=' + $scope.formData.productCode;
    };
}