/**
 * Created by xiyuan on 16-12-5.
 */

var URL=require('../url');

var JSON=require('../json');

function ajax(option){
    //是否同步请求
    option.async = option.async === undefined ? true : option.async ? true : false;

    //请求类型
    var requestType=option.type = (new RegExp(option.type,'ig').exec('GET,DELETE,POST,PUT,HEAD,FORM').toString() || 'GET');

    var xhr={
            responseType:'text'
        },
        url=option.url,
        sendData=option.data;

    //检查请求协议  避免在本地请求出错
    if(URL.protocol(option.url) === 'file:'){

        //检查是否cordova环境
        if(window.cordova && cordova.file){

            //预设
            typeof option.preset === "function" && option.preset(xhr);

            //html5文件系统
            window.resolveLocalFileSystemURL(cordova.file.applicationDirectory, function(f) {
            }, function () {});

            //本地文件系统
            window.resolveLocalFileSystemURL(option.url, function (fileEntry) {

                //文件资源开启
                fileEntry.file(function(file) {
                    var reader = new FileReader();
                    xhr.status=200;

                    //文件资源监听
                    reader.onloadend = function(e) {
                        typeof option.success === "function" && option.success.call(xhr,this.result);
                        typeof option.complete === 'function' && option.complete.call(xhr,this.result,true);
                    };

                    //资源读取 ArrayBuffer / text
                    xhr.responseType === "arraybuffer"?reader.readAsArrayBuffer(file):reader.readAsText(file);
                });

            }, function () {

                xhr.status=500;
                typeof option.error === "function" && option.error.call(xhr,null);
                typeof option.complete === 'function' && option.complete.call(xhr,null);
            });

            return;
        }
    }

    xhr=new XMLHttpRequest();

    xhr.onreadystatechange =function(){

        //前置请求
        if (typeof option.beforeSend === 'function') {
            option.beforeSend.call(xhr,option);
        }

        //请求状态判断
        if (xhr.readyState === 4 ) {

            var res;
            if(xhr.status === 200){
                switch (option.dataType || 'json'){
                    case 'html':
                        res=xhr.responseText;
                        break;
                    case 'xml':
                        res=xhr.responseXML;
                        break;
                    case 'json':
                        res=JSON.parse(xhr.responseText);
                        break;
                    default:
                        res=xhr.response || xhr.responseText;
                }

                typeof option.success === 'function' && option.success.call(xhr,res);

            }else {
                if (typeof option.error === 'function') {
                    option.error.call(xhr,xhr);
                }
            }

            typeof option.complete === 'function' && option.complete.call(xhr,res || xhr,typeof res !== "undefined");
        }

    };

    switch (option.type){
        case 'POST':

            break;
        case 'FORM':
            requestType='POST';
            break;
        case 'GET':
            url=URL.computedUrl(url,option.data);
            break;
        case 'DELETE':

            break;
        case 'PUT':

            break;
        case 'HEAD':

            break;
    }

    xhr.open(requestType,url,option.async);

    //上传进度后回调
    var uploadprogress=option.uploadprogress || option.uploadProgress;
    typeof  uploadprogress === "function" && (xhr.upload.onprogress=uploadprogress);

    //资源返回进度回调
    typeof option.progress === "function" && (xhr.onprogress=option.progress);

    switch (option.type){
        case 'POST':

            break;
        case 'FORM':
            xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded;charset=utf-8');
            break;
        case 'GET':
            //判断请求是否需要设置content-type(主要处理zip压缩)
            //(typeof option.preset === "function" && option.preset.type) || xhr.setRequestHeader('Content-type','application/text/html;charset=utf-8');
            break;
        case 'DELETE':

            break;
        case 'PUT':

            break;
        case 'HEAD':

            break;
    }

    typeof option.preset === "function" && option.preset(xhr);


    //ajax请求缓存
    if(option.cache !== undefined && !option.cache) {
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.setRequestHeader('If-Modified-Since', '0');
    }

    //设置请求头
    Object.keys(option.header||{}).forEach(function (key) {
        xhr.setRequestHeader(key, option.header[key]);
    });

    xhr.send(sendData);
};

module.exports = ajax;