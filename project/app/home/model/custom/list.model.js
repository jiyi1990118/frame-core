/**
 * Created by xiyuan on 17-6-4.
 */

model('gridConf',['$:lib:gridConf','@lib/'],function ($gridConf) {

    var This=this;

    //数据请求触发器
    this.trigger('request',function (viewId) {

        /*This.server({
            serverType:'api',
            url:'gridViewRender'
        }).error(function (data,option) {
            console.error('列表渲染请求出错!');
        }).success(function (resData) {
            This.exports=resData;
        }).send({
            viewId:viewId
        });*/

        This.server({
            serverType:'jsonp',
            method:'gridConf',
            url:'./project/serverData/config/list/gridConf.js'
        }).error(function (data,option) {
            console.error('列表渲染请求出错!');
        }).success(function (resData) {
            This.exports=resData;
        }).send({
            viewId:viewId
        });

    });


})