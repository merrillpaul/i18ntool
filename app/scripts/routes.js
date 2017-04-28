'use strict';
define(['angularAMD', 'angular-ui-router', 'services/i18nservice'], function (angularAMD) {
    angular.module('app.routes', ['ui.router'])
        .config(function ($stateProvider, $urlRouterProvider) {

            var resolver = function () {
                return {

                    supportedLangs: ['$http', '$rootScope', function ($http, $rootScope) {
                        $rootScope.staleLangs = [];
                        console.log('routes.js Getting supported langs');
                        return $http.get('data/supportedLangs.json?_q=' + Date.now());
                    }],

                    allJsons: ['$http', '$rootScope', '$q', 'i18nservice', 'supportedLangs',
                        function ($http, $rootScope, $q, i18nservice,  supportedLangs) {
                            $rootScope.originalLangs = supportedLangs.data;
                            console.log('routes.js Getting all Jsons');
                            $rootScope.staleLangs = i18nservice.checkStaleLangs();

                            return $q.all(
                                supportedLangs.data.map(function (lang) {
                                    var url = 'data/' + lang.key + '.json';
                                    if ($rootScope.staleLangs.indexOf(lang.key) >= 0) {
                                        // bust the cache
                                        url += '?_dt=' + Date.now();
                                    }
                                    return $http.get(url)
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
                    jsonInfo: ['$rootScope', '$timeout', '$state', 'i18nservice', 'allJsons',
                        function ($rootScope, $timeout, $state, i18nservice, allJsons) {
                            $rootScope.originalJsons = allJsons;
                            i18nservice.getWorkingLangs();
                            console.log('route Got in json info all jsons', allJsons);
                            
                            $rootScope.clearCurrent = function () {
                                $rootScope.$broadcast('clear-current');
                            };
                            $rootScope.downloadCurrent = function () {
                                $rootScope.$broadcast('download-current');
                            };
                            $rootScope.resetStale = function () {
                                $timeout(function () {
                                    i18nservice.resetStale();
                                }, 1);
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