/**
 * Created by xiyuan on 15-12-4.
 */
//@make : start

/*路由管理对象*/
var $routeManage={};

/*路由监听*/
Include('routeWatch.js');

/*路由解析*/
Include('routeParse.js');

/*路由DNS*/
Include('routeDns.js');

/*路由分配(最终调用渲染引擎)*/
Include('routeAssign.js');

//@make : end