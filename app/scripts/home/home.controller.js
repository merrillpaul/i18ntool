define(['app', 'services/i18nservice'], function (app) {
 'use strict';
  app.controller('homeCtrl', function ($scope, $rootScope, i18nservice) {
    $rootScope.pageTitle = 'Select Language';
    $rootScope.editing = false;
    console.log(i18nservice.testme());
    $scope.supportedLanguages = [
        {
            name: 'en',
            hash: 'asdasdasdasdas'
        },
        {
            name: 'fr',
            hash: 'dfasfasfsaafs'
        }
    ];
  });
});