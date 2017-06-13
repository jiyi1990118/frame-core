/**
 * Created by xiyuan on 17-6-1.
 */
"use strict";

var observer = require('../../inside/lib/observer');
var serverEngine=require('../server/index');
var lib=require('../../inside/lib/exports')

function modelInterface() {

    //model资源
    this.__source__={
        trigger:{},
        isExec:false,
        server:[],
        observer:observer(this)
    };
}

/**
 * 数据监控
 * @param watchKey
 * @param fn
 * @param isRead
 * @returns {modelInterface}
 */
modelInterface.prototype.watch = function (watchKey, fn ,isRead) {
    var ob=this.__source__.observer;

    if(isRead === undefined){
        if(watchKey instanceof Function){
            if(typeof fn === 'boolean'){
                ob.readWatch('exports',watchKey);
                return this;
            }
            ob.watch('exports',watchKey);
            return this;
        }

    }else if(isRead){
        ob.readWatch('exports.'+watchKey, fn);
        return this;
    }
    ob.watch('exports.'+watchKey, fn);
    return this;
};

/**
 * 数据读取
 * @param key
 * @param fn
 * @returns {modelInterface}
 */
modelInterface.prototype.read = function (key, fn) {
    if(arguments.length===2){
        key='exports.'+key;
    }else{
        fn=key;
        key='exports'
    }
    this.__source__.observer.read(key, fn);
    return this;
};

/**
 * 移除数据监控
 * @param key
 * @param fn
 * @returns {modelInterface}
 */
modelInterface.prototype.unWatch = function (key, fn) {
    if(arguments.length===2){
        key='exports.'+key;
    }else{
        fn=key;
        key='exports'
    }
    this.__source__.observer.unWatch(key, fn);
    return this;
};

/**
 * 移除数据读取监控
 * @param watchKey
 * @param fn
 * @returns {modelInterface}
 */
modelInterface.prototype.unRead = function (watchKey, fn) {

    if(arguments.length===2){
        watchKey='exports.'+watchKey;
    }else{
        fn=watchKey;
        watchKey='exports'
    }
    this.__source__.observer.unRead(watchKey, fn);
    return this;
};

/**
 * model数据写入
 * @param key
 * @param data
 */
modelInterface.prototype.write = function (key, data) {
    if(arguments.length === 1){
        this.exports=key;
    }else if(arguments.length === 2){
        if(!(this.exports instanceof Object)){
            this.exports={}
        }
        this.exports[key]=data;
    }
};

/**
 * 自定义触发器
 * @param name
 * @param fn
 */
modelInterface.prototype.trigger = function (name, fn) {
    this.__source__.trigger[name]=fn;
};

/**
 * 内部方法库
 */
modelInterface.prototype.lib=lib;

/**
 * 服务请求
 * @param option
 */
modelInterface.prototype.server = function (option) {
    var server=serverEngine.serverExec(option);
    this.__source__.server.push(server)
    return server;
}

module.exports=modelInterface;