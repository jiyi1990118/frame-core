/**
 * Created by xiyuan on 17-5-30.
 */
'use strict';

var routeData=require('./routeData');

var redirect=require('./redirect');

var PATH=require('../../../inside/lib/path');

var appConf=require('../../../inside/config/index').appConf;

var routeMode=appConf.route.mode;


/*监听点击事件（主要用来监控当前点击的节点是否a标签 页面跳转）*/
window.document.addEventListener('click', function (event) {
    var element = event.target;

    //检查当前点击是否在a标签范围内(主要作用获取a元素)
    while (element.nodeName !== 'A') {
        if ( element === this|| !(element = element.parentNode) || !element) return;
    }

    //检查是否需要进行外部跳转
    if(element.getAttribute('target') !== null)return;

    var href=element.getAttribute('href');

    //检查是否返回
    if(element.getAttribute('isBack') !== null){
        window.history.back();
        routeData.history.isBack=true;
        return;
    }

    //标识是否回退
    routeData.history.isBack =false;

    //检查是否网络绝对地址
    if(/^(\w+:)?\/\/(\w[\w\.]*)/.test(href))return;

    //阻止默认的a标签跳转事件
    event.preventDefault();

    //获取跳转的地址
    href = decodeURI(PATH.normalize(href.replace(/^\.?[\/\\]/, '')));

    //页面重定向
    redirect(href,{},routeData.history.isBack);

}, false);

function watch() {

    //检查当前路由模式
    switch (routeMode) {
        case 'html5':
            /*监听当窗口历史记录改变。（html5模式的地址）*/
            window.addEventListener('popstate', function (event) {
                //此处做了兼容,避免项目路径与根路径不一样
                $routeManage.assign(getPathNormalize(routeMode).replace($routeManage.rootIntervalPath,''));
            }, false);
            break;
        default:
            routeMode=appConf.route.mode = 'hash';
            /*监听当前文档hash改变。（当前hash模式的地址）*/
            window.addEventListener('hashchange', function (e) {
                //检查是否是点击跳转页面的
                if($routeManage.hashListener ){
                    $routeManage.assign(getPathNormalize(routeMode));
                }else{
                    $routeManage.hashListener=true;
                }
            }, false);

    }
};


module.exports=watch;