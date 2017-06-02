/**
 * 转换真实资源路径
 * Created by xiyuan on 17-6-1.
 */

var PATH=require('../lib/path');
var appConf=require('../config/lib/commData').appConf;

/**
 * 转换真实资源路径
 * @param url
 * @param originInfo
 * @param modeType
 */
function sourcePathNormal(url,originInfo,modeType) {
    var first=url.charAt(0),
        moduleDirName=appConf.system.moduleDirName[modeType],
        sliceName=appConf.system.moduleDefault[modeType+'Slice'],

    sourceInfo={
        //当前模块
        module:'',
        //当前操作(切片)
        slice:'',
        //当前资源地址
        url:'',
        //当前资源路径(不包含文件 module路径、mode类型目录、文件module后缀、文件后缀)
        pathName:'',
        //资源目录
        mode:moduleDirName,
        //资源来源地址
        origin:originInfo,

    };

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
        if(location===0){
            module=originInfo.module;
        }else{
            //提取模块地址
            module=sourceInfo.module=PATH.normalize(url.slice(0,location));
        }
        //替换模块
        url=url.slice(location+1);
    }else if(url.charAt(0) === '/' || url.charAt(0) === '.'){
        module='';
    }else{
        module=originInfo.module;
    }

    //获取资源切片
    url=url.replace(/:([^:]*)$/,function (str,$1) {
        sliceName=$1;
        return '';
    });

    //当前资源路径(不包含文件 module路径、mode类型目录、文件module后缀、文件后缀)
    sourceInfo.pathName=url;
    //切片
    sourceInfo.slice=sliceName;
    //url
    sourceInfo.url=PATH.normalize((module?module+'/'+moduleDirName+'/':'')+url);
    return sourceInfo;
}

module.exports = sourcePathNormal;