/**
 * Created by xiyuan on 17-5-9.
 */
(function (engine) {
    if (typeof define === "function" && define.cmd) {
        define(engine)
    } else {
        this.engine = engine();
    }
})(function () {

    return function engine() {
        console.log('yes')
    }

})
