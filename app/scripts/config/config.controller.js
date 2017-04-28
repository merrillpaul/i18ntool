define(['app', 'services/i18nservice'], function (app) {
    'use strict';
    app.controller('configCtrl', ['$scope', '$stateParams', '$rootScope', 'i18nservice', 'jsonInfo',
        function ($scope, $stateParams, $rootScope, i18nservice, jsonInfo) {
            var unregister, register = function () {
                unregister = $scope.$watch(function () {
                    i18nservice.saveDraft($scope.currentLang, $scope.jsonItems);
                });
            };

            console.log('configCtrl injected with jsoninfo', jsonInfo);
            console.log('configCtrl has $rootScope.workingLangs', $rootScope.workingLangs);
            $scope.currentLang = $stateParams.lang;
            $rootScope.pageTitle = '- ' + $scope.currentLang;
            $rootScope.editing = true;
            $scope.jsonItems = i18nservice.getWorkingJson($scope.currentLang);
            register();

            $scope.$on('clear-current', function () {
                unregister();
                i18nservice.removeLang($scope.currentLang);
                $scope.jsonItems = i18nservice.getWorkingJson($scope.currentLang);
                register();
            });
            $scope.$on('download-current', function () {
                i18nservice.downloadCurrent($scope.currentLang, $scope.jsonItems);
            });
        }]);
});