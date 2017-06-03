/**
 * 调度器引擎
 * Created by xiyuan on 17-5-9.
 */
"use strict";

var log=require('../../inside/log/log');
var presenterEngine=require('./presenterInterface');

module.exports={
    exec:presenterEngine.presenterExec
}