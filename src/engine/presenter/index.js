/**
 * 调度器引擎
 * Created by xiyuan on 17-5-9.
 */
"use strict";

var presenterInterface=require('./presenterInterface');

/**
 * 调度执行
 * @param source
 * @param sourceInfo
 * @param routeInfo
 * @param pathInfo
 */
function presenterExec(source,sourceInfo,routeInfo,pathInfo) {
    // console.log('yes',source,sourceInfo,routeInfo,pathInfo)

    //调度器执行
    source.call(new presenterInterface({
        //参数
        parameter:pathInfo.parameter,
        //当前模块
        module:sourceInfo.module,
        //当前操作(切片)
        slice:sourceInfo.slice,
        //当前资源地址
        url:sourceInfo.url,
        //当前资源路径(不包含文件 module路径、mode类型目录、文件module后缀、文件后缀)
        pathName:sourceInfo.pathName,
        //资源来源地址
        origin:sourceInfo.origin
    },routeInfo.view));
}

module.exports={
    exec:presenterExec
}