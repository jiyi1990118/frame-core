/**
 * Created by xiyuan on 17-5-9.
 */
(function (vf) {
    if (typeof define === "function" && define.cmd) {
        define(function () {
            return vf;
        })
    } else {
        this.vf = vf();
    }
})(function () {
    return require('./engine/exports');
})