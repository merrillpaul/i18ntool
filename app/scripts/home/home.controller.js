define(['app', 'services/i18nservice'], function (app) {
    'use strict';
    app.controller('homeCtrl', ['$rootScope', '$scope', 'i18nservice', '$window',
        function ($rootScope, $scope, i18nservice, $window) {
            var modal = angular.element('#askSuffix'), promptModal;
            $scope.errorNew = false;

            $scope.promptLang = function () {
                $scope.errorNew = false;
                if (!$scope.isBaseStale()) {
                    promptModal = new $window.Foundation.Reveal(modal);
                    promptModal.open();
                }
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

            $scope.isStale = function (lang) {
                return $rootScope.staleLangs.indexOf(lang) >= 0;
            };

            $scope.isBaseStale = function () {
                return $scope.isStale('en');
            };

            $scope.removeTempLang = function (key) {
                i18nservice.removeTempLang(key);
            };

            $scope.$on('clear-current', function () {
                i18nservice.removeAllTempLangs();
            });            

        }]);
});