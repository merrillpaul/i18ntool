'use strict';
define(['angularAMD', 'angular-ui-router', 'services/i18nservice'], function (angularAMD) {
    angular.module('app.routes', ['ui.router'])
        .config(function ($stateProvider, $urlRouterProvider) {

            var resolver = function () {
                return {
                    supportedLangs: ['$http', function ($http) {
                        return $http.get('data/supportedLangs.json');
                    }],
                    allJsons: ['$http', '$rootScope', '$q', 'supportedLangs',
                        function ($http, $rootScope, $q, supportedLangs) {
                            $rootScope.originalLangs = supportedLangs.data;
                            return $q.all(
                                supportedLangs.data.map(function (lang) {
                                    return $http.get('data/' + lang.key + '.json')
                                    .then( function (res) {
                                        return {
                                            key: lang.key,
                                            json: res.data
                                        };
                                    })
                                    .catch( function () {
                                        return  {
                                            key: lang.key
                                        };
                                    });
                                })
                            );
                        }
                    ],
                    jsonInfo: ['$rootScope', 'allJsons', 'i18nservice',
                        function ($rootScope, allJsons, i18nservice) {
                            $rootScope.originalJsons = allJsons;
                            i18nservice.getWorkingLangs();
                            $rootScope.clearCurrent = function () {
                                $rootScope.$broadcast('clear-current');
                            };
                            $rootScope.downloadCurrent = function () {
                                $rootScope.$broadcast('download-current');
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