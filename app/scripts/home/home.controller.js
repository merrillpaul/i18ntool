define(['app', 'services/i18nservice'], function (app) {
    'use strict';
    app.controller('homeCtrl', ['$rootScope', '$scope', 'i18nservice', '$window', function ($rootScope, $scope, i18nservice, $window) {
        var modal = angular.element('#askSuffix'), promptModal;
        $rootScope.pageTitle = 'Select Language';
        $rootScope.editing = false;
        $scope.errorNew = false;

        $scope.promptLang = function () {
             $scope.errorNew = false;
             promptModal = new $window.Foundation.Reveal(modal);
             promptModal.open();
        };

        $scope.addLang = function () {
            if ($scope.suffix.trim().length > 0) {
                if (!i18nservice.hasLang($scope.suffix)) {
                    i18nservice.addLang($scope.suffix);
                    $scope.suffix = '';
                    $scope.errorNew = false;
                    if (promptModal) {
                        promptModal.close();
                    }
                } else {
                    $scope.errorNew = true;
                }
            }
        };

        $scope.removeTempLang = function (key) {
            i18nservice.removeTempLang(key);
        };

        $scope.$on('clear-current', function () {
            i18nservice.removeAllTempLangs();
        });

    }]);
});