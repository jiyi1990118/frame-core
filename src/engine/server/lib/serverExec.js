/**
 * Created by xiyuan on 17-6-4.
 */

var serverComm=require('./serverComm');
var serverInterface=require('./serverInterface');

//服务执行
function serverExec(option) {

    return new server(option);
}

function server(option) {

    //server配置
    var serverConf=serverComm.serverStroage[option.serverType||'http'];

    //内部配置
    this.__innerConf__={
        option:option,
        error:[],
        success:[],
        receive:[],
        serverConf:serverConf
    };

    //server实例
    var example=new serverInterface(this.__innerConf__);

    //遍历公共配置
    Object.keys(serverConf.config||{}).forEach(function (key) {

        //检查内部是否map类型
        if(typeof option[key] === 'object' && typeof serverConf.config === 'object'){
            Object.keys(serverConf.config[key]).forEach(function (ckey) {
                option[key][ckey]=serverConf.config[key][ckey];
            })
        }else{
            option[key]=serverConf.config[key];
        }
    });

    //检查是否有过滤器
    if(typeof serverConf.filter === 'object' && serverConf.filter.request instanceof Function){
        //执行请求过滤器
        serverConf.filter.request.call(example,option);
    }
}

//错误回调
server.prototype.error=function (fn) {
    if(this.__innerConf__.error.indexOf(fn) === -1){
        this.__innerConf__.error.push(fn);
    }
    return this;
}

//成功回调
server.prototype.success=function () {
    if(this.__innerConf__.success.indexOf(fn) === -1){
        this.__innerConf__.success.push(fn);
    }
    return this;
}

//数据接收
server.prototype.receive=function () {
    if(this.__innerConf__.receive.indexOf(fn) === -1){
        this.__innerConf__.receive.push(fn);
    }
    return this;
}

//数据请求
server.prototype.send=function (data) {
    var innerConf=this.__innerConf__;
    //开始请求数据
    innerConf.serverConf.request.call(innerConf.example,innerConf.option,data);
}

module.exports=serverExec;