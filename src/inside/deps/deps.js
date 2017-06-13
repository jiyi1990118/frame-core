/*load(['file:1', 'file:2'], function ($1, $2) {

})*/

var PATH=require('../lib/path');
var log = require('../log/log');
var jsonp = require('../lib/net/jsonp');
var commData=require('../config/lib/commData');

var appConf=commData.appConf;

var depsStroageMap={};

//扩展状态
var depsLoadState={};

//扩展监听
var depsWatch={};

function load() {

    var args = [].slice.call(arguments),
        argsLen = args.length,
        callbackFn,
        count=0,
        fileSources=[],
        fileQueue = [];

    switch (true) {
        case argsLen === 2:
            fileQueue=fileQueue.concat(args[0]);
            callbackFn=args[1];
            break;
        case argsLen > 2:
            argsLen-=1;
            for(var i=0;i<argsLen;i++){
                fileQueue=fileQueue.concat(args[i]);
            }
            callbackFn=args[argsLen];
            break;
        case argsLen === 1:
            callbackFn=args[0];
            break;
    }

    if(typeof callbackFn !== "function"){
        fileQueue=fileQueue.concat(callbackFn);
        callbackFn=function () {};
    }

    fileQueue.forEach(function (filePath,index) {
        //文件获取
        getFile(filePath,function (source) {
            fileSources[index]=source;
            if(++count === fileQueue.length){
                //调用文件资源回调
                callbackFn.apply(this,fileSources)
            }
        },load.nowUrl)
    });
    delete load.nowUrl;
}

function getFile(filePath,callback,nowUrl) {

    //路径解析
    //匹配配置中的path
    var i=~0,
        pathInfo,
        sliceName='index',
        fileSuffix='.js',
        pl=appConf.pathList.length;

    //检查是否当前模块 路径
    if(nowUrl && /^\:/.test(filePath))filePath=nowUrl+filePath;

    //获取资源切片
    filePath=filePath.replace(/:([^\:\\\/]*)$/,function (str,$1) {
        sliceName=$1;
        return '';
    });

    while (++i<pl){
        pathInfo=appConf.pathList[i];
        if(pathInfo.regExp.test(filePath)){
            filePath=filePath.replace(pathInfo.regExp,function (str,$1) {
                return pathInfo.path+'/'+($1||'');
            });
            break;
        }
    }

    //获取文件后缀
    filePath=filePath.replace(/\.[^\/\\]+$/i,function (str) {
        fileSuffix=str;
        return '';
    });

    //获取当前文件的绝对地址
    filePath = PATH.normalize(PATH.resolve(filePath, nowUrl)+fileSuffix);

    //依赖数据
    var depsObj=depsStroageMap[filePath]=depsStroageMap[filePath]||{},
        states=depsLoadState[filePath]=depsLoadState[filePath]||{};

    depsWatch[filePath]=depsWatch[filePath]||{};

    //添加资源监听挂载
    (depsWatch[filePath][sliceName]=depsWatch[filePath][sliceName]||[]).push(callback);

    //检查当前的模块是否存在
    switch (states[sliceName]){
        case 1:
            return;
        case 2:
            return callback(depsObj[sliceName]);
    }

    //标识当前模块正在加载
    depsLoadState[filePath][sliceName]=1;

    //获取模块
    jsonp({
        url: filePath,
        jsonpCallback: 'define',
        complete: function (data) {
            //检查返回的状态
            if (this.state) {
                var despModels=this.many ? [].slice.call(arguments) : [[].slice.call(arguments)],
                    despQueue=[];

                //检查是否多个jsonp切片
                despModels.forEach(function (confArgs) {

                    var resFn,
                        desp=[],
                        moduleName='index';

                    //提取相关资源
                    Object.keys(confArgs).forEach(function (key) {
                        switch (true){
                            case confArgs[key] instanceof Array:
                                desp=desp.concat(confArgs[key]);
                                break;
                            case confArgs[key] instanceof Function:
                                resFn=confArgs[key]
                                break;
                            case typeof confArgs[key] === 'string':
                                moduleName=confArgs[key];
                                break;
                        }
                    });

                    //收集依赖
                    if(desp.length){
                        despQueue.push({
                            resFn:resFn,
                            desp:desp,
                            moduleName:moduleName
                        });

                    }else{
                        if(resFn instanceof Function)resFn=resFn();
                        depsStroageMap[filePath][moduleName]=resFn;
                        depsLoadState[filePath][moduleName]=2;

                        if(despModels.length === 1){
                            depsStroageMap[filePath]['index']=resFn;
                            depsLoadState[filePath]['index']=2;

                            //数据回调触发
                            (depsWatch[filePath]['index']=depsWatch[filePath]['index']||[]).forEach(function (callbackFn) {
                                callbackFn(resFn);
                            });
                            depsWatch[filePath]['index']=[];
                        }

                        //数据回调触发
                        (depsWatch[filePath][moduleName]=depsWatch[filePath][moduleName]||[]).forEach(function (callbackFn) {
                            callbackFn(resFn);
                        });

                        depsWatch[filePath][moduleName]=[];
                    }

                });

                var queueCount=despQueue.length

                //遍历有依赖的模块
                despQueue.forEach(function (info) {
                    load.nowUrl=filePath;
                    //加载相关依赖的模块
                    load.apply(this,info.desp.concat(function () {
                        var resFn=info.resFn;
                        //资源获取
                        if(resFn instanceof Function)resFn=resFn.apply(this,arguments);
                        //标识资源状态
                        depsStroageMap[filePath][info.moduleName] = resFn;
                        depsLoadState[filePath][info.moduleName] = 2;

                        //检查依赖队列是否完全加载
                        if(!--queueCount){
                            despQueue.forEach(function (info) {
                                //数据回调触发
                                (depsWatch[filePath][info.moduleName]=depsWatch[filePath][info.moduleName]||[]).forEach(function (callbackFn) {
                                    callbackFn(depsStroageMap[filePath][info.moduleName]);
                                });
                            })
                            depsWatch[filePath][info.moduleName]=[];

                            //如果内部只有一个模块 则也定义为 内部 index
                            if(despModels.length === 1){
                                (depsStroageMap[filePath]=depsStroageMap[filePath]||{})['index']=resFn;
                                (depsLoadState[filePath]=depsLoadState[filePath]||{})['index']=2;
                                //数据回调触发
                                (depsWatch[filePath]['index']=depsWatch[filePath]['index']||[]).forEach(function (callbackFn) {
                                    callbackFn(resFn);
                                });
                                depsWatch[filePath]['index']=[];
                            }
                        }

                    }));
                })

            } else {
                log.warn('加载外部依赖文件失败，请检查！ (' + this.option.url + ')');
            }
        }
    });
}
module.exports=load;