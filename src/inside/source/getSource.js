/**
 * 资源获取 （model view presenter ...）
 * Created by xiyuan on 17-6-1.
 */

'use strict';

var jsonp=require('../lib/net/jsonp');
var ajax=require('../lib/net/ajax');
var log=require('../log/log');
var PATH=require('../lib/path');
var appConf=require('../config/lib/commData').appConf;

/**
 * 资源获取
 * @param url
 * @param option
 * @param callback
 */
function getSource(url,option,callback) {

    //模式目录名称
    var sliceName=appConf.system.moduleDefault[option.mode+'Slice'],
        modePath=appConf.system.moduleDirName[option.mode],
        info={
            //当前模块
            module:'',
            //当前操作(切片)
            slice:'',
            //当前资源地址
            url:'',
            //当前资源路径(不包含文件 module路径、mode类型目录、文件module后缀、文件后缀)
            pathName:'',
            //资源目录
            mode:modePath,
            //资源来源地址
            origin:''
        };

    if( typeof url === 'string'){

        //匹配配置中的path
        var i=~0,
            module,
            location,
            pathInfo,
            pl=appConf.pathList.length;

        while (++i<pl){
            pathInfo=appConf.pathList[i];
            if(pathInfo.regExp.test(url)){
                url=url.replace(pathInfo.regExp,function (str,$1) {
                    return pathInfo.path+'/'+($1||'');
                });
                break;
            }
        }

        //检查当前模块
        location=url.indexOf('@');
        if(location !== -1){
            //提取模块地址
            module=info.module=PATH.normalize(url.slice(0,location));
            //替换模块
            url=url.slice(location+1);
        }

        //获取资源切片
        url=url.replace(/:([^:]*)$/,function (str,$1) {
            sliceName=$1;
            return '';
        });

        //当前资源路径(不包含文件 module路径、mode类型目录、文件module后缀、文件后缀)
        info.pathName=url;
        //切片
        info.slice=sliceName;
        //路径
        url=(module?module+'/'+modePath+'/':'')+url;
    }else if(url instanceof Object){
        info=url;
        url=info.url;
    }

    if(option.isAjax){
        ajax({
            type:'get',
            url:url+'/'+sliceName+(option.suffix||appConf.tplSuffix),
            success:function (strSource) {
                callback(strSource)
            },
            error:function () {
                callback(false);
            }
        });

    }else{
        jsonp({
            url: url+ appConf.system.fileSuffix[option.mode]+'.js',
            jsonpCallback: appConf.system.fileCallback[option.mode],
            complete: function (data) {
                //获取资源真实地址
                info.url=this.option.url;
                //检查返回的状态
                if (this.state) {
                    //检查是否多个jsonp切片
                    var sourceMap=(this.many ? [].slice.call(arguments) : [[].slice.call(arguments)]).reduce(function (map,source) {
                        map[source[0]]=source[1];
                        return map;
                    },{});

                    callback(sourceMap[sliceName],info)

                } else {
                    log.error(option.mode + '文件【' + this.option.url + '】不存在!');
                }
            }
        })
    }

}

module.exports=getSource;