/**
 * Created by xiyuan on 17-1-4.
 */
extend(function () {

    //验证错误处理
    function errorHandle() {
        this.parentNode.parentNode.classList.add('err');
    }

    //验证成功处理
    function successHandle() {
        this.parentNode.parentNode.classList.remove('err');
    }

    function generateCode(code) {
        var dt = new Date();
        var year = dt.getFullYear();
        var mon = dt.getMonth() + 1;
        if ((dt.getMonth() + 1) < 10)
            mon = "0" + mon;
        var mon = dt.getMonth() + 1;
        var day = dt.getDay();
        if (dt.getDay() < 10)
            day = "0" + day;
        var hour = dt.getHours();
        var dtimp = dt.getTime();
        var ss = dt.getSeconds();  //秒
        var mo = dt.getMinutes()   //分钟
        var userCode = "";
        var comp = "";
        var precode = code;
        precode = precode.replace(/\$YY/g, year);
        precode = precode.replace(/\$MN/g, mon);
        precode = precode.replace(/\$DD/g, day);
        precode = precode.replace(/\$HH/g, hour);
        precode = precode.replace(/\$MO/g, mo);
        precode = precode.replace(/\$SS/g, ss);
        precode = precode.replace(/\$TIMP/g, dtimp);
        //        precode=precode.replace(/\$U/g,userCode);
        //        precode=precode.replace(/\$COMP/g,comp);
        return precode;
    }

    /**
     * 字段信息转换
     * @param fieldInfo 字段信息
     * @param commConf  公共配置
     * @param recordColumns 修改页面需要的回现数据
     * @param btnModule   【btndata.type == '8'新增关联模块按钮跳转的 moduleId】
     * @param addRes 新增关联模块数据
     * @returns {{title: *, required: boolean, config: {type: *, name: string, $config: *, valid: {}, readOnly: boolean, placeholder: string}}}
     */
    function fieldConvert(fieldInfo, commConf, res, btnModule,relColumnList) {

        var recordColumns = res.recordColumns,
            meFormulaList = res.formulaList,
            relatedColumn = res.moduleRelateds,
            cols = res.columnList,
            colCode = fieldInfo.columnCode;

        var fieldId=String(fieldInfo.id),

            //字段是否只读
            isReadOnly = false,
            isRequired=commConf.requiredIds.in(fieldId) !== -1,
            //元素类型
            eleType,
            //组件配置
            $config,
            $value,
            $model,
            //字段约束信息
            constraintInfo,
            //字段校验
            validResult={},
            //占位符动作语言
            actionText='请输入',
            //公式默认值
            formulaDefaultValue,
            //视图公式
            formulaInfo,
            //表单元素name(检查字段是否当前模块)
            fieldName = (commConf.moduleId == fieldInfo.moduleId ? 'obj.' : fieldInfo.moduleCode + '_') + fieldInfo.phyColumnName;

            //字段key
        var  fieldKey=fieldInfo.moduleCode + '_' + fieldInfo.phyColumnName;
            //字段值
        var  fieldVal = recordColumns?recordColumns[fieldKey]||'':'';


        //检查字段是否只读
        // fieldInfo.readonlyScope && (isReadOnly = true);

        //字段元素类型检查
        switch (fieldInfo.showType) {
            //单选框[字典]
            case '2':
                eleType = 'radios';
            //复选框[字典]
            case '3':
                eleType = eleType||'checkboxs';
                actionText='请选择';
                $config=$FRAME.model();

                $FRAME.model('HOME@custom/commApi:queryMaps').readData(function (data) {
                    $config.write({dataList:data,name:fieldName});
                }).method('getData',fieldInfo.showColVal);
                break;
            //下拉框 [字典]
            case '4':
                eleType = 'select';
                actionText='请选择';
                $config=$FRAME.model();

                $FRAME.model('HOME@custom/commApi:queryMaps').readData(function (data) {
                    $config.write({dataList:data,value:fieldVal})

                }).method('getData',fieldInfo.showColVal);
                break;
            //多行文本框
            case '5':
                eleType = 'textarea';
                actionText='请填写';
                break;
            //日期控件
            case '6':
                eleType = 'date';

                if(fieldVal){
                    fieldVal=$FRAME.lib.$date.convert(fieldVal,'yy-mm-dd')
                }
                actionText='请选择';
                break;
            //文本/外键
            case '1':
                eleType = 'text';
                actionText='请输入';
                var modelInfo=null;
                //检查是否是外键
                if (fieldInfo.colMark !== "foreignkey" || !(modelInfo=commConf.modelInfo[fieldInfo.columnCode] )){

                    if (fieldInfo.defaultVal != null && fieldInfo.defaultVal != "") {
                        fieldVal = generateCode(fieldInfo.defaultVal);
                    }

                    if (fieldInfo.relyModuleId == btnModule && fieldInfo.relyColumnId != null) {              //处理数据选择
                        for (var key in relColumnList) {
                            var curCol = relColumnList[key];
                            if (curCol.id == fieldInfo.relyColumnId) {
                                fieldVal = recordColumns[curCol.moduleCode + "_" + curCol.phyColumnName];
                            }
                        }

                    }

                    break;
                }



                fieldInfo = {
                    id: fieldId,
                    isType:'key',
                    colMark:fieldInfo.colMark,
                    columnName: fieldInfo.columnName,
                    selectViewId: modelInfo.showViewId,
                    selectShowColId: modelInfo.showColumnId,
                    closeHandle: function () {

                    }
                };


            //数据列表选择
            case '7':
                actionText='请选择';
                switch (fieldInfo.showColValSet){
                    //部门选择
                    case '3':
                        eleType = 'tree';
                        var valueShow = '';

                        if(recordColumns && recordColumns[fieldKey+'_ONAME']){
                            valueShow =recordColumns[fieldKey+'_ONAME'];
                        }else if(fieldInfo.phyColumnName == 'ORG_CODE'){
                            valueShow = $FRAME.localStorage('userInfo.entName');
                            fieldVal = $FRAME.localStorage('userInfo.orgCode');
                        }
                        // if(fieldInfo.phyColumnName == 'ORG_CODE'){
                        //     valueShow = $FRAME.localStorage('userInfo.entName');
                        //     fieldVal = $FRAME.localStorage('userInfo.orgCode');
                        // }else{
                        //     valueShow =recordColumns?recordColumns[fieldKey+'_ONAME']:''
                        // }

                        if(valueShow){
                            isReadOnly = true
                        }

                        $config={
                            treeConf:$FRAME.model('HOME@custom/commApi:orgList'),
                            select:function (info,write) {
                                info=info||{orgName:'',orgCode:''};
                                write(info.orgName,info.orgCode);
                            },
                            showValue:valueShow
                        };

                        $config.treeConf.method('getData');

                        break;
                    //人员选择
                    case '4':
                        eleType = 'organisation';
                        var valueShow = '';
                        if(recordColumns && recordColumns[fieldKey + '_UNAME']){
                            valueShow =recordColumns[fieldKey + '_UNAME'];
                        }else if(fieldInfo.phyColumnName == 'OWNER_ID'){
                            valueShow = $FRAME.localStorage('userInfo.realName');
                            fieldVal = $FRAME.localStorage('userInfo.userId');
                        }
                        // if(fieldInfo.phyColumnName == 'OWNER_ID'){
                        //     valueShow = $FRAME.localStorage('userInfo.realName');
                        //     fieldVal = $FRAME.localStorage('userInfo.userId');
                        // }else{
                        //     valueShow = recordColumns?recordColumns[fieldKey+'_UNAME'] : ''
                        // }

                        if(valueShow){
                            isReadOnly = true
                        }

                        $config={
                            orgCode:0,
                            select:function (info,write,dialog) {
                                if(!info){
                                    $packages('{PLUGINS}/hint/hint-message',function ($message) {
                                        $message('请选'+fieldInfo.columnName+'！','warning');
                                    })
                                    return;
                                }
                                write(info.userInfo.realName,info.userInfo.id);
                                dialog.close();
                            },
                            showValue:valueShow
                        };
                        break;
                    default:
                        var  showValue = '';
                        //检查是否外键
                        if(fieldInfo.colMark === "foreignkey" && recordColumns){
                            showValue=recordColumns[fieldKey+'_RNAME'];
                            fieldVal = recordColumns['ID'];
                        }

                        if (fieldInfo.defaultVal != null && fieldInfo.defaultVal != "") {
                            showValue = generateCode(fieldInfo.defaultVal);
                        }

                        if (fieldInfo.relyModuleId == btnModule && fieldInfo.relyColumnId != null) {              //处理数据选择
                            for (var key in relColumnList) {
                                var curCol = relColumnList[key];
                                if (curCol.id == fieldInfo.relyColumnId) {
                                    showValue = recordColumns[curCol.moduleCode + "_" + curCol.phyColumnName];
                                    fieldVal = recordColumns['ID'];
                                }
                            }
                            console.log(showValue,'000000000000')
                        }

                        if(JSON.stringify(meFormulaList) != "{}"){
                            cols.forEach(function(col){
                                for (var key in meFormulaList) {
                                    var formula = meFormulaList[key];                //获取页面包含公式
                                    var sourceCols = formula.sourceColumnIds;
                                    var formulatype = formula.type;
                                    if (formulatype == 1 && formula.targetColumnId == col.id) {
                                        showValue = formula.defaultVal;
                                    }
                                }
                            })
                        }
                        

                        if (relatedColumn && relatedColumn[colCode] != null) {   //外键字段
                            var relatedModule = relatedColumn[colCode];
                            if (btnModule == relatedModule.relModuleId) {
                                showValue = recordColumns[relatedModule.relModuleCode + "_" + relatedModule.showColumnCode];
                                fieldVal = recordColumns['ID'];
                            }
                        }
                        /*fieldVal = showValue;*/
// console.log(showValue,'showValue')

                            isReadOnly = showValue?true:false;

                        eleType = 'grid';
                        $config={
                            showValue:showValue,
                            type: fieldInfo.isMoreData == 1 ? 'checkbox' : 'radio',
                            placeholder: actionText + fieldInfo.columnName,
                            gridConf:$FRAME.model('HOME@custom/commApi:gridStruct'),
                            select:function (info,write) {
                                if(fieldInfo.isMoreData){
                                    var showVal=[],
                                        val=[];

                                    info.forEach(function (v) {
                                        val.push(v.ID);
                                        showVal.push(v[fieldInfo.selectShowColKey])
                                    });
                                    write(showVal.join(','),val.join(','));
                                }else{
                                    write(info[fieldInfo.selectShowColKey],info.ID);
                                }
                            }
                        };
                        $config.gridConf.method('getData',fieldInfo);
                }
                break;
            //文件上传
            case '8':
            //文件上传
            case '9':
                eleType = 'file';
                actionText='请选择';
                break;
            //富文编辑
            case '10':
                eleType = 'editor';
                actionText='请填写';
                break;
        }

        //字段约束
        if(constraintInfo=commConf.constraintMaps[fieldInfo.colConstraint]){
            //自定义匹配
            validResult['regExp']={
                value: constraintInfo.regularExpression,
                message: '请输入' + constraintInfo.constraintName + '格式',
                errorHandle: errorHandle,
                successHandle: successHandle
            };
        }

        //检查字段唯一性
        if(fieldInfo.isUnique){

            //唯一校验服务
            var uniqueModel=$FRAME.model('HOME@custom/commApi:unique');

            validResult['asyn'] = {
                value: function (value) {
                    return {
                        handle:function (callbck) {
                            uniqueModel.method('valid',{
                                "moduleId": fieldInfo.moduleId,
                                "columnName": fieldInfo.phyColumnName,
                                "recordId": commConf.viewId,
                                "columnValue": value
                            },function (state) {
                                callbck(state);
                            })
                        }
                    }
                },
                message:'你输入的'+fieldInfo.columnName+'已存在!',
                errorHandle: errorHandle,
                successHandle: successHandle
            };
        }

        //校验必填
        if(isRequired){
            validResult['required']={
                value: true,
                message: '请输入' + fieldInfo.columnName,
                errorHandle: errorHandle,
                successHandle: successHandle
            }
        }

        //视图公式默认值
        commConf.globalScope['$COL_' + fieldId]=$FRAME.$model();
        if(formulaDefaultValue=commConf.formulaList[fieldId]){
            fieldVal=formulaDefaultValue.value;
            commConf.globalScope['$COL_' + fieldId].write(Number(fieldVal)||fieldVal);
        }

        //处理视图公式计算(进行数据绑定) and custom url 自定义配置
        if (formulaInfo = commConf.formulaList[fieldId]) {
            $value = formulaInfo.expression;
        }

        $model = '$COL_' + fieldId;

        var conditions =commConf.conditionsMaps[fieldId],
            fieldLayoutMaps=commConf.fieldLayoutMaps;



        var fieldRes={
            id:fieldId,
            title: fieldInfo.columnName,
            required: isRequired,
            config: {
                type: eleType,
                name: fieldName,
                $config:$config,
                value:fieldVal,
                valid:validResult,
                readOnly:isReadOnly,
                disable:true,
                placeholder: actionText + fieldInfo.columnName,
                events:{
                    change:function () {

                        var eleVal = this.value,
                            sourceVal,
                            isPass,
                            formulaInfo=commConf.formulaCustom[fieldId];


                        //视图公式自定义配置
                        if(formulaInfo){
                            var requestData={};
                            formulaInfo.formula.forEach(function (info) {
                                //遍历获取字段值
                                info.sourceColumnIds.forEach(function (id) {
                                    var conf=commConf.fieldLayoutMaps[id].config;
                                    requestData[conf.name]=commConf.globalScope[conf.$model].get();
                                });
                                //数据请求
                                commConf.formulaList[info.targetId] && commConf.formulaList[info.targetId].customFn(requestData,function (res) {
                                    //结果写入
                                    commConf.globalScope[commConf.fieldLayoutMaps[info.targetId].config.$model].write(res)
                                })
                            })
                        }

                        //视图条件
                        conditions && conditions.forEach(function (condition) {
                            //匹配是否通过标识初始化
                            isPass = false;
                            //条件值
                            sourceVal = condition.conditionValue;

                            //条件规则
                            switch (Number(condition.conditionType)) {
                                //大于
                                case 1:
                                    eleVal > sourceVal && (isPass = true);
                                    break;
                                //小于
                                case 2:
                                    eleVal < sourceVal && (isPass = true);
                                    break;
                                //等于
                                case 3:
                                    eleVal == sourceVal && (isPass = true);
                                    break;
                                //大于等于
                                case 4:
                                    eleVal >= sourceVal && (isPass = true);
                                    break;
                                //小于等于
                                case 5:
                                    eleVal <= sourceVal && (isPass = true);
                                    break;
                                //包含
                                case 6:
                                    String(eleVal).indexOf(sourceVal) !== -1 && (isPass = true);
                                    break;
                                //不等于
                                case 7:
                                    eleVal != sourceVal && (isPass = true);
                                    break;
                                //自定义(外键关联的联动清除)
                                case 1001:
                                    isPass = true;
                                    break;

                            }

                            if (isPass) {
                                //遍历受影响的字段
                                condition.affectColumns.forEach(function (fielId) {
                                    switch (condition.ruleType) {
                                        case 'show':
                                            //改变字段隐藏数据(双向绑定的数据)
                                            fieldLayoutMaps[fielId].hidden = false;
                                            //显示则开启数据校验
                                            fieldLayoutMaps[fielId].validSwitch = true;
                                            break;
                                        case 'hidden':
                                            fieldLayoutMaps[fielId].hidden = true;
                                            //隐藏则关闭校验
                                            fieldLayoutMaps[fielId].validSwitch = false;
                                            break;
                                        case 'readonly':
                                            fieldLayoutMaps[fielId].config.readOnly=true;
                                            break;
                                        //自定义(外键关联的联动清除)
                                        case 'clean':
                                            // formLayout.$scope['$COL_'+fielId]='';
                                    }
                                })
                            }

                        });
                    }
                }
            }
        };
        // console.log(fieldVal,fieldRes,'>>>>>>.')
        //检查是否隐藏字段
        if(commConf.showIds !== true && commConf.showIds.indexOf(fieldId) == -1) fieldRes.hidden=true;

        //主要用于公式动态计算
        $value && (fieldRes.config.$value=$value);
        $model && (fieldRes.config.$model=$model);
        return fieldRes;
    }

    //子表批量新增信息提取
    function batchAddInfo(commConf,resultFormLayout) {
        //table选择事件
        var selectEvent = function (event, index) {

            },
            forms=[],
            masterForms=[],
            batchStorage = [/*{
                name: '基本信息',
                focus: true,
                select: selectEvent,
                init: function () {

                },
                contentId: 'base'
            }*/];

        
        //遍历表单

        if(resultFormLayout[0].isGroup){
            resultFormLayout.forEach(function (formLayout,key) {
                masterForms[key]={
                    form:$FRAME.model()
                };

                batchStorage.push({
                    name: formLayout.name,
                    scope:{
                        masterForm:masterForms[key].form,
                        formLayout:{
                            list: formLayout.list,
                            scope:commConf.globalScope
                        }
                    },
                    template:'<h3 class="tab-title">'+formLayout.name+'</h3><form $-form="masterForm"><form-layout config="formLayout"></form-layout></form>'
                })
            })
        }

        //遍历子表
        commConf.batchAddViewIds.forEach(function (batchViewId,key) {

            //tab配置容器
            var resModel = $FRAME.model(),
                //子表数据
                batchModel = $FRAME.model('HOME@custom/add:viewStructConf');
            forms[key]={
                form:$FRAME.model(),
                id:batchViewId
            };
            //子表数据结构获取
            batchModel.method('getConf', batchViewId);

            //监听子表数据
            batchModel.readData(function (batchInfo) {
                //写入tab配置
                resModel.write({
                    name: batchInfo.viewName,
                    focus: true,
                    select: selectEvent,
                    scope:{
                        batchForm:forms[key].form,
                        formLayout:batchInfo.formLayout
                    },
                    template:'<h3 class="tab-title">'+batchInfo.viewName+'</h3><form $-form="batchForm"><form-batch config="formLayout"></form-batch></form>'
                })
            });
            batchStorage.push(resModel);
        });
        return {
            forms:forms,
            config:{
                offsetTop:70,
                list:batchStorage
            },
            masterForms:masterForms
        };
    }

    //对外提供的接口
    return function exports(res, addRes, btnModule) {

        //表单视图信息
        var viewInfo = res.view,
            //字段信息
            fieldMaps = {},
            //约束map
            constraintMaps={},
            //显示的字段
            showIds =viewInfo.showColumns === 'ALL'?true: (viewInfo.showColumns||'') .split(','),
            //公共数据
            commConf = {
                //视图ID
                viewId:viewInfo.id,
                //字段显示集合
                showIds: showIds,
                //关联模块信息
                modelInfo:res.moduleRelateds||{},
                //必填字段
                requiredIds:(viewInfo.requiredCols || '').split(','),
                //关联的视图
                batchAddViewIds: viewInfo.batchAddViewIds?viewInfo.batchAddViewIds.split(','):[],
                //当前模块ID
                moduleId: viewInfo.moduleId,
                //约束条件
                constraintMaps:constraintMaps,
                //视图条件
                conditionsMaps:{},
                //外键条件
                keyConditionsMaps:{},
                //字段布局信息
                fieldLayoutMaps:{},
                //视图公式
                formulaList:{},
                //视图公式来源字段
                formulaSourceIds:[],
                //globalScope
                globalScope:{},
                //自定义公式
                formulaCustom:{}
            },
            //数据转换容器
            resultFormLayout = [],
            resultActionList = [],
            //页面操作按钮
            pageBtn=[];


        //视图公式处理
        (res.formulaList||[]).forEach(function (formulaInfo) {

            formulaInfo.sourceColumnIds && (commConf.formulaSourceIds = commConf.formulaSourceIds.concat(formulaInfo.sourceColumnIds.split(',')));
            switch (formulaInfo.type){
                //字段值取自定义Url
                case 0:
                    formulaInfo.sourceColumnIds.split(',').forEach(function (id) {
                        (commConf.formulaCustom[id]=commConf.formulaCustom[id]||{formula:[]}).formula.push({
                            sourceColumnIds:formulaInfo.sourceColumnIds.split(','),
                            targetId:formulaInfo.targetColumnId
                        })
                    });

                    commConf.formulaList[formulaInfo.targetColumnId] = {
                        customFn: function (requestData,callback) {
                            $FRAME.server({
                                serverType:'api',
                                url:formulaInfo.customUrl
                            }).success(function (res) {
                                callback(res)
                            }).fail(function () {
                                callback('')
                            }).send(requestData)
                        }
                    };
                    break;
                //默认值
                case 1:
                    commConf.formulaList[formulaInfo.targetColumnId] = {
                        value: formulaInfo.defaultVal
                    };
                    break;
                //计算公式
                case 2:
                    commConf.formulaList[formulaInfo.targetColumnId] = {
                        expression: formulaInfo.content
                    };
                    break;
            }
        }.bind(this));

        //视图条件处理
        (res.viewRuleList||[]).forEach(function (condition) {
            //遍历条件规则
            (condition.viewRuleConditions || []).forEach(function (ruleCondition) {
                var sourceColumnId=ruleCondition.sourceColumnId,
                    affectColumns=condition.affectColumns;

                //常规视图条件(隐藏/显示)
                if(sourceColumnId){

                    (commConf.conditionsMaps[sourceColumnId] = commConf.conditionsMaps[sourceColumnId] || []).push({
                        //条件类型
                        conditionType: ruleCondition.conditionType,
                        //条件值
                        conditionValue: ruleCondition.conditionValue,
                        //影响的字段
                        affectColumns: (condition.affectColumns||'').split(','),
                        //规则类型
                        ruleType: condition.ruleType
                    });
                    //外键条件
                }else{
                    //判断是否联动
                    if(condition.isLinkage){
                        var conditionId=ruleCondition.conditionValue;
                        (commConf.conditionsMaps[conditionId] = commConf.conditionsMaps[conditionId] || []).push({
                            //条件类型(自己定义的)
                            conditionType: '1001',
                            //影响的字段
                            affectColumns: affectColumns.split(','),
                            //规则类型(自定义清除值)
                            ruleType: 'clean'
                        });
                    }

                    //记录外键条件
                    commConf.keyConditionsMaps[affectColumns]={
                        conditionType: ruleCondition.conditionType,
                        conditionValue: ruleCondition.conditionValue,
                        customVal: ruleCondition.customVal
                    };
                }
            });

        });

        //约束maps
        (res.constraintList||[]).forEach(function (constraintInfo) {
            constraintMaps[constraintInfo.id]=constraintInfo;
        });

        //检查是否是否有字段分组
        if(viewInfo.viewGroupList && viewInfo.viewGroupList.length){
            viewInfo.viewGroupList.forEach(function (groupList) {
                var groupField=[];
                groupList.colList.forEach(function (fieldInfo) {
                    groupField.push(commConf.fieldLayoutMaps[fieldInfo.id]=fieldConvert(fieldInfo, commConf,res,btnModule,addRes.columnList))
                })

                if(groupField.length) resultFormLayout.push({
                    isGroup:true,
                    name:groupList.name,
                    list:groupField
                });
            })
        }else{
            //字段信息提取成map
            (res.columnList||[]).forEach(function (fieldInfo) {
                //字段信息收集
                fieldMaps[fieldInfo.id] = fieldInfo;
                //字段数据转换
                resultFormLayout.push(commConf.fieldLayoutMaps[fieldInfo.id]=fieldConvert(fieldInfo, commConf,res,btnModule,addRes.columnList));
            });


        }

        var tabConf = batchAddInfo(commConf,resultFormLayout)||{};


        return {
            viewInfo:viewInfo,
            formLayout: {
                list: resultFormLayout,
                scope:commConf.globalScope
            },
            masterForms:tabConf.masterForms,
            viewName: viewInfo.viewName,
            actionList: resultActionList,
            batchForms:tabConf.forms,
            tabConf: tabConf.config,
            pageBtn:pageBtn,
            fieldConvert:function (fieldInfo) {
                return fieldConvert(fieldInfo, commConf,res.recordColumns);
            }
        }

    }

});