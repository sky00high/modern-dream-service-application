'use strict';

angular.module('angularRestfulAuth', [
    'ngStorage',
    'ngRoute',
    'angular-loading-bar',
    'angularPayments'
])
.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {

    $routeProvider.
        when('/', {
            templateUrl: 'home.html',
            controller: 'HomeCtrl'
        }).
        when('/signin', {
            templateUrl: 'signin.html',
            controller: 'HomeCtrl'
        }).
        when('/signup', {
            templateUrl: 'signup.html',
            controller: 'HomeCtrl'
        }).
        when('/me', {
            templateUrl: 'me.html',
            controller: 'HomeCtrl'
        }).
        when('/item/:param', {
            templateUrl: 'item.html',
            controller: 'ItemCtrl'
        }).
        when('/confirm', {
            templateUrl: 'confirm.html',
            controller: 'HomeCtrl'
        }).
        otherwise({
            redirectTo: '/'
        });

    $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
            return {
                'request': function (config) {
                    config.headers = config.headers || {};
                    if ($localStorage.token) {
                        config.headers.Authorization = $localStorage.token;
                    }
                    return config;
                },
                'responseError': function(response) {
                    if(response.status === 401) {
                        $location.path('/signin');
                    }
                    return $q.reject(response);
                }
            };
        }]);

    }
]);