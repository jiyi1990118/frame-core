(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e)
            }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s
})({
    1: [function(require, module, exports) {
        /**
         * 引擎中心
         * Created by xiyuan on 17-5-9.
         */
        "use strict";

        //视图引擎
        var viewEngine = require('./view/exports');

        module.exports = {
            viewEngin: viewEngine
        }

    }, {
        "./view/exports": 2
    }],
    2: [function(require, module, exports) {
        /**
         * 视图引擎
         * Created by xiyuan on 17-5-9.
         */
        "use strict";



        module.exports = {
            viewEngin: viewEngine
        }
    }, {}],
    3: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-9.
         */
        (function(FL) {
            if (typeof define === "function" && define.cmd) {
                define(FL)
            } else {
                this.FL = FL();
            }
        })(function() {
            return require('./engine/exports');
        })
    }, {
        "./engine/exports": 1
    }]
}, {}, [3]);