/**
 * Created by xiyuan on 17-6-8.
 */

var log=require('../../inside/log/log');
var PATH=require('../../inside/lib/path');
var extendInterface=require('./lib/extenInterface');
var getSource=require('../../inside/source/getSource');
var modelEngine=require('../model/index');
var sourcePathNormal=require('../../inside/source/sourcePathNormal');
var modelExample;

//扩展存储
var extendStroage={};

//扩展状态
var extendLoadState={};

//扩展监听
var extendWatch={};

function extendExample(pathInfo,callback) {

    var url=PATH.resolve(pathInfo.url+'/'+pathInfo.slice),
        extendObj=extendStroage[url],
        state=extendLoadState[url];

    //检查当前的扩展是否存在
    if(extendObj || state){
        if(extendObj){
            callback(extendObj);
        }else{
            extendWatch[url].push(callback);
        }
        return;
    }

    extendLoadState[url]=1;
    extendWatch[url]=[];

    //标识当前来源类型
    pathInfo.originType='extend'

    //资源获取
    getSource(pathInfo, {
        mode:pathInfo.mode,
    },function (resSource) {
        if(resSource === undefined){
            log.warn(pathInfo.mode+'文件 ['+this.url+']缺失 "'+pathInfo.slice +'" 操作！');
            return;
        }

        var extendLib=[];
        var count=0;
        var isExec;
        var calle=resSource[0];

        if(resSource === false){
            log.warn(pathInfo.mode+'文件 ['+this.url+']缺失！');
            return;
        }

        if(resSource.length>1){
            calle=resSource[1];
            extendLib=[].concat(resSource[0]);
        }

        function extendExec() {
            if(count === extendLib.length && !isExec){
                isExec=true;
                var watchFn,
                    extendObj=calle.apply(new extendInterface(),extendLib);

                //存储当前扩展
                extendStroage[url]=extendObj;
                //资源状态
                extendLoadState[url]=2;
                //返回数据
                callback(extendObj);
                //执行监听
                while (watchFn=extendWatch[url].pop()){
                    watchFn(extendObj);
                }
                delete extendWatch[url];
            }
        }

        extendLib.forEach(function (extendPath,index) {
            var packagePath = extendPath.replace(/^\$:/, '');
            //两种路径 一、model  二、lib 扩展
            if (packagePath !== extendPath) {
                //扩展获取
                extendExample(sourcePathNormal(packagePath,pathInfo,'extend'),function (extend) {
                    extendLib[index]=extend;
                    count++;
                    extendExec()
                });
            } else {
                count++;
                extendLib[index]=new modelExample(sourcePathNormal(packagePath,pathInfo,'model'));
            }
        });
        extendExec();

    });
}


module.exports={
    extendInterface:extendInterface,
    extendExample:extendExample,
    //主要由model传递model实例接口
    setModelExample:function (ModelExample) {
        modelExample=ModelExample;
    }
}