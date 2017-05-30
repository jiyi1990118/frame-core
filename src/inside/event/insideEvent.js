/**
 * Created by xiyuan on 17-5-29.
 */

'use strict';
var eventInterface=require('./eventInterface');

var insideEvent=new eventInterface();

/*监听配置初始化开始*/
insideEvent.watch('config:init',function(){
    console.log('yes')
});

/*监听配置加载*/
insideEvent.watch('config:load',function(event){

});

/*监听配置初始化完毕*/
insideEvent.watch('config:end',function(event){

});

/*监听框架是否开始运行*/
insideEvent.watch('boot:start',function(event){

});

/*监听路由开始*/
insideEvent.watch('route:start',function(event){
    console.log(this,event)
});

/*页面渲染事件*/
insideEvent.watch('page:render',function(event){
    //代理框架外部页面渲染事件
});


module.exports=insideEvent;