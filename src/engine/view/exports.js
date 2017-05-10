/**
 * 视图引擎
 * Created by xiyuan on 17-5-9.
 */
"use strict";

//虚拟dom
var vdom=require('./lib/vdom');

//语法解析
var syntax=require('./lib/syntax');

//html字符转换成虚拟DOM数据结构
var html2vdom=require('./lib/html2vdom');


//对外提供基础接口
exports.vdom = vdom;
exports.syntax = syntax;
exports.html2vdom = html2vdom;

