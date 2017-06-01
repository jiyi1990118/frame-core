/**
 * 路由执行
 * Created by xiyuan on 17-5-30.
 */
'use strict';
var routeData=require('./routeData');
var getRouteInfo=require('./getRouteInfo');

var engine=require('../../../engine/index');

var log=require('../../../inside/log/log');
var URL=require('../../../inside/lib/url');
var PATH=require('../../../inside/lib/path');
var frameConf=require('../../../inside/config/index');
var insideEvent=require('../../../inside/event/insideEvent');

var nowInfo=routeData.nowInfo;
var prevInfo=routeData.prevInfo;
var appConf=frameConf.appConf;

var errorMsgs = {
    notPage: '404 Not Found【找不到对应的页面】',
    errTmpl: '错误页面错误【缺失对应的视图或presenter】',
    notOption: '没有找到对应的[错误]视图或presenter'
};

function exec(requestUrl,successCallback,refresh) {

    //提取GET类型参数
    var urlGetParameter = URL.toObject(requestUrl),
        urlGetString = '',
        nowInfoUrl = nowInfo.url,
        routeErrorFlag = false,
        //标识路由是否停止
        isStop=false,
        //提取GET参数字符
        href = requestUrl.replace(/\?[\w\W]*/, function (str) {
            urlGetString = str;
            return '';
        }).replace(/[\/\\]*$/, '');

    //路由开始事件触发
    insideEvent.emit('route:start', {
        //请求的无参数url
        url:href,
        //请求的url
        requestUrl: requestUrl,
        //请求的参数
        parameter:urlGetParameter,
        parameterUrl:urlGetString,
        //当前的url
        nowUrl:nowInfoUrl,
        //路由停止,提供路由拦截
        stop:function () {
            isStop=true;
        }
    });

    //检查路由停止标识
    if(isStop)return;

    //页面地址
    nowInfo.url = requestUrl;
    //路径
    nowInfo.path = href;
    //真实地址
    nowInfo.realPath = requestUrl;
    //路径中的参数
    nowInfo.parameter=urlGetParameter;
    nowInfo.parameterUrl=urlGetString;

    //查询路由是否存在
    var routeInfo = getRouteInfo(nowInfo),
        autoRouteData;

    //检查路由是否存在
    if (!routeInfo) {
        routeErrorFlag = true;

        //路由错误事件触发
        insideEvent.emit('route:error', {
            requestUrl: requestUrl
        });

        //记录错误状态
        routeData.routeState='error';

        href = 'error/msg:' + errorMsgs.notPage;
        nowInfo.path = href;
        nowInfo.url = href;
        //页面后缀
        nowInfo.suffix = routeInfo.suffix;

        //调用错误页面路由
        if (!(routeInfo = getRouteInfo(nowInfo))) {
            log.error(errorMsgs.errTmpl);
            routeInfo = {
                path: nowInfo.path,
                suffix: nowInfo.suffix,
                routeConfig: {}
            }
        } else {
            log.warn(errorMsgs.notOption);
        }
    }


    //检查是匹配的资源是否自动路由
    if (routeInfo.isAutoRoute) {

        var suffix,
            viewUrl,
            presenterUrl;

        autoRouteData = routeInfo.data;

        if (typeof autoRouteData === 'string') {
            //检查是否指定模块,否则直接设置当前路径为模块地址
            if (autoRouteData.indexOf('@') !== -1) {
                autoRouteData = autoRouteData + '@';
            }
            viewUrl = presenterUrl = PATH.normalize(autoRouteData + '/' + routeInfo.path);
        } else {
            presenterUrl = autoRouteData.presenter;

            if (autoRouteData.view) {
                viewUrl = autoRouteData.view;
            } else {
                viewUrl = presenterUrl
            }
            suffix=autoRouteData.suffix;
        }

        routeInfo={
            presenter:presenterUrl,
            view:viewUrl,
            suffix:suffix||routeInfo.suffix
        }
    }

    if (!routeInfo.presenter) {
        log.error('路由必须指定presenter!')
    }

    //生成最终URL路径
    href=nowInfo.path.replace(routeInfo.suffix, '')+routeInfo.suffix+urlGetString

    nowInfo.url = href;

    //页面后缀
    nowInfo.suffix = routeInfo.suffix;

    //检查当前跳转路径和上页面是否同一个路径
    if (nowInfoUrl === href && !refresh)return false;

    //路由开始事件触发
    insideEvent.emit('route:change', {
        //请求的无参数url
        url:href,
        //请求的url
        requestUrl: requestUrl,
        //请求的参数
        parameter:urlGetParameter,
        //当前的url
        nowUrl:nowInfoUrl,
        //路由停止
        stop:function () {
            isStop=true;
        }
    });

    //检查路由停止标识
    if(isStop)return;

    //检测是否返回
    routeData.history.isBack =routeData.history.isBack ? href === prevInfo.url:routeData.history.isBack;

    //路径历史更新
    nowInfo.url = href;
    prevInfo.url = nowInfoUrl;

    //回调处理
    typeof successCallback === 'function' && successCallback(nowInfo);

    //路由成功事件触发
    if(!routeErrorFlag){

        insideEvent.emit('route:success', {
            requestUrl: requestUrl,
            routeInfo: nowInfo
        });
        routeData.routeState='success';

        //赋值页面参数到全局get参数容器中
        window.$_GET=urlGetParameter;
    }

    //页面渲染引擎执行
    engine.exec(routeInfo,nowInfo);

    return nowInfo;
}


module.exports=exec;