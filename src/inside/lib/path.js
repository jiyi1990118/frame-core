/**
 * 路径处理
 * Created by xiyuan on 17-3-7.
 */
"use strict";

var URL=require('./url');


/*获取文件路径*/
function dirname(path) {
    return path.match(/[^?#]*\//)[0]
};

var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//;
/*当前项目入口地址*/
var cwd = (!location.href || location.href.indexOf('about:') === 0) ? '' : dirname(location.href);

/*规范化路径*/
function normalize(path) {
    path = path.replace(/\\/g,'/').replace(/\/\.\//g, "/")
    path = path.replace(/([^:/])\/+\//g, "$1/");

    while (path.match(DOUBLE_DOT_RE)) {
        path = path.replace(DOUBLE_DOT_RE, "/")
    }

    return path
};

/*绝对路径*/
function resolve(path, url) {
    path=path.replace(/\\/g,'/');

    var host,
        protocol,
        paths=path.match(/^(\w+:)?\/\/(\w[\w\.]*(:\d+)?)/);

    if(paths){
        protocol=paths[1];
        host=paths[2];
    }

    if(url){
        if(paths){
            if(!protocol)path=URL.protocol(url)+host;
        }else{
            if(path.charAt(0) === '/'){
                path=URL.domain(url)+path;
            }else{
                url=resolve(url);
                path=dirname(url) + path;
            }
        }
    }else{
        if(paths){
            if(!protocol)path=window.location.protocol+host;
        }else{
            if(path.charAt(0) === '/'){
                path=URL.domain()+path;
            }else{
                path=dirname(window.location.href) + path;
            }
        }
    }
    return normalize(path);
};

/*获取路径中的文件名*/
function fileName(path) {
    var res = path.match(/^[\S]+\/([^\s\/]+)$/)
    return res ? res[1] : '';
};

/*获取路径中的文件*/
function file(path) {
    var res = path.match(/^[\S]+\/([^\s\.\/]+)[^\s\/]*$/);
    return res ? res[1] : '';
};

/*获取路径中的文件后缀*/
function suffix(path) {
    var res = path.match(/\.[^\.\/]*$/);
    return res ? res[0] : '';
};

/*获取去除后缀路径*/
function noSuffix(path) {
    var res = path.match(/[^?#]*\/[^\.\/]*/);
    return res ? res[0] : '';
};

module.exports={
    cwd:cwd,
    dirname:dirname,
    normalize:normalize,
    resolve:resolve,
    fileName:fileName,
    file:file,
    suffix:suffix,
    noSuffix:noSuffix
}
