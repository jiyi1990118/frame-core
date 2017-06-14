/**
 * 列表数据转换处理
 * Created by lei on 17-1-5.
 */
extend(['../treat/gridBtnOperation'],function (gridBtnOperation) {

    // viewId = $_GET['viewId'];

    //顶部按钮组件的数据提取
    function extractTopBtn (btnList,view,gridApi) {
        var colList = [];
        if (btnList != null && btnList.length > 0) {
            for(var key in btnList){
                var btndata = btnList[key];
                if (btndata.operationPosition == '0') {
                    if (btndata.status == '0') {
                        var list ={
                            class:'btn btn-teal',//按钮样式
                            icon:btndata.iconClass, //图标
                            label:btndata.operationName, //按钮文字
                            align:'left', //文字居左
                            padding:'4px 14px',//按钮内边距，可以控制按钮大小
                            events:gridBtnOperation('',btndata,view,gridApi),
                            iconEvents:{
                                click:function (event) {
                                    //停止事件冒泡
                                    event.stopPropagation();
                                    console.log(this,this.innerHTML,event)
                                    alert(this);
                                }
                            }
                        }
                    }
                };
                colList.push(list)
            }
        };
        var  listArrBtn = []; //去重
        for(var key in colList){
            if(colList[key] != undefined && listArrBtn.indexOf(colList[key]) < 0){
                listArrBtn.push(colList[key])
            }
        }
        return listArrBtn;
    }



    //条件判断函数
    function showResult(sourceColumnData, conditionValue, conditionType) {
        sourceColumnData = String(sourceColumnData);
        conditionValue = String(conditionValue);
        conditionType = Number(conditionType);
        switch (conditionType) {
            case 1:
                if (sourceColumnData > conditionValue) {
                    return true;
                } else {
                    return false;
                }
                break;
            case 2:
                if (sourceColumnData < conditionValue) {
                    return true;
                } else {
                    return false;
                }
                break;
            case 3:
                if (sourceColumnData == conditionValue) {
                    return true;
                } else {
                    return false;
                }
                break;
            case 4:
                if (sourceColumnData >= conditionValue) {
                    return true;
                } else {
                    return false;
                }
                break;
            case 5:
                if (sourceColumnData <= conditionValue) {
                    return true;
                } else {
                    return false;
                }
                break;
            case 6:
                if (sourceColumnData.indexOf(String(conditionValue)) >= 0) {
                    return true;
                } else {
                    return false;
                }
                break;
            case 7:
                if (sourceColumnData != conditionValue) {
                    return true;
                } else {
                    return false;
                }
                break;
            case 8:
                //if(sourceColumnId > conditionValue){return true;}else{return false;};
                break;
        }
    };


    //列表操作的数据提取
    function operationDateextract (rowData,gridApiConf,gridApi) {

        //得到操作列表数据
        var btnList = gridApiConf.operationList;
        var operationConditions = gridApiConf.operationRuleList;      //操作条件
        var showCols = gridApiConf.showColumnList;                 //显示字段列表
        var view = gridApiConf.view;                //视图信息

        //判断操作显隐的函数 返回布尔值
        var judgeShowOrHide = function (showCols,operationConditions,btndata) {
            // console.log(rowData,"ddddddddddddddddddddddd")
            if (operationConditions != "" && operationConditions != null) {
                var result = true;
                for (var k in operationConditions) {
                    var operationConditionsChosen = operationConditions[k];
                    var affectOperationId = operationConditionsChosen.affectOperationId;
                    var meOperationRuleConditionList = operationConditionsChosen.meOperationRuleConditionList[0];
                    var sourceColumnId = meOperationRuleConditionList.sourceColumnId;
                    var conditionType = meOperationRuleConditionList.conditionType;
                    var conditionValue = meOperationRuleConditionList.conditionValue;
                    if (affectOperationId == btndata.id) {
                        var strs = "";
                        for (var key in showCols) {
                            var coldata = showCols[key];
                            if (sourceColumnId == coldata.id) {
                                strs = coldata.moduleCode + "_" + coldata.phyColumnName;
                            }
                        }
                        result = !showResult(rowData[strs], conditionValue, conditionType);
                    }
                    if (!result) {
                        break;
                    }
                }
                return result;
            } else {
                return true;
            }
        }(showCols,operationConditions,btndata)


        // console.log(judgeShowOrHide)
        var listExtract = [];
        //对拿到的数据做处理判断
        if (btnList != null && btnList.length > 0) {
            for(var key in btnList){
                var btndata = btnList[key];
                if (btndata.type != "1" && btndata.type != "6" && btndata.operationPosition == 1) {
                    if (btndata.type != "4") {
                        var btn = gridBtnOperation(rowData,showCols,operationConditions,btndata,view,gridApi);
                    }
                }
                if (btn && judgeShowOrHide == true){
                    listExtract.push(btn)
                }
            }
        }
        var  listArr = []; //去重
        for(var key in listExtract){
            if(listArr.indexOf(listExtract[key]) < 0){
                listArr.push(listExtract[key])
            }
        }
        return listArr;
    }


    //列表接口数据转换
    function exportFunc(viewId,gridApiConf,gridApi) {

        var colList = gridApiConf.columnList;                  //所有字段列表
        var showCols = gridApiConf.showColumnList;                 //显示字段列表
        var btnList = gridApiConf.operationList;                  //按钮列表
        var relatedModule = gridApiConf.moduleRelatedMap;            //外键关系信息
        var operationConditions = gridApiConf.operationRuleList;      //操作条件
        var specialShowdata = gridApiConf.viewSpcShowList             //特殊显示条件
        var orderData = gridApiConf.sidx;                //:列表排序信息
        var view = gridApiConf.view;                //视图信息

        var defaultSearchTagId = view.defaultSearchTagId;   //默认的查询标签，如果存在就渲染

        var moduleId = $_GET['moduleId'],
            recordId = $_GET['recordId'];


        var gridConf;
        gridFieldInfo = {};
        //顶部按钮
        topBtn = extractTopBtn(btnList,view,gridApi);

        //**************列表标题****************

        //初始显示字段的列表
        var showColsLists = "";
        for (var k in showCols) {
            showColsLists +=showCols[k].name+",";
        }


        var resList=[];

        //遍历所有字段列表将colModel拼进数组
        colList.forEach(function (menuInfo) {
            //比较显示字段和所有字段，满足条件显示该字段

            //列表字段数据转换
            var subjoin = '',
                colModel = {
                    name: menuInfo.columnName,
                    align:'center',
                    //是否需要开启排序
                    order: true,
                },
                fieldKey = menuInfo.moduleCode + '_' + menuInfo.phyColumnName;

            //字段类型检查
            switch (Number(menuInfo.showColValSet)) {
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
                    switch (Number(menuInfo.showType)) {
                        case 1:
                            switch (menuInfo.colMark) {
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
                        //时间类型
                        case 6:
                            //添加数据回调处理
                            colModel.listConfig = function (data, colData) {

                                var newDate = new Date();
                                newDate.setTime(data);

                                if(!data)return '';
                                switch (menuInfo.dateType) {
                                    case 'date':
                                        temp = '{{data|Date:[$,"hh:ii:ss"]}}';
                                        break;
                                    case 'time':
                                        temp = '{{data|Date:[$,"yy-mm-dd h:m:s"]}}';
                                        break;
                                    case 'datetime':
                                        temp = '{{data|Date:[$,"yy-mm-dd"]}}';
                                        break;
                                    default:
                                        temp = '{{data|Date:[$,"yy-mm-dd"]}}';
                                }
                                return {
                                    template: temp,
                                    scope:{data:data}
                                };
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
                            var fieldData = btnList;
                            fieldData && function (filedInfo) {
                                filedInfo && filedInfo.columnId == menuInfo.id && (subjoin = "_RNAME");
                            }(fieldData[menuInfo.columnCode])
                    }
            }

            menuInfo.fieldKey = fieldKey;
            //字段
            colModel.field = fieldKey + subjoin;

            resList.push(colModel);



        });


        var storageChanges = [],  //存储改变的字段配置数据
            storageFileds =[];    ///存储改变的字段

        //显示更多字段
        var moreField = {
            titleConfig: {
                template: '<div $-render="init" $-on:click="setMoreConfig" class="iconfont icon-shezhi1" style="width: 25px;height: 25px;padding-top:5px;cursor:pointer"></div>',
                scope: {
                    init:function (ele) {           //改变更多设置图标的样式问题
                        setTimeout(function () {    //异步，需要定时器才能挂上
                            ele.parentNode.style.width='25px';
                        },100)
                    },
                    setMoreConfig:function(){
                        var showColsData = '',
                            moreFieldCon = [],
                            filedAggregate =[],  //页面展示的字段内容
                            PageShowFiledList = document.querySelectorAll('.list-grid .grid-header-row strong');

                        gridConf.colsModel.forEach(function(list){
                            if(list){
                                filedAggregate.push(list.name)
                            }

                        });

                        //遍历所有字段显示
                        colList.forEach(function (menuInfo) {
                            //更多字段中的内容
                            var moreFieldList = {
                                checked:filedAggregate.indexOf(menuInfo.columnName) >= 0,
                                value:menuInfo.id,
                                content:menuInfo.columnName
                            }

                            moreFieldCon.push(moreFieldList)
                        })


                        $packages('{PLUGINS}/modal/modal-dialog',function (dialog) {
                            dialog({
                                title:'操作提示',
                                maxmin:true,
                                content:'<div class="dialogBody"><ul><li $-for="fieldInfo in dataList"><input name="showcols" type="checkbox" $-bind:value="fieldInfo.value" $-bind:checked="fieldInfo.checked"><span>{{fieldInfo.content}}</span></li></ul></div>',
                                scope:{
                                    dataList:moreFieldCon
                                },
                                filter:{},
                                width:'600px',
                                height:'300px',
                                btns:[
                                    {
                                        name:'确认',
                                        trigger:function (eve,interface) {

                                            var realShowCol=[],
                                                reduceFiled = [], //减少显示字段的集合
                                                addFiled = [],    //增加显示字段的集合
                                                successModle = [],
                                                inputs = document.querySelectorAll('[name="showcols"]');

                                            inputs.forEach(function (single){
                                                if(single.checked){
                                                    realShowCol.push(single.nextSibling.innerHTML);
                                                }
                                            });
                                            // console.log(realShowCol)

                                            //设置中减少显示字段
                                            filedAggregate.forEach(function(res){
                                                if(res && realShowCol.indexOf(res) < 0){
                                                    reduceFiled.push(res)
                                                }
                                            })

                                            //设置中增加显示字段
                                            realShowCol.forEach(function(res){
                                                if(res && filedAggregate.indexOf(res) < 0){
                                                    addFiled.push(res)
                                                }
                                            })

                                            //数组方法(reverse)将数组倒叙，目的是为了解决下面数组配置数组的删除紊乱问题
                                            reduceFiled.reverse();
                                            // console.log(reduceFiled,addFiled)

                                            //遍历减少显示字段的集合，并改变数据配置在页面中实现变动
                                            reduceFiled.forEach(function(res){
                                                //得到该字段在显示中的索引值
                                                var index = filedAggregate.indexOf(res);

                                                var changeFileds = gridConf.colsModel.splice(index,1);

                                                storageChanges.push(changeFileds);
                                                storageFileds.push(changeFileds[0].name)

                                            })


                                            //遍历增加 显示字段的集合，并改变数据配置在页面中实现变动
                                            addFiled.forEach(function(res){
                                                //得到该字段在显示中的索引值
                                                var index = realShowCol.indexOf(res),
                                                //得到在储存改变字段集合 中的所以只
                                                    selfIndex = storageFileds.indexOf(res)

                                                gridConf.colsModel.splice(index,0,storageChanges[selfIndex][0]);
                                            })







                                            interface.close();
                                        }
                                    },
                                    {
                                        name:'取消',
                                        trigger:function (eve,interface) {
                                            interface.close();
                                        }
                                    }
                                ]
                            })
                        })

                    }
                }
            },
            listConfig:function(data, rowData, index){
                return{
                    // content:index
                }
            }
        }


        resList.push(moreField)
        //*****************************

        // 特殊显示变色部分
        //对比的字段id提取
        var specialShowId = [];
        //遍历对比提取相关字段key 与条件信息
        specialShowdata.forEach( function (val) {
            colList.forEach( function (fieldInfo) {
                //比对列字段的id与条件指定的ID是否一致
                if (fieldInfo.id == val.showColumn){
                    //实际字段
                    var field,
                        subjoin = '';
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
                                //时间类型
                                case 6:
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
                                    var fieldData = btnList;
                                    fieldData && function (filedInfo) {
                                        filedInfo && filedInfo.columnId == fieldInfo.id && (subjoin = "_RNAME");
                                    }(fieldData[fieldInfo.columnCode])
                            }
                    }

                    //拼接字段key
                    field = fieldInfo.moduleCode + '_' + fieldInfo.phyColumnName + subjoin;

                    //存储条件字段与相关条件信息
                    specialShowId.push({
                        field: field,
                        specialVal: val
                    });
                }
            })
        })
        //此处主要处理列表数据条件(颜色显示处理)
        resList[0].listConfig = function(data, rowData, index ,gridListData,eles){

            return {
                template: '<span $-render="eles|getParentNode">{{data}}</span>',
                scope:{
                    data:data,
                    index:index,
                    eles:eles
                },
                filter:{
                    getParentNode:function(){
                        return function(e){
                            // //如果此处发现对比字段不存在直接return，不执行后面
                            if (!specialShowId.length) {
                                return
                            }
                            //遍历条件字段
                            specialShowId.forEach(function (specialInfo) {
                                var val = specialInfo.specialVal,
                                    field= specialInfo.field,
                                    cUserCode = val.showColumn,             //选择特殊显示列
                                    searchType = val.searchType,          //筛选条件 1 :  大于 2： 小于 3 ： 等于 4：大于等于 5 ： 小于等于 6 ： 包含 7 ： 不等于 8 ： 在A与B的区间
                                    showVal = val.showVal,                 //选择颜色
                                    searchVal = val.searchVal,
                                    fieldVal = rowData[field],   //字段值
                                    pass;

                                if(fieldVal === undefined || fieldVal === null){
                                    return
                                }
                                // console.log(specialInfo)
                                //对比类型判断
                                switch (Number(searchType)) {
                                    case 1:
                                        fieldVal > searchVal && (pass = true);
                                        break;
                                    case 2:
                                        fieldVal < searchVal && (pass = true);
                                        break;
                                    case 3:
                                        fieldVal == searchVal && (pass = true);
                                        break;
                                    case 4:
                                        fieldVal >= searchVal && (pass = true);
                                        break;
                                    case 5:
                                        fieldVal <= searchVal && (pass = true);
                                        break;
                                    case 6:
                                        String(fieldVal).indexOf(searchVal) !== -1 && (pass = true);
                                        break;
                                    case 7:
                                        fieldVal != searchVal && (pass = true);
                                        break;
                                }


                                if (pass) {
                                    setTimeout(function () {
                                        console.log(index,eles,searchVal)
                                        eles.rightContainer.querySelectorAll('ul')[index].style.backgroundColor = showVal;
                                        eles.leftContainer.querySelectorAll('ul')[index].style.backgroundColor = showVal;

                                    }.bind(this), 10)
                                }

                            }.bind(this))
                        }
                    }
                },
                content: '',
                events: {}
            }

        }.bind(this)


        //列表配置
        gridConf = {
            // "url": "http://paas.mecrmcrm.com/debug/afa4j/custom/C12002",
            "method": "POST",
            //页面数据展示的条数
            "pageSize": 20,
            //页面可选展示的条数
            "pageSizeList": [10, 20, 30],
            //数据默认排序 [ asc  | desc ]
            order: orderData.order,
            //排序的字段
            "orderField": 'id',   //orderData.sidx
            "sendData": {

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
                                onClick:function(e){
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
                    name: '操作',
                    listConfig: function (data,rowData) {

                        return {
                            template: '<span $-drop-menu="dropMenuConfig" class="iconfont icon-fenlei"></span>',
                            scope: {
                                dropMenuConfig: {
                                    config:{
                                        position:'right'
                                    },
                                    list: operationDateextract(rowData,gridApiConf,gridApi)
                                }
                            },
                            events: {}
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
                }

            ],
            //字段模型
            "colsModel": resList,
            //行事件处理
            events: {
                click: function () {

                },
                hover: function () {

                },
                unHover: function () {
                    console.log('11111111111111111111115555555555555555555555555')
                },
                select: function () {

                },
                unSelect: function () {

                }
            },
            /**
             * 数据过滤
             * @param data
             * @param [callback]
             */
            filtration: function (data, callback) {
                var  index = data.orderField.indexOf('_');
               
                $FRAME.server({
                    serverType:'api',
                    method: 'POST',
                    url: 'babygridStructure'  //真实数据详情页面子数据C12012
                }).fail(function (res) {
                    callback({});
                }).success(function (resData) {
                    callback({
                        //获取的数据总条数
                        "dataCount": resData.totalRecord,
                        //获取的数据列表
                        "dataList":resData.record
                    })
                }).send({
                    "viewId":viewId,
                    "curModuleId":moduleId,
                    "recordId":recordId,
                    "pageNow":data.pageNow,
                    "pageSize":data.pageSize,
                    "sidx":data.orderField,
                    "order":data.order
                });

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
        }

        // 行点击显示详情
        if (operationConditions != null && operationConditions != "") {
            gridConf.events.click = function (data, index,rowData){

                event.stopPropagation();
                // console.log(data, rowData, index)
                var recordId = rowData.ID;
                // var cp = document.querySelector(".grid-footer .footer-left .grid-paging-center").querySelector(".focus span").innerHTML
                var strs = "";         //条件的字段名
                var rowBtnForwardId_0 = "", count = 0;  //跳转页面的ID值
                for (var k in operationConditions) {
                    var operationConditionsChosen = operationConditions[k];
                    var affectOperationId = operationConditionsChosen.affectOperationId;
                    var meOperationRuleConditionList = operationConditionsChosen.meOperationRuleConditionList;
                    var ruleCondFlag = false;               //用于判断当前条件是否有满足条件
                    for(var key in meOperationRuleConditionList){
                        var meOperationRuleCondition = meOperationRuleConditionList[key];
                        var sourceColumnId = meOperationRuleCondition.sourceColumnId;
                        var conditionType = meOperationRuleCondition.conditionType;
                        var conditionValue = meOperationRuleCondition.conditionValue;
                        strs="";
                        //循环字段 用于取条件的字段名
                        for (var colkey in colList) {
                            var coldata = colList[colkey];
                            if (sourceColumnId == coldata.id) {
                                strs = coldata.moduleCode.toUpperCase() + "_" + coldata.phyColumnName;
                                break;
                            }
                        }
                        for (var btnkey in btnList) {
                            var btndata = btnList[btnkey];
                            if (btndata.type == '4' && affectOperationId == btndata.id) {        //判断当前操作是否属于当前影响数据的条件
                                if (!showResult(rowData[strs], conditionValue, conditionType)) {    //不满足条件时执行
                                    rowBtnForwardId_0=btndata.forwardVid;                        //定义跳转页面的id值
                                    count = count+1;
                                }else{
                                    ruleCondFlag = true;
                                    count = 0;
                                    break;
                                }
                            }
                        }
                        if (ruleCondFlag) {
                            rowBtnForwardId_0 = "";
                            break;
                        }
                    }
                    if (!ruleCondFlag&&count>0) {
                        break;
                    }
                }
                if (rowBtnForwardId_0==null||rowBtnForwardId_0=="") {
                    for (var btnkey in btnList) {
                        var btndata = btnList[btnkey];
                        if (btndata.type == '4') {    //判断当前操作是否属于详情按钮
                            var iflag = false;
                            for (var k in operationConditions) {
                                var affectOperationId = operationConditionsChosen.affectOperationId;
                                if(affectOperationId==btndata.id){
                                    iflag = true;
                                    break;
                                }
                            }
                            if(!iflag){
                                rowBtnForwardId_0 = btndata.forwardVid;
                                break;
                            }
                        }
                    }
                }
                if (rowBtnForwardId_0 !=null || rowBtnForwardId_0 != "") {
                    var viewDetail = $FRAME.$model(function () {
                        var $moduleListServer = this.server({
                            serverType:'api',
                            method:'POST',
                            url:'viewSearchDetail'
                        }).receive(function (viewDt) {
                            if (viewDt.state == 0) {
                                console.log("数据异常！");
                            } else {
                                var view = viewDt.data;
                                if (view.viewType == 5) {               //自定义
                                    if (view.viewUrl.indexOf('?') > 0) {
                                        $FRAME.redirect(view.viewUrl + "&recordId=" + recordId);
                                    } else {
                                        $FRAME.redirect(view.viewUrl + "?meViewId=" + rowBtnForwardId_0 + "&recordId=" + recordId);
                                    }
                                } else if (view.viewType == 4) {        //详情
                                    $FRAME.redirect('home/custom/detail?viewId=' + rowBtnForwardId_0 + "&recordId=" + recordId);
                                }
                            }
                        }.bind(this)).send({
                            "id":rowBtnForwardId_0
                        });
                    })
                }
            }
        } else {
            var rowBtnForwardId_0 = "", count = 0;
            for (var key in btnList) {
                var btndata = btnList[key];
                if (btndata.type == '4') {
                    rowBtnForwardId_0 = btndata.forwardVid;
                    break;
                }
            }
            gridConf.events.click = function (data, index,rowData) {
                event.stopPropagation();
                // console.log(data, index,rowData)
                if (rowBtnForwardId_0 == null || rowBtnForwardId_0 == undefined||rowBtnForwardId_0=="") {
                } else {
                    var recordId = rowData.ID;
                    // var cp = document.querySelectorAll(".grid-footer .footer-left .grid-paging-center").querySelector(".focus span").innerHTML;

                    var viewDetail = $FRAME.$model(function () {
                        var $moduleListServer = this.server({
                            serverType:'api',
                            method:'POST',
                            url:'viewSearchDetail'
                        }).receive(function (viewDt) {
                            if (viewDt.state == 0) {
                                console.log("数据异常！");
                            } else {
                                var view = viewDt.data;
                                if (view.viewType == 5) {               //自定义
                                    if (view.viewUrl.indexOf('?') > 0) {
                                        $FRAME.redirect(view.viewUrl + "&recordId=" + recordId);
                                    } else {
                                        $FRAME.redirect(view.viewUrl + "?meViewId=" + rowBtnForwardId_0 + "&moduleId=" + view.moduleId +"&recordId=" + recordId);
                                    }
                                } else if (view.viewType == 4) {        //详情
                                    $FRAME.redirect('home/custom/detail?viewId=' + rowBtnForwardId_0 + "&moduleId=" + view.moduleId +"&recordId=" + recordId);
                                }
                            }
                        }.bind(this)).send({
                            "id":rowBtnForwardId_0
                        });
                    })
                }


                //ME.page.redirect('custom:viewrender/detail?flag=1&meViewId=' + rowBtnForwardId_0 + '&recordId=' + data.ID + '&cp=' + cp);
            };
        }

        //顶部按钮
        btnConf = [{
            isGroup:true, //【必填项】isGroup如果是true的话，说明是按钮组，下面的spacing是两个按钮之间的间距
            spacing:'15px',//【非必填项】两个按钮之间的间距
            eventIdentifierName:'eventIdentifier',//【若是多个按钮组，则为必填项】事件标识名称，如果不填写，默认是btnGroupMeEvent
            style: {   //【非必填项】设置最外层div的css样式，如果要写类似于margin-top的样式，需要这样写 'margin-top':'100px'
                // padding:'50px',
                // 'margin-bottom':'30px'
            },
            list:topBtn
        }]

        return {
            gridConf : gridConf,
            viewName:view.viewName,
            btnConf : btnConf
        }

    }

    return exportFunc;


});