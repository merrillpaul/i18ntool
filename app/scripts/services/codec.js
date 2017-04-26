'use strict';
define(['lodash'], function (_) {

    var BASE_MARKER = '#!#',
        decode = function (json, items, valueModifier) {
        items = items || [];
        Object.keys(json).forEach(function (key) {
            var val = json[key], innerItems,
                item = {
                    name: key
                };
            if (angular.isString(val)) {
                item.value = val;
                if (valueModifier) {
                    valueModifier(item);
                }
            } else {
                innerItems = [];
                decode(val, innerItems, valueModifier);
                item.items = innerItems;
            }
            items.push(item);
        });
        return items;
    },
        prepareMapForDownload = function (jsonItems) {
            var downloadMap = {},
                finalMap = {},
                visitor = function (items, dMap) {
                    items.forEach(function (item) {
                        var inMap;
                        dMap[item.name] = {};
                        if (item.items) {
                            visitor(item.items, dMap[item.name]);
                        } else if (item.value) {
                            if (item.name === 'srcFile') {
                                inMap = Object.assign({}, dMap);
                                delete inMap.srcFile;
                                finalMap[item.value] = inMap;
                                dMap[item.name] = item.value;
                            } else {
                                dMap[item.name] = item.otherValue || null;
                            }
                        }
                    });
                };
            visitor(jsonItems, downloadMap);
            return finalMap;
        };


    return {
        decode: decode,
        cloneBase: function (enJson) {
            var cloned = decode(enJson);
            return cloned;
        },
        mergeFromBase: function (lang, _baseJson, _targetJson) {
            var baseJson = _.cloneDeep(_baseJson),
                originalConvertedTargetJson = _.cloneDeep(_baseJson),
                targetJson = _.cloneDeep(_targetJson),
                convertedBaseJson,
                convertedTargetJson, markOriginal;
            
            // to mark en to find out which was added from en to the lang jsons
            markOriginal = function (json, key) {               
                if (angular.isString(json[key])) {
                    json[key] += BASE_MARKER;
                } else {
                    Object.keys(json[key]).forEach(function (k) {
                        markOriginal(json[key], k);
                    });
                }
            };
            Object.keys(originalConvertedTargetJson).forEach(function (k) {
                markOriginal(originalConvertedTargetJson, k);
            });
            ////////////////////////////////////////////////////////////////////
            
            _.merge(originalConvertedTargetJson, targetJson);
            convertedBaseJson = decode(baseJson, null, function (item) {
                if (item.name === 'srcFile') {
                    item.value = item.value.replace('/en.json', '/' + lang + '.json');
                }
                delete item.otherValue;
            });

            convertedTargetJson = decode(originalConvertedTargetJson, null, function (item) {
                if (item.value && item.value.endsWith(BASE_MARKER)) {
                    item.otherValue = null;
                } else {
                    item.otherValue = item.value;
                }
                delete item.value;
            });
            _.merge(convertedTargetJson, convertedBaseJson);
            return convertedTargetJson;
        },
        prepareMapForDownload: prepareMapForDownload
    };
});