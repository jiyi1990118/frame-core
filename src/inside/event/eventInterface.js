/**
 * Created by xiyuan on 15-12-2.
 */
'use strict';
var eventInterface=function(){
    this.eventStroage={};
};

//监听
eventInterface.prototype.watch=function(eventName,callback){
    if(typeof callback !== "function"){
        return false
    }
    var eventStroage=this.eventStroage[eventName];
    this.eventStroage[eventName]=eventStroage?eventStroage.push(callback) && eventStroage:[callback];
};

//触发 @eventName : 事件名称  @target : 事件对象
eventInterface.prototype.emit=function(eventName,target){
    (this.eventStroage[eventName]||[]).forEach(function (fn) {
        fn(target,eventName);
    });
};

//销毁
eventInterface.prototype.destroy=function(eventName,callback){
    var eventStroage=this.eventStroage[eventName]||[];
    if(callback){
        var local=eventStroage.indexOf(callback);
        if(local !== -1)eventStroage.splice(local,1);
    }else{
        delete this.eventStroage[eventName];
    }
};

module.exports=eventInterface;