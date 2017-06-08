/**
 * Created by xiyuan on 17-6-7.
 */

//列表结构
extend('gridStruct',function () {

    var server=this.server;
    var LIB=this.lib;

    var gridStruct={
        //页面数据展示的条数
        pageSize: 20,
        //页面可选展示的条数
        pageSizeList: [10, 20, 30],
        //数据默认排序 [ asc | desc ]
        order: "asc",
        //排序的字段
        orderField: "id",
        //数据请求时候发送的附带数据
        sendData: {},
        //列表左边操作
        leftColsModel: [],
        //字段模型
        colsModel: [],
        //行事件处理
        events: {
            click: function () {
            }
        },
        //数据初始化配置
        dataInitConf: function (gridListData) {

        },
        filtration:filtration
    }

    function listConfig(data) {
        return /*data === undefined || */data === null ?'':data;
    }
    
    //列表字段数据转换
    function gridFieldIConvert(fieldInfo) {
        var subjoin = '',
            colModel = {
                id:fieldInfo.id,
                //字体 对齐方式
                align: "center",
                name: fieldInfo.columnName
            },
            fieldKey = fieldInfo.moduleCode + '_' + fieldInfo.phyColumnName;

        //字段类型检查
        switch (Number(fieldInfo.showColValSet)) {
            case 2:
                subjoin = '_DNAME';
                break;
            case 3:
                subjoin = "_ONAME";
                break;
            case 4:
                subjoin = "_UNAME";
                break;
            case 5:
                subjoin = "_RNAME";
                break;
            default :
                switch (Number(fieldInfo.showType)) {
                    case 1:
                        switch (fieldInfo.colMark) {
                            case 'money':
                                colModel.listConfig = function (data) {
                                    return data ? Number(data).toLocaleString() : '';
                                };

                                break;
                            case 'foreignkey':

                                subjoin = "_RNAME";
                                break;
                        }
                        break;
                    case 5:
                        subjoin='';
                    //时间类型
                    case 6:
                        colModel.listConfig= function (data, rowData, index) {
                            if(!data)return '';
                            switch (fieldInfo.dateType) {
                                case 'date':
                                    data = LIB.date.convert(data, 'yy-mm-dd');
                                    break;
                                case 'time':
                                    data = LIB.date.convert(data, 'hh:ii:ss');
                                    break;
                                case 'datetime':
                                default:
                                    data = LIB.date.convert(data, 'yy-mm-dd hh:ii:ss');
                                    break;
                            }
                            return {
                                content: data
                            }
                        };
                        break;
                    case 7:
                        subjoin = "_SDNAME";
                        break;
                    case 8:
                        subjoin = "_FNAME";
                        break;
                    case 9:
                        subjoin = "_IMGNAME";
                        break;
                    default :
                        subjoin = "_RNAME"
                }
        }

        fieldInfo.fieldKey = fieldKey;
        //字段
        colModel.field = fieldKey + subjoin;

        if(!colModel.listConfig){
            colModel.listConfig=listConfig
        }
        return colModel;
    }

    //数据过滤函数
    function filtration(sendData,callback) {

        server({
            url:'gridData',
            serverType:'api'
        }).success(function (res) {
            callback({
                "dataCount": res.totalRecord,
                "dataList": res.record
            })
        }).error(function (res) {
            console.error('列表数据请求出错! ['+res.message+']');
        }).send(sendData)
    }

    return function (resData,viewId,gridConf) {

        var columnList=resData.columnList,
            struct ={}.extend(gridStruct),
            showFieldInfo={},
            hiddenFieldInfo={};


        struct.sidx=resData.sidx.sidx;
        struct.order=resData.sidx.order;
        struct.sendData.viewId=viewId;

        struct.leftColsModel=[];
        struct.colsModel=resData.showColumnList.reduce(function(arr,val,index){
            arr[index]=val=gridFieldIConvert(val);
            showFieldInfo[val.id]=val;
            return arr;
        },[]);

        columnList.forEach(function (info) {
            if(!showFieldInfo[info.id])hiddenFieldInfo[info.id]=info;
        })

        Object.keys(gridConf||{}).forEach(function (key) {
            struct[key]=gridConf[key];
        })

        return struct;
    }
});