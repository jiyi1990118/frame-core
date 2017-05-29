'use strict';
var log = require('../../log/log');
var jsonp = require('../../lib/net/jsonp');
var confInterface = require('./initerface');
var commData = require('./commData');

//空方法
var noop = function () {

    },
    appConf = commData.appConf,
    stateData = commData.stateData;

//加载url路径中配置
function loadUrlConf(callback) {
    var configUrl,
        configScript = document.querySelector('script[app-config]');

    if (configScript) {
        //获取应用配置路径
        configUrl = configScript.getAttribute('app-config');

        //获取配置数据
        jsonp({
            url: configUrl,
            jsonpCallback: 'config',
            complete: function (data) {
                //检查返回的状态
                if (this.state) {
                    //返回的数据处理(检查是否有多个回调)
                    var count = 0;

                    //检查是否多个jsonp切片
                    (this.many ? [].slice.call(arguments) : [data]).forEach(function (confArgs) {
                        count++;
                        //请求完毕后处理配置解析
                        configParse(confArgs, function () {
                            if (--count === 0 && typeof callback === "function") {
                                callback(true);
                            }
                        }, configUrl);
                    });

                } else {
                    log.warn('应用引导配置出错，请检查！ (' + this.option.url + ')');
                }
            }
        });
    } else if (callback instanceof Function) {
        callback(false);
    }
}

//配置解析
function configParse(confArgs, callback, url, parentInterface) {
    var confKey,
        confFn,
        isMasterInterface = parentInterface ? false : true;

    //当前资源URL
    stateData.nowUrl = url;

    if (!parentInterface) {
        parentInterface = new confInterface();
        stateData.interface=parentInterface;
        stateData.callback=typeof callback === 'function' ? callback : noop;
    }

    switch (confArgs.length) {
        case 1:
            confFn = confArgs[0];
            break;
        case 2:
            confKey = confArgs[0];
            confFn = confArgs[1];
            break;
    }

    //配置回调
    confFn(parentInterface);

    //后续支持设置配置Key
}


module.exports = {
    loadUrlConf: loadUrlConf
}