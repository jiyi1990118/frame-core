/**
 * Created by xiyuan on 16-1-11.
 */
var errorMsgs = {
    notPage: '404 Not Found【找不到对应的页面】',
    errTmpl: '错误页面模板修改错误【缺失对应的模板或控制器】',
    notOption: '没有找到对应的[错误]模板页面或控制器'
};
/**
 * 路由分配
 * @param requestUrl
 * @returns {boolean}
 */
$routeManage.assign = function (requestUrl,successCallback,refresh) {

    //提取GET类型参数
    var urlGetParameter = $url.urlToObject(requestUrl),
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
    $eventManage.$apply('route:start', {
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
    $configManage.routeState='start';

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
    nowInfo.suffix = $configStroage.routeSuffix;


    //查询路由是否存在
    var routeInfo = $routeManage.routeDns(nowInfo),
        autoRouteData;

    if (!routeInfo) {
        routeErrorFlag = true;
        //路由错误事件触发
        $eventManage.$apply('route:error', {
            requestUrl: requestUrl
        });
        $configManage.routeState='error';

        var href = 'error/msg:' + errorMsgs.notPage;
        nowInfo.path = href;
        nowInfo.url = href;
        //调用错误页面路由
        if (!(routeInfo = $routeManage.routeDns(nowInfo))) {
            $log.warning(errorMsgs.errTmpl);
            routeInfo = {
                path: nowInfo.path,
                suffix: nowInfo.suffix,
                routeConfig: {}
            }
        } else {
            $log.warning(errorMsgs.notOption);
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

    //生成最终URL路径
    href = routeInfo.path.replace(routeInfo.suffix, '') + routeInfo.suffix + urlGetString;
    routeInfo.path = href;

    //检查当前跳转路径和上页面是否同一个路径
    if (nowInfoUrl === href && !refresh)return false;

    //路由开始事件触发
    $eventManage.$apply('route:change', {
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
    $routeManage.history.isBack =$routeManage.history.isBack === null ? href === prevInfo.url:$routeManage.history.isBack;

    //路径历史更新
    nowInfo.url = href;
    prevInfo.url = nowInfoUrl;

    //回调处理
    typeof successCallback === 'function' && successCallback(routeInfo);

    //路由成功事件触发
    if(!routeErrorFlag){

        $eventManage.$apply('route:success', {
            requestUrl: requestUrl,
            routeInfo: routeInfo
        });
        $configManage.routeState='success';

        //获取url中的参数
        window.$_GET=$LIB.$url.urlToObject(window.location.href,true);
    }

    //页面渲染引擎调用
    $Engine(routeInfo);

    return routeInfo;
};
