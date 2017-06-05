/**
 * Created by xiyuan on 17-6-4.
 */

model('gridConf',function () {

    var This=this;

    //数据请求触发器
    this.trigger('request',function (viewId) {

        This.server({
            serverType:'api',
            url:'gridViewRender'
        }).error(function (data,option) {
            console.error('列表渲染请求出错!');
        }).success(function (resData) {
            console.log(resData)
        }).send({
            viewId:viewId
        });
    });


})