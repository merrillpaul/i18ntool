define(['app'], function (app) {
 'use strict';
  app.service('i18nservice', function () {
        return {
            testme: function () {
                console.log('testme');
                return 'tested';
            }
        };
  });
});