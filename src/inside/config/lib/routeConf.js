/**
 * Created by xiyuan on 17-5-31.
 */
'use strict';

var commData=require('./commData');

/**
 * 路由配置
 */
function routeConf() {
    var conf,
        routeFn,
        routeInfo,
        //常规路径
        paths = [],
        //正则路径
        regExpPaths = [],
        //参数路径
        parameterPaths = [],
        //路由path类型(默认常规路由 n, 参数 p, 正则 r)
        routeType = [],
        //父级路由
        routeRoot=this,
        //当前路由解析器
        selfRouteParse = new routeParse();

    //参数归类
    [].slice.call(arguments).forEach(function (arg) {
        if (arg instanceof Array) {
            parameterPaths.push(arg);
            if (routeType.indexOf('p') === -1) routeType.push('p');
        } else if (arg instanceof Function) {
            routeFn = arg;
        } else if (arg instanceof RegExp) {
            regExpPaths.push(arg);
            if (routeType.indexOf('r') === -1) routeType.push('r');
        }else if (typeof arg === 'string') {
            paths.push(arg);
            if (routeType.indexOf('n') === -1) routeType.push('n');
        } else if (arg instanceof Object) {
            conf = arg;
        }
    });

    //路由器信息存储
    selfRouteParse.routeInfo = {
        paths: paths,
        conf:conf,
        regExpPaths: regExpPaths,
        parameterPaths: parameterPaths,
        routeType: routeType.join(''),
        childrenRoute:[]
    };

    //添加并合并子路由信息
    if(routeRoot instanceof routeParse){
        routeRoot.routeInfo.childrenRoute.push(selfRouteParse)
    }else{
        //添加到内部配置中
        commData.insideConf.routeList.push(selfRouteParse);
    }
    //执行路由处理器（子路由回调）
    if (routeFn) routeFn(selfRouteParse);

    return routeRoot instanceof routeParse?routeRoot:selfRouteParse;
};

/**
 * 路由解析
 * @param routeRoot
 */
function routeParse() {
    //路由器信息存储
    this.routeInfo = {};
}

//路由规则配置
routeParse.prototype.when = routeConf;

//当找不到路由,重定向
routeParse.prototype.other = function () {
    return this;
};

//自动路由
routeParse.prototype.autoRoute = function (option) {
    this.routeInfo.autoRoute = option;
    return this;
};

//路由拦截器
routeParse.prototype.interceptor = function () {
    return this;
};

//路由路径后缀
routeParse.prototype.suffix = function (suffix) {
    if(typeof suffix === 'string') this.routeInfo.suffix = suffix;
    return this;
};


module.exports = routeConf;