define(['app', './codec', 'jszip', 'file-saver'], function (app, codec, JSZip) {
    'use strict';
    app.service('i18nservice', ['$rootScope', '$window', '$http', '$q',
        function ($rootScope, $window, $http, $q) {
            var WORKING_LANG_KEY = 'workingLangs',
                WORKING_JSON = 'workingJson_',
                workingLangs = function () {
                    var originalLangs = $rootScope.originalLangs,
                        workingLangKey = localStorage.getItem(WORKING_LANG_KEY),
                        workingLangs;

                    if (!workingLangKey) {
                        localStorage.setItem(WORKING_LANG_KEY, JSON.stringify(originalLangs));
                    } 
                    workingLangs = JSON.parse(workingLangKey);
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

                getSupportedLangs: function () {
                    var promise = $q.defer(),
                        that = this,
                        rejection = function (err) {
                            promise.reject(err);
                        };
                    $http.get('data/supportedLangs.json?_q=' + Date.now())
                        .then(function (res) {
                            var staleLangs;
                            $rootScope.originalLangs = res.data;
                            staleLangs = that.checkStaleLangs();
                            $q.all(
                                res.data.map(function (lang) {
                                    var url = 'data/' + lang.key + '.json';
                                    if (staleLangs.indexOf(lang.key) >= 0) {
                                        // bust the cache
                                        url += '?_dt=' + Date.now();
                                    }
                                    return $http.get(url)
                                        .then(function (res) {
                                            return {
                                                key: lang.key,
                                                json: res.data
                                            };
                                        })
                                        .catch(function () {
                                            return {
                                                key: lang.key
                                            };
                                        });
                                })
                            )
                                .then(function (res) {
                                    $rootScope.originalJsons = res;
                                    promise.resolve(res);
                                })
                                .catch(rejection);
                        })
                        .catch(rejection);
                    return promise;
                },

                resetAll: function () {

                },

                resetStale: function () {
                    var anyNewLangs = $rootScope.workingLangs.filter(function (it) { return it.hash === null; }),
                    baseLang = $rootScope.originalLangs.find(function (it) {
                            return it.key === 'en';
                        }),
                        that = this;
                   
                    // removing the supported langs from storage and reseting it
                    localStorage.removeItem(WORKING_LANG_KEY);
                    workingLangs();
                    this.removeAllTempLangs();

                    $rootScope.staleLangs.forEach(function (it) {
                        localStorage.removeItem(WORKING_JSON + it);
                    });
                    // setting proper original hash for any new langs
                    anyNewLangs.forEach(function (it) {
                        it.originalHash = baseLang.hash;
                        that.addLang(it.key);
                    });   


                    $rootScope.staleLangs = [];
                    $rootScope.displayError = $rootScope.staleLangs.length > 0;
                },

                checkStaleLangs: function () {
                    var prevSupportedLangs,
                        enLang = $rootScope.originalLangs.find(function (it) {
                            return it.key === 'en';
                        });
                    if (localStorage.getItem(WORKING_LANG_KEY) !== null) {
                        prevSupportedLangs = JSON.parse(localStorage.getItem(WORKING_LANG_KEY));
                    }
                    $rootScope.staleLangs = [];
                    if (prevSupportedLangs) {
                        prevSupportedLangs.forEach(function (prevLang) {

                            var currentLang = $rootScope.originalLangs.find(function (it) {
                                return it.key === prevLang.key;
                            });
                            if (currentLang && currentLang.hash !== prevLang.hash) {
                                $rootScope.staleLangs.push(prevLang.key);
                            } else if (prevLang.hash === null && prevLang.originalHash !== enLang.hash) { // for any newly added lang which was based on en and the original itself changed
                                $rootScope.staleLangs.push(prevLang.key);
                            }
                        });
                    }
                    $rootScope.displayError = $rootScope.staleLangs.length > 0;
                    this.getWorkingLangs();
                    return $rootScope.staleLangs;
                },

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
                    var workingLangs = JSON.parse(localStorage.getItem(WORKING_LANG_KEY)),
                    enLang = $rootScope.originalLangs.find(function (it) {
                        return it.key === 'en';
                    });
                    workingLangs.push({
                        key: suffix,
                        hash: null,
                        originalHash: enLang.hash
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