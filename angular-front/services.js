'use strict';

angular.module('angularRestfulAuth')
    .factory('Main', ['$http', '$localStorage', '$timeout', function($http, $localStorage, $timeout){
        var baseUrl = "https://fbhkc2kin1.execute-api.us-east-1.amazonaws.com/prod";
        function changeUser(user) {
            angular.extend(currentUser, user);
        }

        function urlBase64Decode(str) {
            var output = str.replace('-', '+').replace('_', '/');
            switch (output.length % 4) {
                case 0:
                    break;
                case 2:
                    output += '==';
                    break;
                case 3:
                    output += '=';
                    break;
                default:
                    throw 'Illegal base64url string!';
            }
            return window.atob(output);
        }

        function getUserFromToken() {
            var token = $localStorage.token;
            var user = {};
            if (typeof token !== 'undefined') {
                var encoded = token.split('.')[1];
                user = JSON.parse(urlBase64Decode(encoded));
            }
            return user;
        }

        var currentUser = getUserFromToken();

        return {
            save: function(data, success, error) {
                $http.post(baseUrl + '/customers', data).success(success).error(error)
            },
            signin: function(data, success, error) {
                $http.post(baseUrl + '/login', data).success(success).error(error)
            },
            me: function(success, error) {
                $http.get(baseUrl + '/order').success(success).error(error)
            },
            item: function(data, success, error) {
                $http.get(baseUrl + '/item/' + data.itemID).success(success).error(error)
                console.log(baseUrl + '/item/' + data.itemID);
            }, 
            order: function(data, success, error) {
                $http.get(baseUrl + '/order/' + data.orderID).success(success).error(error)
                console.log(baseUrl + '/order/' + data.orderID);
            },
            transaction: function(data, success, error) {
                $http.post(baseUrl + '/order', data).success(success).error(error)
            }, 
            logout: function(success) {
                changeUser({});
                delete $localStorage.token;
                $timeout(function() {
                    window.location = "/";
                }, 500); 
            }
        };
    }
]);