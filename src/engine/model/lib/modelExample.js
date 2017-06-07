/**
 * 数据模型 实例
 * Created by xiyuan on 17-6-4.
 */
"use strict";

var getSource=require('../../../inside/source/getSource');
var modelInterface=require('../modelInterface');
var sourcePathNormal=require('../../../inside/source/sourcePathNormal');

//模型实例
function modelExample(pathInfo) {
    var This=this;
    this.interface=new modelInterface();
    this.useTrigger=[];

    var source=this.interface.__source__;

    getSource(pathInfo, {
        mode:pathInfo.mode,
    },function (resSource) {
        var extendLib=[];
        var modelQueue=[];
        var packageQueue=[];
        var calle=resSource[0];
        if(resSource === false){
            log.error('model文件 ['+this.responseURL+']缺失！');
            return;
        }

        if(resSource.length>1){
            calle=resSource[1];
            extendLib=resSource[0];
        }

        extendLib.forEach(function (extendPath) {
            console.log(extendPath,'>>>>>>>>')
            var packagePath = extendPath.replace(/^\$:/, '');
            //两种路径 一、model  二、lib 扩展
            if (packagePath !== extendPath) {

                console.log(sourcePathNormal(packagePath,pathInfo,'extend'),pathInfo)
                // packageQueue.push()
                // packagesFlag.push(i);
                // packagePath = packagePath.indexOf('@') ? packagePath : pathToUrl($modulePath) + '/' + packagePath.slice(1);
                // packages.push(packagePath);
            } else {
                // modelQueue.push()
                // includeModel[i] = controllerImage.prototype.model.call(modelObj, modelName);
            }



        })


        //资源回调,初始化model
        if(calle instanceof Function){
            //开始实例化model代码
            calle.call(This.interface);
            //标识模型已调用
            source.isExec=true;
            //检查triggle
            This.useTrigger.forEach(function (info) {
                if(source.trigger[info.name] instanceof Function){
                    info.callback(source.trigger[info.name].apply(This,info.args));
                }
            });
        };
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