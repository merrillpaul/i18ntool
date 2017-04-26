'use strict';
define([], function () {

    var decode = function (json, items) {

        items = items || [];
        Object.keys(json).forEach(function (key) {
            var val = json[key], innerItems,
                item = {
                    name: key
                };
            if (angular.isString(val)) {
                item.value = val;
            } else {
                innerItems = [];
                decode(val, innerItems);
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
                        } else if (item.value){
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
        prepareMapForDownload: prepareMapForDownload,
        encode: function () {
            console.log('encode');
        }
    };
});