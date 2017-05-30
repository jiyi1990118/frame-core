/**
 * Created by xiyuan on 17-5-30.
 */

'use strict';

//路由管理器
var routeManage=require('./route/index');


function start() {

    //启动路由监控
    routeManage.watch();
}


module.exports={
    start:start
};