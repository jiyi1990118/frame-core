/**
 * Created by xiyuan on 17-6-1.
 */

'use strict';

var jsonp=require('../lib/net/jsonp');
var ajax=require('../lib/net/ajax');
var log=require('../log/log');
var PATH=require('../lib/path');
var appConf=require('../config/lib/commData').appConf;

//资源获取
function getSource(url,option,callback) {
    //模式目录名称
    var sliceName,
        modePath=appConf.system.moduleDirName[option.mode];

    //匹配配置中的path
    var i=~0,
        pathInfo,
        pl=appConf.pathList.length;

    while (++i<pl){
        pathInfo=appConf.pathList[i];
        if(pathInfo.regExp.test(url)){
            url=url.replace(pathInfo.regExp,function (str,$1,$2) {
                return pathInfo.path+'/'+$2;
            });
            break;
        }
    }

    //替换模块
    url=url.replace('@','/'+modePath+'/');

    //获取资源切片
    url=PATH.normalize(url.replace(/:([^:]*)$/,function (str,$1) {
        sliceName=$1;
        return '';
    }));


    console.log(url,'???',sliceName)

    if(option.isAjax){
        url.replace(':','/');
    }else{
        jsonp({
            url: url,
            jsonpCallback: sliceName,
            complete: function (data) {
                //检查返回的状态
                if (this.state) {
                    //检查是否多个jsonp切片
                    (this.many ? [].slice.call(arguments) : [[data]]).forEach(function (confArgs) {

                    });

                } else {
                    log.error(option.mode + '文件【' + this.option.url + '】不存在!');
                }
            }
        })
    }






}


module.exports=getSource;