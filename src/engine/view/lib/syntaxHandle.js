/**
 * 语法结构处理
 * Created by xiyuan on 17-5-11.
 */

"use strict";

//语法结构处理类
function structHandle() {
    
}

//结构解析处理
structHandle.prototype.analysis=function () {
    
}

//数据分配
structHandle.prototype.assign=function () {

}

//表达式数据观察
structHandle.prototype.watch=function () {

}

//表达式数据读取
structHandle.prototype.read=function () {

}

module.exports =  function syntaxStructHandle(syntaxStruct,assign,filter) {
    return new structHandle(syntaxStruct);
}