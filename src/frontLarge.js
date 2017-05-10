/**
 * Created by xiyuan on 17-5-9.
 */
(function (FL) {
    if (typeof define === "function" && define.cmd) {
        define(function () {
            return FL;
        })
    } else {
        this.FL = FL();
    }
})(function () {
    return require('./engine/exports');
})