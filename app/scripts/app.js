/*jshint unused: vars */
'use strict';
define(['angularAMD', 'angular-ui-router'], function (angularAMD) {
    
  var app = angular.module('app', [
    'app.routes'
  ]);
  
  return angularAMD.bootstrap(app);
});