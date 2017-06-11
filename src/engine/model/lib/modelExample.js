/**
 * 数据模型 实例
 * Created by xiyuan on 17-6-4.
 */
"use strict";

var getSource=require('../../../inside/source/getSource');
var modelInterface=require('../modelInterface');
var extendEngine=require('../../extend/index');
var sourcePathNormal=require('../../../inside/source/sourcePathNormal');
var commData=require('../../../inside/config/lib/commData');

var mvpRecord=commData.mvpRecord;

extendEngine.setModelExample(modelExample);

//模型实例
function modelExample(pathInfo) {
    var This=this;
    this.interface=new modelInterface();
    this.useTrigger=[];

    var source=this.interface.__source__;

    //请求来源
    var origin=pathInfo.origin;
    pathInfo.originType=origin.originType

    //收集相关资源 提供后续资源销毁
    switch(origin.originType){
        case 'layout':
            mvpRecord.lm.push(this)
            break;
        case 'presenter':
            mvpRecord.m.push(this);
            break;
    }

    getSource(pathInfo, {
        mode:pathInfo.mode,
    },function (resSource) {
        var extendLib=[];
        var count=0;
        var isExec;
        var calle=resSource[0];
        if(resSource === false){
            log.error('model文件 ['+this.responseURL+']缺失！');
            return;
        }

        if(resSource.length>1){
            calle=resSource[1];
            extendLib=[].concat(resSource[0]);
        }

        function modelExec() {
            if(count === extendLib.length && !isExec){
                isExec=true;
                //资源回调,初始化model
                if(calle instanceof Function){
                    //开始实例化model代码
                    calle.apply(This.interface,extendLib);
                    //标识模型已调用
                    source.isExec=true;
                    //检查triggle
                    This.useTrigger.forEach(function (info) {
                        if(source.trigger[info.name] instanceof Function){
                            info.callback(source.trigger[info.name].apply(This,info.args));
                        }
                    });
                    delete This.useTrigger;
                }else if(calle instanceof Object){
                    console.log('暂不支持model 数据对象')
                }
            }
        }

        extendLib.forEach(function (extendPath,index) {
            var packagePath = extendPath.replace(/^\$:/, '');
            //两种路径 一、model  二、lib 扩展
            if (packagePath !== extendPath) {
                extendEngine.extendExample(sourcePathNormal(packagePath,pathInfo,'extend'),function (extend) {
                    extendLib[index]=extend;
                    count++;
                    modelExec()
                })

            } else {
                count++;
                extendLib[index]=new modelExample(sourcePathNormal(packagePath,pathInfo,'model'));
            }

        });
        modelExec()
    });
};

//模型数据监听
modelExample.prototype.watch=function (watchKey, fn ,isRead) {
    this.interface.watch(watchKey, fn ,isRead);
};

//移除数据监听
modelExample.prototype.unWatch=function (watchKey, fn) {
    this.interface.unWatch(watchKey, fn);
};

//模型数据监听
modelExample.prototype.write=function (key, data) {
    this.interface.write(key, data);
}

//模型数据监听
modelExample.prototype.read=function (key, fn) {
    this.interface.read(key, fn);
}

//模型触发器调用
modelExample.prototype.trigger=function (name,arg1) {
    var args=[].slice.call(arguments).slice(1),
        source= this.interface.__source__,
        info={
            name:name,
            args:args,
            callback:function () {}
        },
        flag,
        resData;

    //检查model是否实例化
    if(source.isExec){
        if(source.trigger[name]){
            flag=true;
            resData=source.trigger[name].apply(this,args);
        }
    }else{
        this.useTrigger.push(info)
    }

    return function (fn) {
        if(fn instanceof Function){
            if(flag){
                fn(resData);
            }else{
                info.callback=fn;
            }
        }
    };
}


module.exports=modelExample;