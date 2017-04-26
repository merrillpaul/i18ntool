define(['app', './codec', 'jszip', 'file-saver'], function (app, codec, JSZip) {
    'use strict';
    app.service('i18nservice', ['$rootScope', '$window', function ($rootScope, $window) {
        var WORKING_LANG_KEY = 'workingLangs',
            WORKING_JSON = 'workingJson_',
            workingLangs = function () {
                var originalLangs = $rootScope.originalLangs,
                    workingLangs;

                if (localStorage.getItem(WORKING_LANG_KEY) === null) {
                    localStorage.setItem(WORKING_LANG_KEY, JSON.stringify(originalLangs));
                }
                workingLangs = JSON.parse(localStorage.getItem(WORKING_LANG_KEY));

                $rootScope.workingLangs = workingLangs;
                return workingLangs;
            },
            mergeToBaseJson = function (lang) {
                var workingJson = localStorage.getItem(WORKING_JSON + lang),
                    baseJson, targetJson;
                if (!workingJson) {
                    baseJson = $rootScope.originalJsons.find(function (it) { return it.key === 'en'; }).json;
                    targetJson = $rootScope.originalJsons.find(function (it) { return it.key === lang; }).json;
                    workingJson = codec.mergeFromBase(lang, baseJson, targetJson);
                    localStorage.setItem(WORKING_JSON + lang, angular.toJson(workingJson));
                } else {
                    workingJson = JSON.parse(workingJson);
                }
                return workingJson;
            };

        return {

            getWorkingLangs: workingLangs,

            hasLang: function (lang) {
                return $rootScope.workingLangs.map(function (it) { return it.key; }).indexOf(lang) >= 0;
            },

            removeAllTempLangs: function () {
                var workingLangs = JSON.parse(localStorage.getItem(WORKING_LANG_KEY));
                workingLangs.filter(function (it) {
                    return it.hash === null;
                }).forEach(function (element) {
                    this.removeTempLang(element.key);
                }, this);
            },

            removeLang: function (lang) {
                var currentWorkingLang = $rootScope.workingLangs.find(function (it) {
                    return it.key === lang;
                });
                if (currentWorkingLang.hash === null) {
                    this.removeTempLang(currentWorkingLang.key);
                } else {
                    localStorage.removeItem(WORKING_JSON + lang);
                }
            },

            addLang: function (suffix) {
                var workingLangs = JSON.parse(localStorage.getItem(WORKING_LANG_KEY));
                workingLangs.push({
                    key: suffix,
                    hash: null
                });
                localStorage.setItem(WORKING_LANG_KEY, JSON.stringify(workingLangs));
                localStorage.setItem(WORKING_JSON + suffix, JSON.stringify(codec.cloneBase(
                    $rootScope.originalJsons.find(function (it) { return it.key === 'en'; }).json
                )).replace(/\/en.json/g, '/' + suffix + '.json')
                );
                $rootScope.workingLangs = workingLangs;
            },

            removeTempLang: function (suffix) {
                var workingLangs = JSON.parse(localStorage.getItem(WORKING_LANG_KEY));
                workingLangs = workingLangs.filter(function (it) {
                    return it.key !== suffix;
                });
                localStorage.setItem(WORKING_LANG_KEY, JSON.stringify(workingLangs));
                localStorage.removeItem(WORKING_JSON + suffix);
                $rootScope.workingLangs = workingLangs;
            },


            getDecodedJson: function (lang) {
                return JSON.parse(localStorage.getItem(WORKING_JSON + lang));
            },



            getWorkingJson: function (lang) {
                var currentWorkingLang = $rootScope.workingLangs.find(function (it) {
                    return it.key === lang;
                });
                if (currentWorkingLang) {
                    if (currentWorkingLang.hash === null) {
                        return JSON.parse(
                            localStorage.getItem(WORKING_JSON + lang)
                        );
                    } else {
                        return mergeToBaseJson(lang);
                    }
                } else {
                    return null;
                }
            },

            saveDraft: function (lang, json) {
                localStorage.setItem(WORKING_JSON + lang, angular.toJson(json));
            },

            downloadCurrent: function (lang, jsonItems) {
                var dlMap = codec.prepareMapForDownload(jsonItems),
                    zip = new JSZip();
                
                zip = zip.folder('app');
                Object.keys(dlMap).forEach(function (key) {
                    var json = angular.toJson(dlMap[key], true),
                        finalFile = zip;
                    key.split('/').forEach(function (folderName) {
                        if (folderName.endsWith('.json')) {
                            finalFile = finalFile.file(folderName, json);
                        } else {
                            finalFile = finalFile.folder(folderName);
                        }
                    });
                });
                zip.generateAsync({ type: 'blob' })
                    .then(function (content) {
                        $window.saveAs(content, lang + '_i18njson.zip');
                    });
            }

        };
    }]);
});