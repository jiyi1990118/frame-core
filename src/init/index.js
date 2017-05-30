/**
 * Created by xiyuan on 17-5-29.
 */

'use strict';

//内部事件
var insideEvent=require('../inside/event/insideEvent');

//框架应用配置
var frameConf=require('../inside/config/index');

//框架引导程序
var boot=require('./boot/index');

module.exports={
    exec:function () {
        //触发配置初始化
        insideEvent.emit('config:init', this);

        //加载url路径配置
        frameConf.loadUrlConf(function (state) {
            //引导启动
            if(state) boot.start();
        });
    }
}