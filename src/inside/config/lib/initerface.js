/**
 * Created by xiyuan on 17-5-29.
 */
'use strict';
var log=require('../../log/log');
var path=require('../../lib/path');
var jsonp=require('../../lib/net/jsonp');
var commData=require('./commData');


//空方法
var noop = function () {

    },
    appConf = commData.appConf,
    stateData = commData.stateData;

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
            stateData.callback();
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

/**
 * 配置读取
 * @param confArgs
 * @param callback
 * @param url
 * @param parentInterface
 */
function configRead(confArgs, callback, url, parentInterface) {
    var confKey,
        confFn,
        fileLen=stateData.fileLength,
        nowCallbck=stateData.callback,
        isMasterInterface = parentInterface ? false : true;

    //当前资源URL
    stateData.nowUrl = url;

    if (!parentInterface) {
        parentInterface = new configIniterface();
        stateData.interface=parentInterface;
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

    //配置回调执行
    confFn(parentInterface);

    //检查是否有新文件需要加载
    if(fileLen !== stateData.fileLength){
        stateData.callback=function () {
            stateData.callback=nowCallbck;
            callback();
        };
    }else{
        callback();
    }

    //后续支持设置配置Key
}

function getConfig(configUrl, Interface, jsonpCallback,callback) {

    //记录加载文件数
    stateData.fileLength++;

    //获取当前文件的绝对地址
    configUrl = path.resolve(configUrl,stateData.nowUrl);

    //获取配置数据
    jsonp({
        url: configUrl,
        jsonpCallback: jsonpCallback,
        complete: function (data) {
            //检查返回的状态
            if (this.state) {
                //返回的数据处理(检查是否有多个回调)
                var count = 0;

                //检查是否多个jsonp切片
                (this.many ? [].slice.call(arguments) : [[data]]).forEach(function (confArgs) {
                    count++;
                    //请求完毕后处理配置解析
                    configRead(confArgs, function () {
                        if (--count === 0) {
                            stateData.fileLength--
                            callback(true);
                        }
                    }, configUrl,Interface);

                });

            } else {
                log.warn('应用引导配置出错，请检查！ (' + this.option.url + ')');
            }
        }
    });

}


module.exports={
    configRead:configRead,
    configIniterface:configIniterface
};