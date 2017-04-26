define(['app', 'services/i18nservice'], function (app) {
    'use strict';
    app.controller('configCtrl', ['$scope', '$stateParams', '$rootScope', 'i18nservice',
        function ($scope, $stateParams, $rootScope, i18nservice) {
            $scope.currentLang = $stateParams.lang;
            $rootScope.pageTitle = 'For ' + $scope.currentLang;
            $rootScope.editing = true;
            $scope.jsonItems = i18nservice.getWorkingJson($scope.currentLang);

            $scope.$watch(function () {
                i18nservice.saveDraft($scope.currentLang, $scope.jsonItems);
            });

            $scope.$on('clear-current', function () {
                console.log('Clear current in config', $scope.currentLang);
            });
            $scope.$on('download-current', function () {
                i18nservice.downloadCurrent($scope.currentLang, $scope.jsonItems);
            });
        }]);
});