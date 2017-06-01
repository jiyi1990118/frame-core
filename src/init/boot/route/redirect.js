/**
 * 页面重定向
 * Created by xiyuan on 17-5-30.
 */

'use strict';

var exec=require('./exec');
var URL=require('../../../inside/lib/url');
var PATH=require('../../../inside/lib/path');
var routeData=require('./routeData');
var frameConf=require('../../../inside/config/index');

var appConf=frameConf.appConf;
var insideConf=frameConf.insideConf;

/**
 * 页面重定向
 * @param requestUrl
 * @param arg
 * @param isBack
 * @param refresh
 */
function redirect(requestUrl,arg,isBack,refresh){
    requestUrl=requestUrl.replace(/^\//,'');
    var routeInfo,
        argIndex=0,
        postArg,
        argValue,
        argLen=arguments.length;

    while (++argIndex<argLen && argIndex < 3){
        argValue=arguments[argIndex];
        switch (typeof argValue ){
            case 'object':
                postArg=argValue;
                break;
            default:
                isBack=!!argValue;
                break;
        }
    }

    routeData.history.isBack =isBack;

    //根据请求的地址执行对应的presenter
    exec(requestUrl, function (routeInfo) {

        //并检查是否和上一次路径重复
        if(!routeInfo  && !refresh)return;

        requestUrl = routeInfo.url;

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

    },refresh)
}


module.exports=redirect;