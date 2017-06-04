/**
 * Created by xiyuan on 16-12-7.
 */

treeConf({
    checkbox:true,
    actions:{
        click:function () {
            console.log(arguments)
        },
        select:function () {
            // console.log(arguments,'select')
        },
        unselect:function () {
            // console.log(arguments,'unselect')
        },
        selectChange:function () {
            // console.log(arguments,'change')
        }
    },
    btns:[
        {
            name:'新增',
            content:'<i class="iconfont icon-add"></i>',
            events:{
                click:function (eve,nodeInfo,treeInfo,method) {
                    console.log('yes',nodeInfo,treeInfo)
                    nodeInfo.name+='++';
                    method.add({
                        checked:true,
                        name:'+++++'
                    })
                }
            }
        },
        function (nodeData) {
            return nodeData.name == '人力资源一部'?{
                name:'修改',
                content:'<i class="iconfont icon-icon4">',
                events:{
                    click:function (eve,nodeInfo,treeInfo,method) {
                        nodeInfo.name='名称已修改！'
                    }
                }
            }:null;
        },
        function (nodeData) {
            return {
                name:'删除',
                content:'<i class="iconfont icon-shanchu"></i>',
                events:{
                    click:function (eve,nodeInfo,treeInfo,method) {
                        method.remove();
                    }
                }
            }
        }
    ],
    list:[
        {
            isOpen:true,   //节点是否展开
            checked:true, //节点的输入框是否被勾选
            name:'赞同科技上海',//节点的名称
            events: {
                click: function () {
                    console.log("我点击了最外层li");
                },
                mouseover:function () {
                    console.log(arguments)
                }
            },
            children:[
                {
                    checked:true,
                    name:'人力资源总部',
                },
                {
                    checked:false,
                    name:'人力资源一部'
                },
                {
                    checked:false,
                    name:'人力资源二部'
                }
            ]
        },
        {
            isOpen: true,   //节点是否展开
            checked: false, //节点的输入框是否被勾选
            name: '赞同科技西安'//节点的名称
        },
        {
            isOpen:true,   //节点是否展开
            checked:false, //节点的输入框是否被勾选
            name:'赞同科技北京',//节点的名称
            events: {
                click: function () {
                    // console.log("我点击了最外层li");
                }
            },
            children:[
                {
                    checked:false,
                    name:'人力资源总部'
                },
                {
                    checked:false,
                    name:'人力资源一部'
                },
                {
                    checked:false,
                    name:'人力资源二部',
                    children:[
                        {
                            isOpen:true,   //节点是否展开
                            checked:false, //节点的输入框是否被勾选
                            name:'赞同科技北京',//节点的名称
                            events: {
                                click: function () {
                                    // console.log("我点击了最外层li");
                                }
                            },
                            children:[
                                {
                                    checked:false,
                                    name:'人力资源总部'
                                },
                                {
                                    checked:false,
                                    name:'人力资源一部'
                                },
                                {
                                    checked:false,
                                    name:'人力资源二部'
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            isOpen:true,   //节点是否展开
            checked:false, //节点的输入框是否被勾选
            name:'赞同科技北京',//节点的名称
            events: {
                click: function () {
                    // console.log("我点击了最外层li");
                }
            },
            children:[
                {
                    checked:false,
                    name:'人力资源总部'
                },
                {
                    checked:false,
                    name:'人力资源一部'
                },
                {
                    checked:false,
                    name:'人力资源二部',
                    children:[
                        {
                            isOpen:true,   //节点是否展开
                            checked:false, //节点的输入框是否被勾选
                            name:'赞同科技北京',//节点的名称
                            events: {
                                click: function () {
                                    // console.log("我点击了最外层li");
                                }
                            },
                            children:[
                                {
                                    checked:false,
                                    name:'人力资源总部'
                                },
                                {
                                    checked:false,
                                    name:'人力资源一部'
                                },
                                {
                                    checked:false,
                                    name:'人力资源二部'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});