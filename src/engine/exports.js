/**
 * 引擎中心
 * Created by xiyuan on 17-5-9.
 */
"use strict";

//视图引擎
var viewEngine=require('./view/exports');


var observer = require('../inside/lib/observer');

module.exports = {
    observer:observer,
    viewEngin:viewEngine
}
