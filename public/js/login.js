// public/js/register.js
var testo = angular.module('testo', []);

function mainController($scope, $http) {
    $scope.formData = {};
    $scope.success = true;
    $scope.reason = '';

    // When submitting the register form, send the text to the node API
    $scope.loginUser = function() {
        $http.post('/api/login', $scope.formData)
            .success(function(data) {
                $scope.success = data.success;
                $scope.reason = data.reason;
                if (data.success) {
                    // User loggedin.
                    // Redirect to login page after 500 milliseconds.
                    setTimeout(function() {
                        window.location = 'home';
                    }, 500);
                }
            })
            .error(function(data) {
                $scope.success = false;
                $scope.reason = 'Could not register !';
            });
    };
}