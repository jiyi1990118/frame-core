/**
 * Created by xiyuan on 17-6-4.
 */

model('gridConf',['$:custom/gridConf:gridStruct'],function (gridStruct) {

    var This=this;

    var gridConf={
        //列表左边操作
        "leftColsModel": [
            {
                titleConfig: function () {

                    return '<input type="checkbox">'
                },
                listConfig: function (data, rowData, index, gridListData) {
                    return '<input type="checkbox" >'
                }
            },
            {
                //列表序号
                name: '序号',
                listConfig: function (data, rowData, index) {
                    return index + 1
                }
            },
            {
                name: '操作',
                listConfig: function () {
                    var actionElm=document.createElement('span');
                    actionElm.className="iconfont icon-fenlei";

                    vf.loadPlugins('PLUGINS/menu/dropMenu',function(dropMenu){
                        dropMenu(actionElm,{
                            list:[
                                {
                                    content:'<span>栏目一</span>',

                                    click:function(){

                                        console.log('yes')

                                    }
                                },
                                {
                                    content:'<span>栏目二</span>'
                                },
                                {
                                    content:'<span>栏目三</span>'
                                },
                            ]
                        })
                    })


                    return actionElm
                }
            }
        ]
    }


    //数据请求触发器
    this.trigger('request',function (viewId) {

        This.server({
            serverType:'api',
            url:'gridViewRender'
        }).error(function (data,option) {
            console.error('列表渲染请求出错! ['+data.message+']');
        }).success(function (resData) {
            This.exports=gridStruct(resData,viewId,gridConf);
        }).send({
            viewId:viewId
        });

        /*This.server({
            serverType:'jsonp',
            method:'gridConf',
            url:'./project/serverData/config/list/gridConf.js'
        }).error(function (data,option) {
            console.error('列表渲染请求出错!');
        }).success(function (resData) {
            This.exports=resData;
        }).send({
            viewId:viewId
        });*/

    });
})