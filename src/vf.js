/**
 * Created by xiyuan on 17-5-9.
 */
'use strict';

;(function (vf,exports) {
    if (typeof define === "function" && define.cmd) {
        define(function () {
            return vf;
        })
    } else {
        exports.vf = vf();
    }
})(function () {

    //初始化
    require('./init/index').exec();

    //对外接口
    return require('./interface/index')
},window)