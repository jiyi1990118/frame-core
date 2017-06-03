/**
 * Created by xiyuan on 17-5-30.
 */

'use strict';

//路由管理器
var routeManage=require('./route/index');

var exec=require('./route/exec');

var routeData=require('./route/routeData');

var URL=require('../../inside/lib/url');

var PATH=require('../../inside/lib/path');

var pathConvert=require('./route/pathConvert');

var appConf=require('../../inside/config/lib/commData').appConf;

var getPathNormalize=pathConvert.getNowPath;

var getRoutePathInfo=pathConvert.getRoutePathInfo;

function start() {
    var routePathInfo;

    //启动路由监控
    routeManage.watch();

    //系统初始化页面跳转定位 [已有的路径与默认的路由路径]
    if(appConf.route.mode === 'html5' || !window.location.hash.match(/^#!\/[^\s]+/)){

        if(!appConf.route.defaultUrl)return;

        routePathInfo=exec(appConf.route.defaultUrl);

        //获取默认路径
        var href=routePathInfo.url;

        if(appConf.route.mode=== 'html5'){
            var pageUrl = PATH.resolve(href);
            //添加新的历史记录
            window.history.pushState({
                "target": href
            }, null, pageUrl);

        }else{
            //通知hash监听器当前跳转不需要做处理
            routeData.hashListener=false;
            URL.hash('!/' + href);
        }
    }else{
        exec(getPathNormalize(appConf.route.mode),function (routeInfo) {

            //并检查是否和上一次路径重复
            if(!routeInfo  && !refresh)return;

            var requestUrl = routeInfo.url;

            //检查当前模式
            if (appConf.route.mode === 'html5') {
                var pageUrl = PATH.resolve(requestUrl, insideConf.rootPath);
                //添加新的历史记录
                window.history.pushState({
                    "target": requestUrl
                }, null, pageUrl);
            } else {
                //通知hash监听器当前跳转不需要做处理
                routeData.hashListener = false;
                URL.hash('!/' + requestUrl);
            }

        });
    }
}


module.exports={
    start:start
};