/**
 * Created by xiyuan on 16-12-7.
 */
gridConf({
    //数据接口 ,没有则不请求网络数据,需自行在数据过滤函数中返回
    "url": "./serverData/data/list/grid.data",
    //网络请求的类型 如: POST | GET
    "method": "GET",
    //页面数据展示的条数
    "pageSize": 20,
    //页面可选展示的条数
    "pageSizeList": [10, 20, 30],
    //数据默认排序 [ asc | desc ]
    order: "asc",
    //排序的字段
    "orderField": "id",
    //数据请求时候发送的附带数据
    "sendData": {
        testData: 'ok',
        struct:{
            0:'0'
        }
    },
    //列表左边操作
    "leftColsModel": [
        {
            titleConfig: function () {
                //开发者专用作用域
                var developScope = this.developScope;
                //检查并设置初始值
                developScope.isAllChecked = false;
                developScope.masterChange = false;
                developScope.allChecked = false;
                //主选择框选择时间标识
                developScope.allCheckedTime = Date.now();
                developScope.allCheckedCount === undefined && (developScope.allCheckedCount = 0);

                return {
                    template: '<input type="checkbox" $-on:change="onChange" $-checked:false="developScope.allChecked">',
                    scope: {
                        developScope: developScope,
                        onChange: function () {
                            if (this.checked) {
                                developScope.isAllChecked = true;
                                developScope.allChecked = true;
                                developScope.allCheckedCount = developScope.gridListData.dataList.length;
                            } else {
                                developScope.isAllChecked = false;
                                developScope.allChecked = false;
                                developScope.allCheckedCount = 0
                            }
                            developScope.masterChange = true;
                            developScope.allCheckedTime = Date.now()
                        }
                    },
                    filter: {
                        checkedHandle: function (isAllChecked) {
                            developScope.masterChange = true;
                            return isAllChecked
                        }
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
    ],
    //字段模型
    "colsModel": [
        {
            //字段标题
            name: "客户名称",
            //字段key
            field: "CUSTOMER_OWNER_ID_UNAME",
            //是否需要开启排序
            order: true,
            //字体 对齐方式
            align: "center",
            //列表数据配置
            listConfig: function (data, rowData, index) {
                return {
                    template: '<p $-parses-bind:style="index|colorHandel">{{content}}</p>',
                    scope: {
                        content: index + ':' + data,
                        index:index,
                        color:index%2?'red':'pink'
                    },
                    filter:{
                        colorHandel:function (index) {
                            return "color:{{color}}"
                        }
                    },
                    content: '',
                    events: {}
                }
            }
        },
        {
            name: "客户ID",
            field: "CUSTOMER_ID",
            order: false,
            align: "center"
        },
        {
            //字段标题
            name: "城市",
            //字段key
            field: "CITY_S_NAME",
            //是否需要开启排序
            order: true,
            //字体 对齐方式
            align: "center",
            //标题配置
            titleConfig: {
                content: '客户城市',
            },
            //列表数据配置
            listConfig: function (data, rowData, index) {
                return {
                    content: index
                }
            }
        },
        {
            name: "客户(类型)",
            field: "CUSTOMER_S_KHFL_DNAME",
            align: "center",
            //标题配置
            titleConfig: {
                template: '客户{{type}}',
                scope: {
                    type: '类型'
                }
            }
        },
        {
            name: "审核状态",
            field: "CUSTOMER_S_S_SYNS_DNAME",
            align: "center"
        },
        {
            name: "区域",
            field: "CUSTOMER_ORG_CODE_ONAME",
            order: true,
            align: "center"
        },
        {
            name: "最后更新时间",
            field: "CUSTOMER_LAST_UPDATE_TIME",
            order: false,
            align: "center"
        },
        {
            name: "创建时间",
            field: "CREATE_TIME",
            order: false,
            align: "center"
        }
    ],
    //行事件处理
    events: {
        click: function () {
            console.log('click',arguments)
        },
        hover: function () {

        },
        unHover: function () {

        },
        /*select: function () {

        },
        unSelect: function () {

        }*/
    },
    /**
     * 数据过滤
     * @param data
     * @param [callback]
     */
    filtration: function (data, callback) {
        return data;
    },
    /**
     * 数据初始化配置
     * @param resData
     * @param $interface
     */
    dataInitConf: function (gridListData, $interface) {
        //往开发作用域中存储列表数据
        $interface.developScope.gridListData = gridListData;
    }

})