/**
 * Created by lei on 17-2-9.
 */

extend('detailConf',['$:@custom/treat/gridBtnOperation:gridBtnOperation'],function (gridBtnOperation){

    var DetailId = {
         ID:$_GET['recordId']
    }
    //详情关联的列表信息提取
    function batchAddInfo(commConf,gridApi) {
        //table选择事件
        var selectEvent = function (event, index) {

            },
            batchStorage = [{
                name: '基本信息',
                focus: true,
                select: selectEvent,
                init: function () {

                },
                contentId: 'base'
            }];
        //遍历子表
        commConf.batchAddViewIds.forEach(function (batchViewId) {

            //tab配置容器
            var resModel = $FRAME.model();
            var gridApi = $FRAME.model();


            //关联列表数据
            relationModel = $FRAME.model('HOME@custom/detail:gridConf');

            //关联数据结构获取
            relationModel.method('getConf',batchViewId,gridApi)

            //监听子表数据
            relationModel.readData(function (batchInfo) {
                //写入tab配置
                resModel.write({
                    name: batchInfo.viewName,
                    focus: true,
                    select: selectEvent,
                    scope:{
                        gridApi:gridApi,
                        gridConf:batchInfo.gridConf,
                        btnConf:batchInfo.btnConf
                    },
                    template:'<h3 class="tab-title">'+batchInfo.viewName+'</h3><div class="btnlist"><btn-group-me data="btnConf"></btn-group-me></div><list-grid config="gridConf" api="gridApi"></list-grid>'
                })
            });
            batchStorage.push(resModel);
        });
        return {
            offsetTop:70,
            list:batchStorage
        };
    }
    
	function detailPage(res,viewId,gridApi){
        
        var cols, operations, record, moduleRelatedMap, view, viewRuleList;

            cols = res.showColumnList;                 //显示字段列表
            operations = res.operationList;           //操作列表
            record = res.record;                      //真实数据
            view = res.view;                          //视图信息
            moduleRelatedMap = res.moduleRelatedMap;   //外键关系
            viewRuleList  =  res.viewRuleList         //视图条件列表
        
        //公共数据
        commConf = {
            batchAddViewIds:view.viewMarks?view.viewMarks.split(','):[]
        }

        //顶部按钮
		var btnList = [
                {
                    class:'btn btn-teal', //【必填项】按钮样式
                    icon:'iconfont icon-fanhui',
                    label:'返回',//【必填项】按钮文字
                    align:'right',//【必填项】文字居中
                    padding:'5px 24px', //【必填项】按钮内边距，可以控制按钮大小
                    events:{
                        click:function (event) { //【必填项】按钮事件
                            $FRAME.goBack();
                        }
                    }
                }
            ];
            if(operations){
                
                operations.forEach(function (data){
                    // console.log(data)
                    var list ={
                            class:'btn btn-teal-outline', //【必填项】按钮样式
                            label:data.operationName,//【必填项】按钮文字
                            align:'center',//【必填项】文字居中
                            padding:'4px 14px', //【必填项】按钮内边距，可以控制按钮大小
                            events:gridBtnOperation(DetailId,data,view,gridApi)
                        }
                        btnList.push(list)
                })
            }
        // console.log(btnList,'btnList')
		var btnConf = [{
                isGroup:true, //【必填项】isGroup如果是true的话，说明是按钮组，下面的spacing是两个按钮之间的间距
                spacing:'20px',//【非必填项】两个按钮之间的间距
                eventIdentifierName:'eventIdentifier',//【若是多个按钮组，则为必填项】事件标识名称，如果不填写，默认是btnGroupMeEvent
                style: {   //【非必填项】设置最外层div的css样式，如果要写类似于margin-top的样式，需要这样写 'margin-top':'100px'
                    
                },
                list:btnList
            }]

            //视图详情部分
            /**************初始化视图条件:start*******************/
                //序列化字段值  field => value
            var fieldMap = {},
                hiddenField = [];

            cols.forEach(function (fieldInfo) {
                var fieldKey;
                // 3、 部门选择 4、人员选择 5、角色选择
                switch (fieldInfo.showColValSet) {
                    case '3':
                        fieldKey = fieldInfo.moduleCode + "_" + fieldInfo.phyColumnName + "_DNAME";
                        break;
                    case '4':
                        fieldKey = fieldInfo.moduleCode + "_" + fieldInfo.phyColumnName + "_UNAME";
                        break;
                    case '5':
                        fieldKey = fieldInfo.moduleCode + "_" + fieldInfo.phyColumnName + "_RNAME";
                        break;
                    default:
                        fieldKey = fieldInfo.moduleCode + "_" + fieldInfo.phyColumnName;
                }
                if(record!=null){
                    fieldMap[fieldInfo.id] = record[fieldKey];
                }

            });

            if(viewRuleList == null){
                viewRuleList = []
            }
              //获取初始化时候视图条件字段
            viewRuleList.forEach(function (conditionData) {
                switch (conditionData.ruleType) {
                    //隐藏字段
                    case 'hidden':
                        //检查是否符合规则
                        ruleConditionsHandle(conditionData.viewRuleConditions) && hiddenField.push(conditionData.affectColumns);
                        break;
                }
            });

            //视图条件规则处理
            function ruleConditionsHandle(ruleConditions) {
                var i = ~0,
                    len = ruleConditions.length,
                    ruleCondition,
                    conditionValue,
                    sourceColumnValue;

                while (++i < len) {
                    ruleCondition = ruleConditions[i];
                    conditionValue = ruleCondition.conditionValue;
                    sourceColumnValue = fieldMap[ruleCondition.sourceColumnId];

                    switch (Number(ruleCondition.conditionType)) {
                        //检查目标数据是否大于条件值
                        case 1:
                            if (!(sourceColumnValue > conditionValue)) {
                                return false;
                            }
                            break;
                        //检查目标数据是否小于条件值
                        case 2:
                            if (!(sourceColumnValue < conditionValue)) {
                                return false;
                            }
                            break;
                        //检查目标数据是否等于条件值
                        case 3:
                            if (!(sourceColumnValue == conditionValue)) {
                                return false;
                            }
                            break;

                        //检查目标数据是否大于等于条件值
                        case 4:
                            if (!(sourceColumnValue >= conditionValue)) {
                                return false;
                            }
                            break;
                        //检查目标数据是否小于等于条件值
                        case 5:
                            if (!(sourceColumnValue <= conditionValue)) {
                                return false;
                            }
                            break;
                        case 6:
                            //检查目标数据是否包含条件值
                            if (!(sourceColumnValue.indexOf(String(conditionValue)) >= 0)) {
                                return false;
                            }
                            break;
                        case 7:
                            //检查目标数据是否不等于条件值
                            if (!(sourceColumnValue != conditionValue)) {
                                return false;
                            }
                            break;

                    }
                }
                return true;
            }

            /**************初始化视图条件:end*******************/

            var showColsList = new Array();
            var isOwnRelated = moduleRelatedMap;
            var index = 0;

            for(var key in cols){
                var is_merge = false;
                var col = cols[key];
                var colVal = "";
                var colCode = col.columnCode;
                if (col.showType == 5) {
                    is_merge = true;
                } else if (col.showType == 10) {
                    is_merge = true;
                }

                if(record != null && record.ID != null){
                    //通过字段对应的值
                    if(isOwnRelated && moduleRelatedMap[colCode] != null){
                        var relatedModule = moduleRelatedMap[colCode];
                        colVal = record[relatedModule.relModuleCode +'_' +relatedModule.showColumnCode + "_RNAME"];
                    } else{

                        if (record[col.moduleCode + '_'+ col.phyColumnName + "_DNAME"] != null ) {
                            colVal = record[col.moduleCode + '_'+ col.phyColumnName + "_DNAME"];

                        } else if (record[col.moduleCode + '_'+ col.phyColumnName + "_RNAME"] != null) {
                            colVal = record[col.moduleCode + '_'+ col.phyColumnName + "_RNAME"];
                            console.log('啦啦啦啦啦',colVal)
                        } else if (record[col.moduleCode + '_'+col.phyColumnName + "_ONAME"] != null) {
                            colVal = record[col.moduleCode + '_'+ col.phyColumnName + "_ONAME"];
                        } else if (record[col.moduleCode + '_'+col.phyColumnName + "_UNAME"] != null) {
                            colVal = record[col.moduleCode + '_'+ col.phyColumnName + "_UNAME"];
                        } else if (record[col.moduleCode + '_'+col.phyColumnName + "_FNAME"] != null) {
                            colVal = record[col.moduleCode + '_'+col.phyColumnName + "_FNAME"];
                        } else if (record[col.moduleCode + '_'+ col.phyColumnName + "_IMGNAME"] != null) {
                            colVal = record[col.moduleCode + '_'+ col.phyColumnName + "_IMGNAME"];
                        } else if (record[col.moduleCode + '_'+ col.phyColumnName + "_SDNAME"] != null) {
                            colVal = record[col.moduleCode + '_'+ col.phyColumnName + "_SDNAME"];
                        } else {
                            colVal = record[col.moduleCode + "_" + col.phyColumnName];
                        }

                        // if(col.phyColumnName == 'ORG_CODE'){
                        //     colVal = $FRAME.localStorage('userInfo.entName');
                        // }
                        //
                        // if(col.phyColumnName == 'OWNER_ID'){
                        //     colVal = $FRAME.localStorage('userInfo.realName');
                        // }
                        if(colVal == 'null'){
                            colVal = ''
                        }

                    }
           // console.log(colVal)
                    //根据规则对相应的值进行处理
                    if(colVal != undefined && colVal != null && colVal != ''){
                        var newDate = new Date();
                            newDate.setTime(colVal);
                        if (col.columnType == "datetime"||col.columnType == "date") {
                            if (col.dateType == "date") {
                               colVal = newDate.format('yyyy-MM-dd');
                            } else if (col.dateType == "time") {
                                colVal = newDate.format('yyyy-MM-dd h:m:s');
                            } else {
                               colVal = newDate.format('yyyy-MM-dd');
                            }
                        }
                        if (col.colMark == "money") {
                                if (colVal != null && colVal != undefined && colVal != "") {
                                    colVal = parseFloat(colVal).toLocaleString();
                                }
                        }
                    }else {
                        colVal = "";
                    }
                    
                }

                var colName = col.columnName;
                var currCols =[{
                        title:colName,
                        template:'<strong style="font-size: 14px;color: #2F3748;">{{aaa}}</strong>',
                        scope:{
                            aaa:colVal
                        },
                        filter:{

                        }
                    }];


                 /*给数组原型对象添加in方法*/
                function arrayIn(array, v) {
                    var i = 0, len = array.length;
                    while (len > i) {
                        if (array[i] == v) {
                            return i;
                        }
                        i++;
                    }
                    return -1;
                };

                //字段检查(判断是否在隐藏字段内)
                arrayIn(hiddenField, col.id) > -1 && (currCols.hidden = true);

                showColsList[key] = currCols;
            }

            var list ={
                configList:[]
            }

            for(var j = 0 ; j < showColsList.length;){
                // list.push(showColsList[j].concat(showColsList[j+1]))
                var b = showColsList[j].concat(showColsList[j+1]);
                list.configList.push(b);
                j = j+2
            }
            
    	return {
    		btnConf:btnConf,
            viewName:view.viewName,
            configList:list,
            tabConf:batchAddInfo(commConf,gridApi)
      	}
    }

    return detailPage;
})