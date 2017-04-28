var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    // Removed "Spec" naming from files
    if (/Spec\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/app/scripts',

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
        'angular' : {'exports' : 'angular'},
        'angular-mocks': {
          deps:['angular'],
          'exports':'angular.mock'
        }
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});
