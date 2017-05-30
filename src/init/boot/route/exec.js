/**
 * 路由执行
 * Created by xiyuan on 17-5-30.
 */
'use strict';
var log=require('../../../inside/log/log')
var routeData=require('./routeData');
var getRouteInfo=require('./getRouteInfo');
var URL=require('../../../inside/lib/url');
var PATH=require('../../../inside/lib/path');
var frameConf=require('../../../inside/config/index');
var insideEvent=require('../../../inside/event/insideEvent');

var nowInfo=routeData.nowInfo;
var appConf=frameConf.appConf;

var errorMsgs = {
    notPage: '404 Not Found【找不到对应的页面】',
    errTmpl: '错误页面模板修改错误【缺失对应的模板或控制器】',
    notOption: '没有找到对应的[错误]模板页面或控制器'
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
    nowInfo.url = href;
    //路径
    nowInfo.path = href;
    //真实地址
    nowInfo.realPath = requestUrl;
    //路径中的参数
    nowInfo.parameter=urlGetParameter;
    //页面后缀
    nowInfo.suffix = appConf.route.suffix;

    //查询路由是否存在
    var routeInfo = getRouteInfo(nowInfo),
        autoRouteData;

    //检查是否
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
        //调用错误页面路由
        if (!(routeInfo = exec(nowInfo))) {
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
    if (autoRouteData = routeInfo.data) {
        //解析自动路由参数
        var viewUrl,
            controllerUrl,
            viewConfig,
            $info = routeInfo.info,
            lowerUrl = $info.lowerUrl.replace($info.suffix, '').replace(/^[\/\\]*/, ''),
            // isModule = autoRouteData.indexOf('@') > -1;
            isModule = autoRouteData.match(/\@(?!zip)/);
        switch (typeof autoRouteData) {
            case 'string':
                viewUrl = autoRouteData + (isModule ? '/' : '@') + lowerUrl;
                viewUrl = viewUrl.replace(/\/([\w-]+)$/, ':$1');
                controllerUrl = viewUrl;
                break;
            case 'function':
                autoRouteData = autoRouteData(lowerUrl, $info.parameter);
            case 'object':
                viewUrl = autoRouteData.view || (autoRouteData.viewDir ? autoRouteData.viewDir + '/' + lowerUrl : '');
                controllerUrl = autoRouteData.controller || (autoRouteData.controllerDir ? $path.normalize(autoRouteData.controllerDir + '/' + lowerUrl).replace(/\/([\w-]+)$/, ':$1') : '');
                if (viewConfig = autoRouteData.viewConfig) {
                    //组装视图配置回调参数
                    viewUrl = function (suffix, requireType, url) {
                        return function ($view) {
                            $view({
                                suffix: suffix,
                                requireType: requireType
                            });
                            return url;
                        }
                    }(viewConfig.suffix, viewConfig.requireType, viewUrl)
                }
                break;
        }

        routeInfo = {
            path: routeInfo.path,
            suffix: $info.suffix,
            parameter: $info.parameter,
            routeConfig: {
                view: viewUrl,
                controller: controllerUrl
            }
        }

    }

}


module.exports=exec;