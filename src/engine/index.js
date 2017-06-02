/**
 * 引擎中心
 * Created by xiyuan on 17-5-9.
 */
"use strict";

//视图引擎
var viewEngin=require('./view/exports');

//资源获取
var getSource=require('../inside/source/getSource');
var presenterEngine=require('./presenter/index');

/**
 * 引擎运行器
 * @param routeInfo 路由信息
 * @param pathInfo 路径信息
 */
function engineExec(routeInfo,pathInfo) {

    //获取调度器资源
    getSource(routeInfo.presenter, {
        mode:'presenter'
    },function (source,info) {
        //调度器执行
        presenterEngine.exec(source,info,routeInfo,pathInfo);
    });
}

module.exports = {
    //视图引擎
    viewEngin:viewEngin,
    //引擎执行器
    exec:engineExec
}
