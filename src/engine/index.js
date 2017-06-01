/**
 * 引擎中心
 * Created by xiyuan on 17-5-9.
 */
"use strict";

//视图引擎
var viewEngin=require('./view/exports');

//资源获取
var getSource=require('../inside/source/getSource');

/**
 * 引擎运行器
 * @param routeInfo 路由信息
 * @param pathInfo 路径信息
 */
function enginExec(routeInfo,pathInfo) {
    // console.log(routeInfo,pathInfo)

    //获取调度器资源
    getSource(routeInfo.presenter, {
        mode:'presenter'
    },function () {

    });


}







module.exports = {
    //视图引擎
    viewEngin:viewEngin,
    //引擎执行器
    exec:enginExec
}
