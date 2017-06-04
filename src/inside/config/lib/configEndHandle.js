/**
 * Created by xiyuan on 17-5-31.
 */

'use strict';
var string = require('../../../inside/lib/string');
var commData = require('../../../inside/config/lib/commData');

//内部配置
var insideConf = commData.insideConf;

function configEndHandle() {

    //格式化后的路由存储
    var routeMaps = {
            paths: [],
            regExpPaths: [],
            parameterPaths: []
        },
        suffix = commData.appConf.route.suffix;

    //格式化route路由数据
    insideConf.routeList.forEach(function (route) {
        routeFormat(route, {
            childrenRoute: routeMaps,
            suffix: suffix.charAt(0) === '.' ? suffix : '.' + suffix
        })
    });

    delete insideConf.routeList;

    //路由字典
    insideConf.routeMaps = routeMaps;

    //启动合并自定义配置 开启可用配置
    var customConf=commData.customConf,
        useConf=commData.customUseConf,
        commConf=customConf.comm;

    Object.keys(commConf).forEach(function (key) {
        useConf[key]=commConf[key];
    });

    commData.appConf.loadConfMode.forEach(function (mode) {
        if(customConf[mode] instanceof  Object){
            Object.keys(customConf[mode]).forEach(function (key) {
                useConf[key]= customConf[mode][key];
            })
        }
    })
}

//路由格式化
function routeFormat(route, parentInfo) {

    var nowInfo,
        suffix,
        routeInfo = route.routeInfo;

    //检查当前是否配置规则
    if (parentInfo && !routeInfo.routeType) {
        nowInfo = parentInfo
    } else {
        suffix=routeInfo.conf.suffix = routeInfo.conf.suffix || parentInfo.suffix;
        nowInfo = {
            paths: [],
            regExpPaths: [],
            parameterPaths: [],
            childrenRoute: {
                paths: [],
                regExpPaths: [],
                parameterPaths: [],
            },
            routeType: routeInfo.routeType,
            //检查路由后缀
            suffix: routeInfo.conf.suffix =suffix.charAt(0) === '.' ? suffix : '.' + suffix
        }
    }

    //检查是否拥有配置规则
    if (routeInfo.routeType) {

        //对常规路由进行长度排序
        nowInfo.paths = (nowInfo.paths.concat(routeInfo.paths).sort(function (berfor, after) {
            return berfor.length - after.length;
        })).reduce(function (res, rule) {
            res.push({
                rule: rule,
                conf: routeInfo.conf,
                autoRoute: routeInfo.autoRoute,
                childrenRoute: nowInfo.childrenRoute
            });
            return res;
        }, []);

        //参数路由规则
        nowInfo.parameterPaths = nowInfo.parameterPaths.concat(routeInfo.parameterPaths).reduce(function (res, rule) {
            var pathStr = rule[0],
                parameter = rule[1],
                regExpStr = '',
                _regExpStr,
                parKey,
                parVal,
                parameterMap = {},
                stringMatch;

            //分解参数路由中的参数标识
            while (stringMatch = pathStr.match(/\{\s*([\w$-]+)\s*\}/)) {
                _regExpStr = pathStr;

                pathStr = pathStr.slice(stringMatch.index + stringMatch[0].length);
                parKey = stringMatch[1];

                //检查参数标识是否存在回调中
                parVal = parameter[parKey]
                if (parVal) {
                    //检查参数匹配类型
                    if (typeof parVal === 'string') {
                        regExpStr += _regExpStr.slice(0, stringMatch.index) + parVal;
                    } else if (parVal instanceof RegExp) {
                        regExpStr += _regExpStr.slice(0, stringMatch.index) + parVal.source;
                    }
                    parameterMap[parKey] = {
                        index: stringMatch.index,
                        rule: parVal
                    }
                }
            }

            res.push({
                rule: new RegExp('^' + regExpStr + pathStr + '$'),
                parameter: parameterMap,
                conf: routeInfo.conf,
                autoRoute: routeInfo.autoRoute,
                childrenRoute: nowInfo.childrenRoute
            });
            return res;
        }, []);

        //正则路由规则
        nowInfo.regExpPaths = nowInfo.regExpPaths.concat(routeInfo.regExpPaths).reduce(function (res, rule) {
            res.push({
                rule: new RegExp('^' + rule.source.replace(/^\^/, '').replace(/\$$/, '') + '$'),
                conf: routeInfo.conf,
                autoRoute: routeInfo.autoRoute,
                childrenRoute: nowInfo.childrenRoute
            });
            return res;
        }, []);
    }

    //遍历子路由
    routeInfo.childrenRoute.forEach(function (childRoute) {
        routeFormat(childRoute, nowInfo);
    });

    //添加到父路由中
    if (parentInfo && routeInfo.routeType) {
        var childrenRoute = parentInfo.childrenRoute;
        childrenRoute.paths = childrenRoute.paths.concat(nowInfo.paths);
        childrenRoute.regExpPaths = childrenRoute.regExpPaths.concat(nowInfo.regExpPaths);
        childrenRoute.parameterPaths = childrenRoute.parameterPaths.concat(nowInfo.parameterPaths);
    }

    nowInfo.forEach(function (key) {
        delete nowInfo[key];
    });

    routeInfo.forEach(function (key) {
        delete routeInfo[key];
    });

}


module.exports = configEndHandle;