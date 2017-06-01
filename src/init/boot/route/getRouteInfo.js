/**
 * 路由信息获取
 * Created by xiyuan on 17-5-30.
 */

'use strict';

var frameConf=require('../../../inside/config/index');

function getRouteInfo(nowInfo) {
    return queryRoute(nowInfo.path,frameConf.insideConf.routeMaps);
}

//路由查询
function queryRoute(url,routeMaps) {
    var i=~0,
        realInfo,
        afterUrl,
        matchInfo,
        routeInfo,
        autoRoute,
        patchsLen=routeMaps.paths.length;

    //检查常规路径规则
    while (++i<patchsLen){
        routeInfo=routeMaps.paths[i];
        //匹配路径
        if(matchInfo=url.match(routeInfo.rule)){
            //检查匹配位置是否首字符
            if(matchInfo.index === 0 ){
                afterUrl=url.slice(routeInfo.rule.length);
                //检查是否匹配到路径末尾
                if(/^\/?$/.test(afterUrl) || routeInfo.conf.suffix === afterUrl){
                    if(routeInfo.conf)return routeInfo.conf;
                }

                //检查是否在子级匹配到路径
                if(realInfo=queryRoute(afterUrl,routeInfo.childrenRoute)){
                    if(realInfo.isAutoRoute){
                        if(!autoRoute)autoRoute=realInfo;
                    }else{
                        return realInfo;
                    }
                }else{
                    //检查当前层级的自动路由
                    if(!autoRoute && routeInfo.autoRoute){
                        autoRoute={
                            isAutoRoute:true,
                            suffix:routeInfo.suffix,
                            path:afterUrl.replace(/^[\/\\]*/,''),
                            data:routeInfo.autoRoute
                        };
                    }
                }
            }
        }
    };
    return autoRoute;
}


module.exports=getRouteInfo;
