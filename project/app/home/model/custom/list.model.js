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
                        template: '<input type="checkbox" $-on:change="onChange" $-checked:false="developScope.allChecked">',
                        scope: {

                        },
                        filter: {

                        }
                    }
                },
                listConfig: function (data, rowData, index, gridListData) {
                    var developScope = this.developScope,
                        dataLen = gridListData.length,
                        isSelf = false,
                        scope = {
                            developScope: developScope,
                            onChange: function () {
                                isSelf = true;

                                developScope.allCheckedCount = this.checked ? developScope.allCheckedCount + 1 : developScope.allCheckedCount - 1;

                                if (dataLen === developScope.allCheckedCount) {
                                    developScope.allChecked = true;
                                } else {
                                    developScope.allChecked = false;
                                }
                            },
                            onClick:function (e) {
                                e.stopPropagation();
                            }
                        };

                    return {
                        template: '<input $-on:change="onChange" $-on:click="onClick" $-model="$isChecked" type="checkbox" $-checked:false="developScope.isAllChecked|checkedHandle:[$,developScope.allCheckedTime]">',
                        scope: scope,
                        filter: {
                            checkedHandle: function (isAllChecked) {

                                var isChecked = false;

                                if (!isSelf || developScope.masterChange) {
                                    isChecked = isAllChecked
                                } else if (isSelf && isAllChecked) {
                                    isChecked = true;
                                }

                                isSelf = false;
                                developScope.masterChange = false;

                                return isChecked;

                            }
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

                    return {
                        template: '<span $-drop-menu="dropMenuConfig" $-on:click="onClick"  class="iconfont icon-fenlei"></span>',
                        scope: {
                            dropMenuConfig: {
                                config:{
                                    position:'right'
                                },
                                list: [
                                    {
                                        content: '<span $-on:click="events.click">栏目一</span>',
                                        scope:{
                                            events:{
                                                click:function () {
                                                    // alert('ok')
                                                }
                                            }
                                        },
                                        filter:{

                                        },
                                        events:{
                                            click:function () {
                                                console.log('---------')
                                            }
                                        }
                                    },
                                    {
                                        content: '栏目二'
                                    },
                                    {
                                        content: '栏目三'
                                    }
                                ]
                            },
                            onClick:function (e) {
                                e.stopPropagation();
                            }
                        },
                        events: {}
                    }
                }
            },
            {
                titleConfig: {
                    template: '自定义',
                    scope: {},
                    content: '',
                    events: {}
                },
                listConfig: function (data, rowData, index) {
                    return {
                        template: index,
                        scope: {},
                        content: '',
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
            console.log(resData=gridStruct(resData,viewId,gridConf))
            This.exports=resData;
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