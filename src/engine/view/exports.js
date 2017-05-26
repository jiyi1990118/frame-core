/**
 * 视图引擎
 * Created by xiyuan on 17-5-9.
 */
"use strict";

//虚拟dom
var vdom = require('./lib/vdom');

//语法解析
var syntaxStruct = require('./lib/syntaxStruct');

//语法结构处理
var syntaxHandle = require('./lib/syntaxHandle');

//html字符转换成虚拟DOM数据结构
var html2vdom = require('./lib/html2vdom');

//组件管理
var compMange=require('./lib/componentManage');

//指令管理
var directiveMange=require('./lib/directiveManage');

/**
 * 视图渲染
 * @param html      html元素 或 html字符串
 * @param scope     [作用域]
 * @param filter    [过滤器]
 */
function render(html, scope, filter) {
    return html2vdom(html)
}

//虚拟Dom或实体Dom销毁
function destroy(vnode) {

}


//对外提供基础接口
exports.vdom = vdom;
exports.html2vdom = html2vdom;
exports.syntaxStruct = syntaxStruct;
exports.syntaxHandle = syntaxHandle;

exports.componentMange = compMange;
exports.directiveMange = directiveMange;

//对外提供视图渲染接口
exports.render = render;

//对外提供视图销毁接口
exports.destroy=destroy;

