'use strict';

var url=require('../url');

var path=require('../path');

//空方法
var noop = function () {},
    //存储jsonp处理中的数据
    recordJsonpStroage = {},
    //jsonp数据缓存对象 (哪个请求先回调也就哪个请求先加载完毕 ,也就是哪个先写入缓存哪个就先得到缓存)
    cssElement = window.document.createElement('link'),
    jsElement = window.document.createElement('script'),
    headElement = window.document.getElementsByTagName('head')[0] || window.document.documentElement;

cssElement.rel = 'stylesheet';
cssElement.type = "text/css";

jsElement.type = "text/javascript";

//延迟执行
// jsElement.defer = 'defer';

//异步执行
jsElement.async = 'async';
jsElement.charset = "utf-8";

var jsonpState={},
    //jsonp数据监听
    jsonpWatchs={},
    //jsonp数据存储
    jsonpStorageMap={};

var jsonpStorage=[];

/* js脚本获取 */
function getJs(option) {

    //回调处理
    var callbackHandle=function (resInfo) {

        var resData=resInfo.many?resInfo.resData:resInfo.resData[0];

        option.complete.apply(resInfo, resData);

        resInfo.state?option.success.apply(resInfo, resData):option.error.apply(resInfo);;
    };

    //资源监听
    (jsonpWatchs[option.url]=jsonpWatchs[option.url]||[]).push(callbackHandle);

    //检查jsonp状态
    switch (jsonpState[option.url]){
        case 1:
            return;
        case 2:
            return callbackHandle(jsonpStorageMap[option.url]);
    }

    var callback = option.jsonpCallback,
        done = false,
        scriptNode = jsElement.cloneNode();

    scriptNode.src = option.url;

    jsonpState[option.url]=1;

    //作为之前已存在的方法作为一个备份
    if (recordJsonpStroage[callback]) {
        ++recordJsonpStroage[callback].sum;
    } else {
        recordJsonpStroage[callback] = {
            windowCallback: window[callback],
            sum: 1
        };
    }

    //文件加载完毕后调用jsonpCallback方法
    window[callback] = function () {
        //用来存储回调数据
        jsonpStorage.push([].slice.call(arguments));
    };

    //标识当前请求为amd模式
    window[callback].amd=true;

    //初始化回调(用于包处理 define.amd 赋值)
    option.init.call(scriptNode, window[callback]);

    function complete() {
        //接收计数器
        --recordJsonpStroage[callback].sum;
        //方法调用完毕后还原备份方法
        if (recordJsonpStroage[callback].sum < 1) {
            typeof recordJsonpStroage[callback].windowCallback === "undefined" ? delete window[callback] : (window[callback] = recordJsonpStroage[callback].windowCallback);
            delete recordJsonpStroage[callback];
        }
        //是否移除scirpt节点
        option.element || headElement.removeChild(scriptNode);
        //对挂载的监听进行反馈
        jsonpWatchs[option.url].forEach(function (fn) {
            fn(jsonpStorageMap[option.url])
        })
        //清空jsonp数据容器
        jsonpStorage = [];
    };

    //js获取成功后处理
    scriptNode.onload = scriptNode.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
            //标识资源请求完成
            done = true;
            //销毁相关监听
            this.onload = this.onreadystatechange = null;
            //成功接收后的回调数据
            jsonpState[option.url]=2;
            jsonpStorageMap[option.url]={dom: this,state:true, option: option,resData:jsonpStorage,many:jsonpStorage.length>1}
            complete();
        }
    };

    //js获取失败后处理
    scriptNode.onerror = function () {
        jsonpState[option.url]=2;
        jsonpStorageMap[option.url]={dom: this, option: option,state:false};
        complete();
    };

    //想文档中添加js节点，使其开始加载文件
    headElement.appendChild(scriptNode);
};

//默认的jsonp配置
var defaulteOption = {
    data: {},                   //需要传递的参数
    url: '',                    //请求的url
    type: 'js',                 //请求的类型　「js | css」
    init: noop,                 //初始化回调
    error: noop,                //错误回调
    success: noop,              //成功回调
    complete: noop,             //不管成功还是失败都回调
    callbackName: 'callback',   //jsonp发送的参数名称
    jsonpCallback: 'callback',  //jsonp回调成功执行的方法名
    element: false,              //是否保留创建的javascript或link标签
    jsonpParameter: true        //是否保留url中的jsonp参数
};


//配置合并
function merge(now, def) {
    Object.keys(def).forEach(function (key) {
        typeof now[key] === "undefined" && (now[key] = def[key])
    })
    return now;
};

function jsonp(option) {

    //参数规范化处理
    merge(option, defaulteOption);

    //url处理(参数、url)
    option.url = url.computedUrl(path.resolve(option.url), option.data);

    //处理请求的类型
    switch (option.type) {
        case 'js':
            var callbackUrlData = {};
            option.jsonpParameter && ( callbackUrlData[option.callbackName] = option.jsonpCallback, option.url = url.computedUrl(option.url, callbackUrlData));
            getJs(option);
            break;
        case 'css':

            break
    }

};

module.exports =jsonp;


