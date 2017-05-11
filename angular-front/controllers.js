'use strict';

/* Controllers */

angular.module('angularRestfulAuth')
    .controller('HomeCtrl', ['$rootScope', '$scope', '$location', '$localStorage', '$timeout', 'Main', function($rootScope, $scope, $location, $localStorage, $timeout, Main) {

        $scope.signin = function() {
            var formData = {
                email: $scope.email,
                password: $scope.password
            }

            Main.signin(formData, function(res) {
                if (res.type == false) {
                    alert(res)    
                } else {
                    $localStorage.token = res.jsonwebtoken;                    
                    $timeout(function() {
                        window.location = "/";
                    }, 500); 
                }
            }, function() {
                $rootScope.error = 'Failed to signin';
            })
        };

        $scope.signup = function() {
            var formData = {
                email: $scope.email,
                password: $scope.password
            }

            Main.save(formData, function(res) {
                if (res.type == false) {
                    alert(res.data)
                } else {
                    window.location = "/";
                }
            }, function() {
                $rootScope.error = 'Failed to signup';
            })
        };

        $scope.me = function() {
            Main.me(function(res) {
                $scope.myDetails = res;
            }, function() {
                $rootScope.error = 'Failed to fetch details';
            })
        };

        $scope.logout = function() {
            Main.logout(function() {
                window.location = "/"
            }, function() {
                alert("Failed to logout!");
            });
        };
        $scope.token = $localStorage.token;
    }])

.controller('MeCtrl', ['$rootScope', '$scope', '$location', 'Main', function($rootScope, $scope, $location, Main) {

        Main.me(function(res) {
            console.log(res);
            $scope.myDetails = res;
        }, function() {
            $rootScope.error = 'Failed to fetch details';
        })
}])


.controller('ItemCtrl', ['$rootScope', '$scope', '$routeParams', '$location', 'Main', function($rootScope, $scope, $routeParams, $location, Main) {
        var param = $routeParams.param;
        var formData = {
            itemID: param
        }
        Main.item(formData, function(res) {
            $scope.itemDetails = res;
        }, function() {
            $rootScope.error = 'Failed to get details';
        });

        $scope.stripeCallback = function (code, result) {
            if (result.error) {
                window.alert('it failed! error: ' + result.error.message);
            } 
            else {
                var itemid = $scope.itemDetails.itemID;

                var formData = {
                    itemID: itemid,
                    stripeToken: result.id
                }

                Main.transaction(formData, function(res) {
                    $location.path('/confirm');
                }, function() {
                    $rootScope.error = 'Failed to make transaction';
                })
            }
        };
}]);
