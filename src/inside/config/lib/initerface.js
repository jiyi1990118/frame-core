/**
 * Created by xiyuan on 17-5-29.
 */
'use strict';
var log=require('../../log/log');
var path=require('../../lib/path');
var jsonp=require('../../lib/net/jsonp');
var commData=require('./commData');

var appConf=commData.appConf,
    stateData=commData.stateData;

/*配置对象接口*/
function configIniterface() {

};

/*系统配置*/
configIniterface.prototype.system = function (config) {
    var systemConfig = appConf.system,
        fileCallback = systemConfig.fileCallback,
        fileSuffix = systemConfig.fileSuffix,
        tmpData;

    //检查配置
    if (typeof config === 'object') {

        //检查回调函数名称
        if (typeof (tmpData = config.fileCallback) === 'object') {
            typeof tmpData.model === 'string' && (fileCallback.model = tmpData.model);
            typeof tmpData.view === 'string' && (fileCallback.view = tmpData.view);
            typeof tmpData.presenter === 'string' && (fileCallback.presenter = tmpData.presenter);
        }

        //检查文件后缀
        if (typeof (tmpData = config.fileSuffix) === 'object') {
            typeof tmpData.model === 'string' && (fileSuffix.model = tmpData.model);
            typeof tmpData.view === 'string' && (fileSuffix.view = tmpData.view);
            typeof tmpData.presenter === 'string' && (fileSuffix.presenter = tmpData.presenter);
        }

    }else{
        log.warn('系统配置参类型应该是Object!');
    }

};

/*应用模块*/
configIniterface.prototype.module = function (config) {

};

/*应用路径配置*/
configIniterface.prototype.path = function (config) {

};

/*应用配置扩展*/
configIniterface.prototype.include = function (config) {
    var This=this,
        fileLength=0,
        info = stateData,
        //保存当前层级的路径
        nowUrl=stateData.nowUrl;

    function callback() {
        if(--fileLength === 0){
            //加载完毕后恢复当前资源URL
            stateData.nowUrl = nowUrl;
        }
    }

    //检查配置包含类型
    if(config instanceof Array){
        config.forEach(function (confUrl) {
            fileLength++;
            getConfig(confUrl, This,'config',callback);
        });
    }else if(config instanceof Object){
        Object.keys(config).forEach(function (key) {
            fileLength++;
            getConfig(config[key], This, key,callback);
        })
    }
};

function getConfig(configUrl, Interface, jsonpCallback) {

    var sconfigUrl = path.resolve(configUrl,stateData.nowUrl);

    console.log(sconfigUrl,'>>>>>>>>...',configUrl,stateData.nowUrl)

}


module.exports=configIniterface;