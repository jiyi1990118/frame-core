'use strict';

var url=require('../url');

var path=require('../path');

//空方法
var noop = function () {},
    //存储jsonp处理中的数据
    recordJsonpStroage = {},
    //标识是否是多回调
    many = false,
    //jsonp数据缓存对象 (哪个请求先回调也就哪个请求先加载完毕 ,也就是哪个先写入缓存哪个就先得到缓存)
    jsonpStorage = null,
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

/* js脚本获取 */
function getJs(option) {
    var callback = option.jsonpCallback,
        done = false,
        js = jsElement.cloneNode(),
        complete = function () {
            --recordJsonpStroage[callback].sum;
            //方法调用完毕后还原备份方法
            if (recordJsonpStroage[callback].sum < 1) {
                typeof recordJsonpStroage[callback].windowCallback === "undefined" ? delete window[callback] : (window[callback] = recordJsonpStroage[callback].windowCallback);
                delete recordJsonpStroage[callback];
            }
            option.element || headElement.removeChild(js);
            var object = {dom: this, option: option, many: many};
            object.state = jsonpStorage ? true : false;
            option.complete.apply(object, jsonpStorage);
        };

    js.src = option.url;

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
        //用来处理一个请求里有多个回调
        if (jsonpStorage) {
            !many && (jsonpStorage = [jsonpStorage], many = true)
            jsonpStorage.push([].slice.call(arguments));
        } else {
            jsonpStorage = [].slice.call(arguments);
        }
    };

    //初始化回调(用于包处理 define.amd 赋值)
    option.init.call(js, window[callback]);

    //js获取成功后处理
    js.onload = js.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
            complete();
            done = true;
            this.onload = this.onreadystatechange = null;
            option.success.apply({dom: this, option: option, many: many}, jsonpStorage);
            //清空jsonp数据容器
            jsonpStorage = null;
            many=false;
        }
    };

    //js获取失败后处理
    js.onerror = function () {
        complete();
        option.error.apply({dom: this, option: option});
    };

    //想文档中添加js节点，使其开始加载文件
    headElement.appendChild(js);
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
    element: true,              //是否保留创建的javascript或link标签
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


