'use strict';
require.config({
  urlArgs: "bust=v2",
  waitSeconds: 10,
  paths: {
    angular: "../../bower_components/angular/angular",
    "angular-mocks": "../../bower_components/angular-mocks/angular-mocks",
    "angular-ui-router": "../../bower_components/angular-ui-router/release/angular-ui-router",
    angularAMD: "../../bower_components/angularAMD/angularAMD",
    "foundation-sites": "../../bower_components/foundation-sites/dist/js/foundation",
    jquery: "../../bower_components/jquery/dist/jquery",
    jszip: "../../bower_components/jszip/dist/jszip",
    "file-saver": "../../bower_components/file-saver/FileSaver",
    lodash: "../../bower_components/lodash/lodash"
  },
  shim: {
    angular: {
      exports: "angular"
    },
    angularAMD: [
      "angular"
    ],
    "angular-ui-router": [
      "angular"
    ],
    "angular-mocks": {
      deps: [
        "angular"
      ],
      exports: "angular.mock"
    },
    "file-saver": {

    }
  },
  priority: [
    "angular"
  ],
  deps: [
    "app"
  ],
  packages: [

  ]
});

require([
  'routes'  
]);