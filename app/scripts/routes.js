'use strict';
define(['angularAMD', 'angular-ui-router'], function (angularAMD) {
    angular.module('app.routes', ['ui.router'])
        .config(function ($stateProvider, $urlRouterProvider) {

            $stateProvider
                .state('home',
                    angularAMD.route({
                        url: '/home',
                        templateUrl: 'scripts/home/home.html',
                        controller: 'homeCtrl',
                        controllerUrl: 'scripts/home/home.controller.js'
                    })
                ).state('config', 
                    angularAMD.route({
                        url: '/config/:lang',
                        templateUrl: 'scripts/config/config.html',
                        controller: 'configCtrl',
                        controllerUrl: 'scripts/config/config.controller.js'
                    }));

            $urlRouterProvider.otherwise('/home');
        });
});