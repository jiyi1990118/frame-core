/**
 * Created by xiyuan on 17-6-8.
 */

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

function extendExample(pathInfo,callbcak) {

    var url=PATH.resolve(pathInfo.url+'/'+pathInfo.slice),
        extendObj=extendStroage[url],
        state=extendLoadState[url];

    if(extendObj || state){
        if(extendObj){
            callbcak(extendObj);
        }else{
            extendWatch[url].push(callbcak);
        }
        return;
    }

    extendLoadState[url]=1;
    extendWatch[url]=[];

    //资源获取
    getSource(pathInfo, {
        mode:pathInfo.mode,
    },function (resSource) {
        var extendLib=[];
        var count=0;
        var isExec;
        var calle=resSource[0];

        if(resSource === false){
            log.error(pathInfo.mode+'文件 ['+this.responseURL+']缺失！');
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
                callbcak(extendObj);
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