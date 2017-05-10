/**
 * 视图引擎
 * Created by xiyuan on 17-5-9.
 */
"use strict";

//虚拟dom
var vdom=require('./vdom/vdom');

//语法解析
var syntax=require('./syntax/syntax');

//html字符转换成虚拟DOM数据结构
var html2vdom=require('./html2vdom/html2vdom');

var observer=require('../../inside/observer/observer');

module.exports = vdom