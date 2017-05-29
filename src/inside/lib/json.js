/**
 * Created by xiyuan on 17-3-7.
 */
"use strict";

//把对象转换成json字符串
exports.stringify = function (obj) {
    var TmpArray = [];
    for (var i in obj) {
        obj[i] = typeof obj[i] === 'string' ? '"' + (obj[i].replace(/"/g, '\\"')) + '"' : (typeof obj[i] === 'object' ? stringify(obj[i]) : obj[i]);
        TmpArray.push(i + ':' + obj[i]);
    }
    return '{' + TmpArray.join(',') + '}';
};

//把字符串解析成对象
exports.parse = function (str) {
    if (typeof (str) === 'object') {
        return str;
    } else {
        try {
            var json = new Function("return " + str)();
        }
        catch (e) {
            return str;
        }
        return json;
    }
};
