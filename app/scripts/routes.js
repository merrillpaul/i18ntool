'use strict';
define(['angularAMD', 'angular-ui-router', 'services/i18nservice'], function (angularAMD) {
    angular.module('app.routes', ['ui.router'])
        .config(function ($stateProvider, $urlRouterProvider) {

            var resolver = function () {
                return {
                    supportedLangs: ['i18nservice', function (i18nservice) {
                        return i18nservice.getSupportedLangs();
                    }],                    
                    jsonInfo: ['$rootScope', '$state',
                        function ($rootScope, $state) {
                            $rootScope.clearCurrent = function () {
                                $rootScope.$broadcast('clear-current');
                            };
                            $rootScope.downloadCurrent = function () {
                                $rootScope.$broadcast('download-current');
                            };
                            $rootScope.resetStale = function () {
                                $rootScope.$broadcast('reset-stale');
                            };    
                            $rootScope.showError = function () {
                                $rootScope.displayError = true;
                            };
                            $rootScope.goIf = function (condition, view, params) {
                                if (condition) {
                                    $state.go(view, params);    
                                }
                            };   
                            return {
                                originalLangs: $rootScope.originalLangs,
                                originalJsons: $rootScope.originalJsons
                            };
                        }]
                };
            };


            $stateProvider
                .state('home',
                angularAMD.route({
                    url: '/home',
                    templateUrl: 'scripts/home/home.html',
                    controller: 'homeCtrl',
                    controllerUrl: 'scripts/home/home.controller.js',
                    resolve: resolver()
                })
                ).state('config',
                angularAMD.route({
                    url: '/config/:lang',
                    templateUrl: 'scripts/config/config.html',
                    controller: 'configCtrl',
                    controllerUrl: 'scripts/config/config.controller.js',
                    resolve: resolver()
                }));

            $urlRouterProvider.otherwise('/home');
        });
});