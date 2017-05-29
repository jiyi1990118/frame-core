/**
 * Created by xiyuan on 15-12-4.
 */
/**
 * 路由拦截器
 * @param routeResult
 * @param requestUrlInfo
 * @returns {boolean}
 */
function routeInterceptor(routeResult,requestUrlInfo) {
    //路由拦截器检查
    var interceptor = routeResult.routeConfig;
    if (interceptor && typeof (interceptor = interceptor.interceptor) === 'function') {
        if (interceptor(requestUrlInfo) !== false) {
            return true;
        }
    } else {
        return true;
    }
    return false
}


/*路由查询*/
$routeManage.routeDns = function (nowInfo) {

    var requestUrlInfo = $object.clone(nowInfo),
        autoRoutesLength,
        autoRoutes = [], //自动路由存储
        routeData = routeHandle($configStroage.routeList, nowInfo, autoRoutes, requestUrlInfo);//查找对应的路由

    //初始路由参数
    nowInfo.parameter = requestUrlInfo.parameter = nowInfo.parameter || {};

    //检查路由配置是否能匹配
    if (!routeData && (autoRoutesLength = autoRoutes.length)) {
        var i = ~0, v, _routes = {}, size, type, _sortArray = [];
        while (++i < autoRoutesLength) {
            v = autoRoutes[i];
            type = v.type;
            size = v.info.lowerUrl.length;
            _routes[size] = _routes[size] || {};
            _routes[size][type] = _routes[size][type] || v;
            _sortArray.push(size);
        }
        //找出匹路径最多的自动路由
        _routes = _routes[_sortArray.sort(function (a, b) {
            return a - b;
        })[0]];

        //找出适合的路由
        routeData = _routes.a || _routes.b || _routes.c;
    }

    //写入当前路由地址
    routeData && (routeData.path = nowInfo.path);

    return routeData;
};

//去掉路径前根符号正则
var pathRootRegexp = /^[\/\\]*/;

//用来递归处理常规路由和正则路由
function routeHandle(routeList, nowInfo, autoRoutes, requestUrlInfo) {
    var routeDnsResult = queryRoute(routeList, nowInfo, null, autoRoutes,requestUrlInfo),
        routeResult = routeDnsResult.routeResult,
        i = ~0, l, routeMap, slice;

    //检查常规路由是否匹配到路径
    if (routeResult) return routeResult;

    //检查正则路由中是 否匹配到路径
    routeDnsResult = complexQueryRout(routeDnsResult.routeStroage, autoRoutes, requestUrlInfo);

    if (routeResult = routeDnsResult.routeResult) {
        return routeResult;
    }

    //重新解析
    routeMap = routeDnsResult.routeMap;
    l = routeMap.length;
    while (++i < l) {
        slice = routeMap[i];
        routeResult = routeHandle(slice.routeList, slice.nowInfo, autoRoutes, requestUrlInfo);
        if (routeResult) {
            return routeResult;
        }
    }
};

/*查询路由【主要用解析常规路由和查找正则和参数路由器到缓存容器中，提供后续正则、参数DNS路由器解析】*/
function queryRoute(routeList, nowInfo, routeStroage, autoRoutes,requestUrlInfo) {

    //路由记录缓存容器（提供后续匹配正则）
    routeStroage = routeStroage || {
            regexp: [],
            parameter: []
        };

    //配置中的路由信息
    var rl = routeList.length,
        ri = ~0,
        //路径
        url = nowInfo.url.replace(pathRootRegexp, ''),
        //下级URL
        lowerUrl,
        //路由信息
        routeInfo,
        //路径集合
        path,
        //自动路由
        autoRoute,
        //路由类型
        __type__,
        //路由后缀
        suffix = nowInfo.suffix,
        //匹配到的字符个数
        matchSize = nowInfo.matchSize || 0,
        //路径字典
        pathMap,
        //子路由
        childrenRoute,
        //匹配到的路径
        matePath,
        //路由配置
        routeConfig,
        //路由返回的结果
        routeResult,
        //用来遍历常规路径
        mi, ml, mv, normalRoute,
        //正则路由路径需要的变量
        gl, regexpRoute, regexpStroage = routeStroage.regexp,
        //参数路由需要的变量
        pl, parameterRoute, parameterStroage = routeStroage.parameter;

    //遍历配置中的路由节点
    while (++ri < rl) {
        routeInfo = routeList[ri].__info__;
        path = routeInfo.path;
        suffix = typeof routeInfo.suffix !== 'undefined' ? routeInfo.suffix : nowInfo.suffix;
        routeConfig = routeInfo.routeConfig;
        pathMap = routeInfo.pathMap;
        __type__ = routeInfo.__type__;
        childrenRoute = routeInfo.childrenRoute;
        matePath = '';

        //检查是否有路径、并检查是否有常规路由
        if (path.length) {
            //处理各种类型路由
            normalRoute = pathMap.normalRoute;
            regexpRoute = pathMap.regexpRoute;
            parameterRoute = pathMap.parameterRoute;

            //添加正则路由到缓存容器中
            if (gl = regexpRoute.length) {
                regexpStroage.push({
                    url: url,
                    suffix: suffix,
                    parameter: nowInfo.parameter,
                    matchSize: matchSize,
                    routeInfo: routeInfo
                })
            }

            //添加参数路由到缓存容器中
            if (pl = parameterRoute.length) {
                parameterStroage.push({
                    url: url,
                    parameter: nowInfo.parameter,
                    suffix: suffix,
                    matchSize: matchSize,
                    routeInfo: routeInfo
                })
            }

            //遍历常规路由中的路径进行匹配
            mi = ~0;
            ml = normalRoute.length;
            while (++mi < ml) {
                mv = normalRoute[mi].replace(pathRootRegexp, '');
                //检查路由是否匹配到路径中的前部份
                if (url.indexOf(mv) === 0) {
                    lowerUrl = url.replace(mv, '');
                    //检查当前路径匹配是否是最终状态
                    if (!lowerUrl || lowerUrl === suffix) {
                        //检查是否有路由配置【控制器、视图】
                        if (routeConfig) {
                            routeResult = {
                                suffix: suffix,
                                routeConfig: routeConfig
                            };
                            //路由拦截
                           if(routeInterceptor(routeResult,requestUrlInfo)){
                               break
                           }else{
                               routeResult=null;
                           }

                        } else {
                            //没有对应的路由配置
                            $log.warning('没有对应的路由配置');
                        }

                        //检查剩余的路径是否是已/开头（确认之前匹配的是否是目录）
                    } else if (/^[\\\/]/.test(lowerUrl)) {
                        //继续下级路由查找
                        matePath = {
                            url: lowerUrl,
                            parameter: nowInfo.parameter,           //需要匹配的路径
                            matchSize: matchSize + mv.length,       //匹配到的字符
                            suffix: suffix                          //当前路由后缀
                        };

                        //查找下级路由的匹配项
                        routeResult = queryRoute(childrenRoute, matePath, routeStroage, autoRoutes,requestUrlInfo).routeResult;

                        if (routeResult) {
                            break;
                        }

                    }

                    //检测是否存在自动路由
                    if ((autoRoute = routeInfo.autoRoute) && mi + 1 === ml) {
                        autoRoutes.push({
                            data: autoRoute,
                            type: 'a',
                            info: {
                                suffix: suffix,
                                lowerUrl: lowerUrl,
                                parameter: nowInfo.parameter
                            }
                        });
                    }

                }
            }
            if (routeResult) {
                break
            }

        } else {
            //自动路由
            (autoRoute = routeInfo.autoRoute) && autoRoutes.push({
                data: autoRoute,
                type: 'a',
                info: {
                    suffix: suffix,
                    lowerUrl: url,
                    parameter: nowInfo.parameter
                }
            });

            //路由信息
            matePath = {
                url: url,                   //需要匹配的路径
                matchSize: matchSize,       //匹配到的字符
                parameter: nowInfo.parameter,
                suffix: suffix              //当前路由后缀
            };

            //查找下级路由的匹配项
            routeResult = queryRoute(childrenRoute, matePath, routeStroage, autoRoutes,requestUrlInfo).routeResult;
            if (routeResult) {
                break;
            }
        }
    }

    return {
        routeResult: routeResult,
        routeStroage: routeStroage
    };

};

/*复杂（正则/参数）路由匹配查询*/
function complexQueryRout(routeStroage, autoRoutes, requestUrlInfo) {
    //参数路由匹配处理
    var parameter = routeStroage.parameter,
        routeResult,
        routeMap = [],
        parameterMap = {},
        parameterOrder = [],
        key = ~0,
        len = parameter.length,
        slices,
        slice,
        url,
        _res,
        pathSize;

    //计算参数正则路径的长度
    while (++key < len) {
        slice = parameter[key];
        url = slice.url;
        pathSize = url.length;
        slices = parameterMap[pathSize];
        if (!slices) {
            parameterMap[pathSize] = [];
            parameterOrder.push(pathSize);
        }
        parameterMap[pathSize].push(slice);
    }

    //进行参数正则路由匹配
    if (len = parameterOrder.length) {
        //排序正则匹配顺序
        parameterOrder = parameterOrder.sort(function (a, b) {
            return a - b;
        });
        key = ~0;
        //遍历排序好的正则路由
        while (++key < len) {
            slices = parameterMap[parameterOrder[key]];
            _res = parameterMateRoute(slices, autoRoutes);
            if (routeResult = _res.routeResult) {
                res = _res;
                break
            }

            routeMap = routeMap.concat(_res.routeMap);
        }

    }

    if (!routeResult) {
        //正则路由匹配处理
        var regexp = routeStroage.regexp,
            regexpMap = {}, regexpOrder = [],
            key = ~0, len = regexp.length;

        //计算正则路径的长度
        while (++key < len) {
            slice = regexp[key];
            url = slice.url;
            pathSize = url.length;
            slices = regexpMap[pathSize];
            if (!slices) {
                regexpMap[pathSize] = [];
                regexpOrder.push(pathSize);
            }
            regexpMap[pathSize].push(slice);
        }

        //进行正则路由匹配
        if (len = regexpOrder.length) {
            //排序正则匹配顺序
            regexpOrder = regexpOrder.sort(function (a, b) {
                return a - b;
            });
            key = ~0;
            //遍历排序好的正则路由
            while (++key < len) {
                slices = regexpMap[regexpOrder[key]];
                _res = regexpMateRoute(slices, autoRoutes);
                if (routeResult = _res.routeResult) {
                    res = _res;
                    break
                }

                routeMap = routeMap.concat(_res.routeMap);
            }

        }
    }
    return {
        routeMap: routeMap,
        routeResult: routeResult
    }
};

/*提取路由参数*/
function getParameter(info, src, parameter) {
    parameter = parameter || {};
    //提取正则映射的值
    var path = info.path,
        regexps = info.regexps,
        fns = info.fns,
        $src = info.src,
        i = ~0,
        l = regexps.length,
        v;

    //检查是否有参数字符映射
    if ($src && ($src = src.match(new RegExp($src)))) {
        while (++i < l) {
            v = regexps[i];
            parameter[v.key] = $src[i + 1];
        }
    }

    //提取回调函数映射的值
    i = ~0;
    l = fns.length;
    while (++i < l) {
        v = fns[i];
        parameter[v.key] = v.fn.call(src.match(new RegExp(path)));
    }
};

/*参数路由匹配*/
function parameterMateRoute(slices, autoRoutes) {
    var sliceIndex = ~0, sliceLength = slices.length, slice, parameter, src,
        url, suffix, matchSize, routeInfo, parameterRoutes, pathMap,
        routeResult, routeConfig, path,
        pi, pl, pv, parameterPath, lowerUrl,
        routeMap = [],
        autoRoute;

    innerloop:
        //遍历当前路由节点
        while (++sliceIndex < sliceLength) {
            slice = slices[sliceIndex];
            url = slice.url;
            suffix = slice.suffix;
            matchSize = slice.matchSize;
            routeInfo = slice.routeInfo;
            pathMap = routeInfo.pathMap;
            routeConfig = routeInfo.routeConfig;
            parameterRoutes = pathMap.parameterRoute;

            //路由参数复制
            slice.parameter = $object.clone(slice.parameter);

            //遍历路由参数路径
            pi = ~0;
            pl = parameterRoutes.length;
            while (++pi < pl) {
                pv = parameterRoutes[pi];
                path = pv.path;
                //重新构建正则
                parameterPath = new RegExp('^' + path);
                //检查是否匹配
                if (parameterPath.test(url)) {
                    lowerUrl = url.replace(parameterPath, function (output) {
                        src = output;
                        return '';
                    });
                    //检查当前路径匹配是否是最终状态
                    if (!lowerUrl || lowerUrl === suffix) {
                        //检查是否有路由配置【控制器、视图】
                        if (routeConfig) {
                            //提取当前路由参数
                            getParameter(pv, src, slice.parameter);

                            routeResult = {
                                url: url,
                                suffix: suffix,
                                parameter: slice.parameter,
                                routeConfig: routeConfig
                            };
                            break innerloop;
                        }

                        //检查剩余的路径是否是已/开头（确认之前匹配的是否是目录）
                    } else if (/^[\\\/]/.test(lowerUrl)) {
                        //提取当前路由参数
                        getParameter(pv, src, slice.parameter);

                        //继续下级路由查找
                        routeMap.push({
                            routeList: routeInfo.childrenRoute,
                            nowInfo: {
                                url: lowerUrl,
                                suffix: suffix,
                                parameter: slice.parameter,
                                matchSize: matchSize + url.length - lowerUrl.length,
                            }
                        });

                    }

                    //检测是否存在自动路由
                    if ((autoRoute = routeInfo.autoRoute) && pi + 1 === pl) {
                        autoRoutes.push({
                            data: autoRoute,
                            type: 'b',
                            info: {
                                suffix: suffix,
                                lowerUrl: lowerUrl,
                                parameter: slice.parameter
                            }
                        });
                    }
                }
            }
        }

    return {
        routeMap: routeMap,
        routeResult: routeResult
    };
};

/*正则路由匹配*/
function regexpMateRoute(slices, autoRoutes) {
    var sliceIndex = ~0, sliceLength = slices.length, slice,
        url, suffix, matchSize, routeInfo, regexpRoutes, pathMap,
        routeResult, routeConfig,
        pi, pl, regexpPath, lowerUrl,
        routeMap = [],
        autoRoute;
    innerloop:
        //遍历当前路由节点
        while (++sliceIndex < sliceLength) {
            slice = slices[sliceIndex];
            url = slice.url;
            suffix = slice.suffix;
            matchSize = slice.matchSize;
            routeInfo = slice.routeInfo;
            pathMap = routeInfo.pathMap;
            routeConfig = routeInfo.routeConfig;
            regexpRoutes = pathMap.regexpRoute;

            slice.parameter = $object.clone(slice.parameter || {});

            //遍历路由正则路径
            pi = ~0;
            pl = regexpRoutes.length;
            while (++pi < pl) {
                regexpPath = regexpRoutes[pi];
                //重新构建正则（主要给正则添加必须开头^）
                regexpPath = new RegExp('^' + regexpPath.source.replace(/^\^(?:\\\/)*/, ''), regexpPath.ignoreCase ? "i" : "");
                //检查是否匹配
                if (regexpPath.test(url)) {
                    lowerUrl = url.replace(regexpPath, '');
                    //检查当前路径匹配是否是最终状态
                    if (!lowerUrl || lowerUrl === suffix) {
                        //检查是否有路由配置【控制器、视图】
                        if (routeConfig) {
                            routeResult = {
                                url: url,
                                parameter: slice.parameter,
                                suffix: suffix,
                                routeConfig: routeConfig
                            };
                            break innerloop;
                        }

                        //检查剩余的路径是否是已/开头（确认之前匹配的是否是目录）
                    } else if (/^[\\\/]/.test(lowerUrl)) {
                        //继续下级路由查找
                        routeMap.push({
                            routeList: routeInfo.childrenRoute,
                            nowInfo: {
                                url: lowerUrl,
                                suffix: suffix,
                                parameter: slice.parameter,
                                matchSize: matchSize + url.length - lowerUrl.length,
                            }
                        })

                    }

                    //检测是否存在自动路由
                    if ((autoRoute = routeInfo.autoRoute) && pi + 1 === pl) {
                        autoRoutes.push({
                            data: autoRoute,
                            type: 'c',
                            info: {
                                suffix: suffix,
                                lowerUrl: lowerUrl,
                                parameter: slice.parameter
                            }
                        });
                    }
                }
            }
        }

    return {
        routeMap: routeMap,
        routeResult: routeResult
    };
};