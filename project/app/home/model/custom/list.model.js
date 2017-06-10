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

                    return {
                        template: '<input type="checkbox" v-on:change="onChange" $-checked:false="developScope.allChecked">',
                        scope: {

                        },
                        filter: {

                        }
                    }
                },
                listConfig: function (data, rowData, index, gridListData) {


                    return {
                        template: '<input $-model="$isChecked" type="checkbox" >',
                        scope: {
                            text:2
                        },
                        filter: {

                        }
                    }
                }
            },
            {
                //列表序号
                name: '序号',
                listConfig: function (data, rowData, index) {
                    return {
                        content: index + 1
                    }
                }
            },
            {
                name: '操作',
                listConfig: function () {

                    console.log(arguments)
                    return {
                        template: '<span  class="iconfont icon-fenlei"></span>',
                        scope: {
                            menu:{

                            }
                        },
                        events: {}
                    }
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