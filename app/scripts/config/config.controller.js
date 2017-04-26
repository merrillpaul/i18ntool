define(['app', 'services/i18nservice'], function (app) {
    'use strict';
    app.controller('configCtrl', ['$scope', '$stateParams', '$rootScope', 'i18nservice',
        function ($scope, $stateParams, $rootScope, i18nservice) {
            var unregister, register = function () {
                unregister = $scope.$watch(function () {
                    i18nservice.saveDraft($scope.currentLang, $scope.jsonItems);
                });
            };
            $scope.currentLang = $stateParams.lang;
            $rootScope.pageTitle = 'For ' + $scope.currentLang;
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