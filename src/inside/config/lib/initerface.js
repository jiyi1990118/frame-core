/**
 * Created by xiyuan on 17-5-29.
 */
'use strict';
var log = require('../../log/log');
var path = require('../../lib/path');
var jsonp = require('../../lib/net/jsonp');
var commData = require('./commData');
var routeConf = require('./routeConf');
var vfInterace=require('../../../interface/index');
var componentMange=require('./../../../engine/view/lib/componentManage');
var directiveManage=require('./../../../engine/view/lib/directiveManage');
var serverEngine=require('./../../../engine/server/index');

var deps=require('../../deps/deps');

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
        moduleDirName = systemConfig.moduleDirName,
        moduleDefault=systemConfig.moduleDefault,
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
            typeof tmpData.model === 'string' && (fileSuffix.model = '.'+tmpData.model.replace(/^\./,''));
            typeof tmpData.view === 'string' && (fileSuffix.view = '.'+tmpData.view.replace(/^\./,''));
            typeof tmpData.presenter === 'string' && (fileSuffix.presenter = '.'+tmpData.presenter.replace(/^\./,''));
        }

        //模块目录名称
        if (typeof (tmpData = config.moduleDirName) === 'object') {
            typeof tmpData.model === 'string' && (moduleDirName.model = tmpData.model);
            typeof tmpData.view === 'string' && (moduleDirName.view = tmpData.view);
            typeof tmpData.presenter === 'string' && (moduleDirName.presenter = tmpData.presenter);
        }

        //默认的视图或调度器器及模型 /切片
        if (typeof (tmpData = config.moduleDefault) === 'object') {
            typeof tmpData.model === 'string' && (moduleDefault.model = tmpData.model);
            typeof tmpData.view === 'string' && (moduleDefault.view = tmpData.view);
            typeof tmpData.presenter === 'string' && (moduleDefault.presenter = tmpData.presenter);
            typeof tmpData.modelSlice === 'string' && (moduleDefault.modelSlice = tmpData.modelSlice);
            typeof tmpData.viewSlice === 'string' && (moduleDefault.viewSlice = tmpData.viewSlice);
            typeof tmpData.presenterSlice === 'string' && (moduleDefault.presenterSlice = tmpData.presenterSlice);
        }

    } else {
        log.warn('系统配置参类型应该是Object!');
    }

};


/*路由模式 【 # hash 与 / html5 】默认hash */
configIniterface.prototype.routeMode = function (config) {
    appConf.route.mode = config;
};

/*默认的路由*/
configIniterface.prototype.defaultUrl = function (config) {
    appConf.route.defaultUrl = config;
};

/*路由后缀 默认空*/
configIniterface.prototype.routeSuffix = function (config) {
    appConf.route.suffix = '.' + config.replace(/^\./, '');
};

/*视图模板后缀 默认html*/
configIniterface.prototype.tplSuffix = function (config) {
    appConf.tplSuffix = config.replace(/^\.+/, '');
};

/*视图请求方式 【 ajax 与 jsonp 】 默认ajax*/
configIniterface.prototype.viewRequire = function (config) {
    appConf.viewRequire = config;
};

/*路由配置*/
configIniterface.prototype.route = routeConf;

/*应用模块*/
configIniterface.prototype.module = function (config) {

};

/**
 * 自定义配置
 * @param key
 * @param conf
 * @param mode
 */
configIniterface.prototype.custom = function (conf,mode) {
    var customConf=commData.customConf;

    //检查是否设置模式
    if(typeof mode !== 'string')mode='comm';

    customConf[mode]=commData.customConf[mode]||{};

    //配置收集
    Object.keys(conf).forEach(function (key) {
        customConf[mode][key]=conf[key];
    })
};

//加载配置模式
configIniterface.prototype.loadConfMode =function (mode) {
    [].slice.call(arguments).forEach(function (mode) {
        commData.appConf.loadConfMode.push(mode)
    });
};

    /*应用路径配置*/
configIniterface.prototype.path = function (config) {
    Object.keys(config).forEach(function (key) {
        appConf.pathList.push({
            regExp: RegExp('^' + key + '([/@:]([\\S]*))?$'),
            path: config[key],
            len: key.length
        });
    });

    //根据路径长度来排序
    appConf.pathList = appConf.pathList.sort(function (pev, next) {
        return next.len - pev.len;
    });
};

//组件注册
configIniterface.prototype.component=function (compName,compConf,optionCallback) {
    var nowUrl=this.nowUrl;
    switch (arguments.length){
        case 2:
            componentMange.register(compName,compConf)
            break;
        case 3:
            var depsPackage=[].concat(compConf);
            deps.nowUrl=nowUrl;
            deps(depsPackage,function () {
                componentMange.register(compName,optionCallback.apply(this,arguments))
            });
    }
};

//指令注册
configIniterface.prototype.directive=function (compName,compConf,optionCallback) {
    var nowUrl=this.nowUrl;
    switch (arguments.length){
        case 2:
            directiveManage.register(compName,compConf)
            break;
        case 3:
            var depsPackage=[].concat(compConf);
            deps.nowUrl=nowUrl;
            deps(depsPackage,function () {
                directiveManage.register(compName,optionCallback.apply(this,arguments))
            });
    }
};

//服务注册
configIniterface.prototype.server=serverEngine.serverRegister;

/*应用配置扩展*/
configIniterface.prototype.include = function (config) {
    var This = this,
        fileLength = 0,
        //保存当前层级的路径
        nowUrl = stateData.nowUrl;

    function callback() {
        if (--fileLength === 0) {
            //加载完毕后恢复当前资源URL
            stateData.nowUrl = nowUrl;
            stateData.callback();
        }
    }

    //检查配置包含类型
    if (config instanceof Array) {
        config.forEach(function (confUrl) {
            fileLength++;
            getConfig(confUrl, This, 'config', callback);
        });
    } else if (config instanceof Object) {
        Object.keys(config).forEach(function (key) {
            fileLength++;
            getConfig(config[key], This, key, callback);
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
        fileLen = stateData.fileLength,
        nowCallbck = stateData.callback;

    //当前资源URL
    stateData.nowUrl = url;

    if (!parentInterface) {
        parentInterface = new configIniterface();
        stateData.interface = parentInterface;
    }
    parentInterface.nowUrl=path.resolve(url);

    switch (confArgs.length) {
        case 1:
            confFn = confArgs[0];
            break;
        case 2:
            confKey = confArgs[0];
            confFn = confArgs[1];
            break;
    }

    //避免配置错误导致无限循环
    try {
        //配置回调执行
        confFn.call(vfInterace,parentInterface, commData.innerConf);
    }
    catch (e) {
        callback();
        return log.warn(e)
    }

    //检查是否有新文件需要加载
    if (fileLen !== stateData.fileLength) {
        stateData.callback = function () {
            stateData.callback = nowCallbck;
            callback();
        };
    } else {
        callback();
    }
    //后续支持设置配置Key
}

function getConfig(configUrl, Interface, jsonpCallback, callback) {

    //记录加载文件数
    stateData.fileLength++;

    //获取当前文件的绝对地址
    configUrl = path.resolve(configUrl, stateData.nowUrl);

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
                (this.many ? [].slice.call(arguments) : [[].slice.call(arguments)]).forEach(function (confArgs) {
                    count++;
                    //请求完毕后处理配置解析
                    configRead(confArgs, function () {
                        if (--count === 0) {
                            stateData.fileLength--
                            callback(true);
                        }
                    }, configUrl, Interface);
                });
            } else {
                log.warn('应用引导配置出错，请检查！ (' + this.option.url + ')');
            }
        }
    });

}


module.exports = {
    configRead: configRead,
    configIniterface: configIniterface
};