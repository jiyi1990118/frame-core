'use strict';
var log = require('../../log/log');
var jsonp = require('../../lib/net/jsonp');
var confAPI = require('./initerface');
var commData = require('./commData');
var configEndHandle=require('./configEndHandle');

//加载url路径中配置
function loadUrlConf(callback) {
    var configUrl,
        configScript = document.querySelector('script[app-config]');

    //检查是否设置脚本配置
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
                    var agrs=(this.many ? [].slice.call(arguments) : [[].slice.call(arguments)]);
                    commData.extendFileCount+=agrs.length;

                    //主要记录配置加载
                    commData.finalCallback=function () {
                        //调用配置处理
                        configEndHandle();
                        callback(true);
                        delete commData.finalCallback
                        delete commData.extendFileCount
                    }

                    //返回的数据处理(检查是否有多个回调)
                    agrs.forEach(function (confArgs) {
                        //请求完毕后处理配置解析
                        confAPI.configRead(confArgs, function () {
                            if (--commData.extendFileCount === 0 && typeof callback === "function" && commData) {
                                commData.finalCallback();
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


module.exports = loadUrlConf