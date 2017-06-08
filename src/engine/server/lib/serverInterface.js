/**
 * Created by xiyuan on 17-6-4.
 */

//服务接口
function serverInterface(innerConf) {
    //实例传递
    innerConf.example=this;
    this.__innerConf__=innerConf;

}

//数据请求完成
serverInterface.prototype.complete=function () {
    var This=this,
        resData,
        agrs=[].slice.call(arguments),
        innerConf=this.__innerConf__,
        serverConf=innerConf.serverConf;

    //检查是否有过滤器
    if(typeof serverConf.filter === 'object' && serverConf.filter.receive instanceof Function){
        //执行过滤器
        resData=serverConf.filter.receive.call(this,agrs[0],innerConf.option);
        if(resData === undefined) return
        agrs[0]=resData
    }

    innerConf.receive.forEach(function (fn) {
        fn.apply(This,agrs);
    })
}

//数据请求成功
serverInterface.prototype.success=function () {
    var This=this,
        resData,
        agrs=[].slice.call(arguments),
        innerConf=this.__innerConf__,
        serverConf=innerConf.serverConf;

    //检查是否有过滤器
    if(typeof serverConf.filter === 'object' && serverConf.filter.success instanceof Function){
        //执行过滤器
        resData=serverConf.filter.success.call(this,agrs[0],innerConf.option);
        if(resData === undefined) return
        agrs[0]=resData
    }

    innerConf.success.forEach(function (fn) {
        fn.apply(This,agrs);
    })
}

//数据请求失败
serverInterface.prototype.error=function () {
    var This=this,
        resData,
        agrs=[].slice.call(arguments),
        innerConf=this.__innerConf__,
        serverConf=innerConf.serverConf;

    //检查是否有过滤器
    if(typeof serverConf.filter === 'object' && serverConf.filter.error instanceof Function){
        //执行过滤器
        resData =serverConf.filter.error.call(this,agrs[0],innerConf.option);
        if(resData === undefined) return
        agrs[0]=resData
    }

    innerConf.error.forEach(function (fn) {
        fn.apply(This,agrs);
    })
}


module.exports=serverInterface;
