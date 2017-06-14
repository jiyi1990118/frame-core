/**
 *
 */

//菜单选择模块、视图级联
extend(function () {
    // 参数:
    //       1、callback    回调函数

    return function (model,callback) {
        var varcharArr = [],   //字符串类型集合
            numberArr = [],    //数字类型集合
            datetimeArr =[];    //时间类型集合
        var This=model,
            moduleId=$_GET['moduleId'];
        var moduleListModel = $FRAME.$model(function () {
            
            //高级检索第一个选框
        var moduleList ={
                name:'queryField',
                style:{
                    width:'160px'
                },
                events:{
                    change: function(data){
                        var tag=this.value.split(','), //模块id
                            moduleName = tag[4];

                        var varcharArr_0 = [
                            {
                                content:'包含',
                                value:'6',
                                selected:true
                            },{
                                content:'等于',
                                value:'3'
                            },{
                                content:'不等于',
                                value:'7'
                            }
                        ];

                        var numberArr_0 = [
                            {
                                content:'大于',
                                value:'1',
                                selected:true
                            },{
                                content:'小于',
                                value:'2'
                            },{
                                content:'等于',
                                value:'3'
                            },{
                                content:'大于等于',
                                value:'4'
                            },{
                                content:'小于等于',
                                value:'5'
                            },{
                                content:'不等于',
                                value:'7'
                            }
                        ];

                        var datetimeArr_0 =[
                            {
                                content:'时间间隔',
                                value:'8',
                                selected:true
                            },{
                                content:'自定义',
                                value:'9'
                            }
                        ];

                        var input_2Arr = [
                            {
                                content: '今天',
                                value: '1',
                                selected:true
                            },
                            {
                                content: '昨天',
                                value: '2'
                            },
                            {
                                content: '明天',
                                value: '3'
                            },
                            {
                                content: '本周',
                                value: '4'
                            },
                            {
                                content: '上周',
                                value: '5'
                            },
                            {
                                content: '本月',
                                value: '6'
                            },
                            {
                                content: '上月',
                                value: '7'
                            }
                        ];

                        //判断所选字段的类型，字符串/数字/时间
                         if( varcharArr.indexOf(moduleName) >= 0){
                             var arr = This.$model.list[0].config.scope.advancedQuery.list[0].config.scope.batchCondition;
                             arr.list[1].config.scope.queryCondition.dataList= varcharArr_0;
                             arr.list[2].config = '';
                             arr.list[2].config ={
                                                    template:'<input name="contentText"  type="text" style="height:30px;line-height:30px;" class="contentText"/>',
                                                    scope:{
                                                    }
                                                }
                        } else if (numberArr.indexOf(moduleName) >= 0){ 
                             var arr = This.$model.list[0].config.scope.advancedQuery.list[0].config.scope.batchCondition;
                             arr.list[1].config.scope.queryCondition.dataList= numberArr_0;
                             arr.list[2].config = '';
                             arr.list[2].config ={
                                                    template:'<input name="contentText"  type="text" style="height:30px;line-height:30px;" class="contentText"/>',
                                                    scope:{
                                                    }
                                                }
                        } else if (datetimeArr.indexOf(moduleName) >= 0){
                             var arr = This.$model.list[0].config.scope.advancedQuery.list[0].config.scope.batchCondition,
                                 //选择'时间间隔'或'自定义'
                             inputValue = document.querySelectorAll('.contentField')[1].querySelector('.select-input span').innerHTML;

                             arr.list[1].config.scope.queryCondition.dataList = datetimeArr_0;
                             arr.list[1].config.scope.queryCondition = {
                                 name:'queryCondition',
                                 style:{
                                     width:'160px',
                                     //border:'none'
                                 },
                                 events:{
                                     change:function(){
                                         if(this.value === '9'){
                                             arr.list[2].config = {
                                                 template:'<input type="date" name="startTime" style="width:150px;float: left;"><input type="date" name="endTime" style="width:150px;float: left;margin-left: 5px;">',

                                             }
                                         } else{
                                             arr.list[2].config = {
                                                 template:'<select  config="queryText"></select> ',
                                                 scope:{
                                                     queryText:{
                                                         name:'queryText',
                                                         style:{
                                                             width:'160px'
                                                         },
                                                         dataList:input_2Arr
                                                     }
                                                 }
                                             }
                                         }
                                     }
                                 },
                                 dataList:datetimeArr_0
                             }

                        } else{
                             var arr = This.$model.list[0].config.scope.advancedQuery.list[0].config.scope.batchCondition;
                            inputDataList = [{
                                                content:'--请选择--',
                                                value:'-1',
                                                selected:true
                                              }]
                            arr.list[2].config = '';
                            arr.list[2].config ={
                                                    template:'<input name="contentText"  type="text" style="height:30px;line-height:30px;" class="contentText"/>',
                                                    scope:{
                                                    }
                                                }
                        }

                        if(tag[1] == '6'){     //日期控件
                            console.log(tag,'这是日期组件biubiu~~')
                            arr.list[2].config = '';
                            arr.list[2].config = {
                                template:'<select  config="queryText"></select> ',
                                scope:{
                                    queryText:{
                                        name:'queryText',
                                        style:{
                                            width:'160px'
                                        },
                                        dataList:input_2Arr
                                    }
                                }
                            }

                        } else if (tag[1] == '4') {   //下拉框
                            arr.list[2].config = '';
                            if (tag[2] == '2') {      //2、选择相关字典

                                var dataArr = new Array();
                                //查询字典集合
                                var queryMapsTags = $FRAME.$model(function () {

                                    //选择模块
                                    var $queryTagsServer = this.server({
                                        serverType: 'api',
                                        method: 'POST',
                                        url: 'queryMaps'        ////查询字典集合,'base/B03008'
                                    }).receive(function (res) {
                                        // console.log(tag[3],res,'------------')
                                        var  data = res.data;

                                        data.forEach(function(col,key){
                                            var tt = {
                                                value: col.dictCode,
                                                content: col.dictName
                                            }
                                            dataArr[key] = tt;
                                        })

                                        arr.list[2].config = {
                                            template:'<select  config="queryText"></select> ',
                                            scope:{
                                                queryText:{
                                                    name:'queryText',
                                                    style:{
                                                        width:'160px'
                                                    },
                                                    dataList:dataArr
                                                }
                                            }
                                        }

                                    }.bind(this)).send({
                                        "isFindAll":1,
                                        "dictType":tag[3],
                                        "dictIdList":"",
                                        "ownParentFlag":false,
                                        "condition":""
                                    });


                                });
                            }else{
                                arr.list[2].config ={
                                    template:'<input name="contentText"  type="text" style="height:30px;line-height:30px;" class="contentText"/>',
                                    scope:{
                                    }
                                }
                            }

                        }else if (tag[1] == '7') {   //数据选择
                            // console.log('===========')
                            arr.list[2].config = '';
                            arr.list[2].config ={
                                template:'<form-layout config="threeChoose"></form-layout>',
                                scope:{
                                    threeChoose:{
                                        scope: {},
                                        filter: {},
                                        list:[{
                                            title: '',
                                            required: true,
                                            config: {
                                                type: 'organisation',
                                                name:'superiorLeader',
                                                $config:{
                                                    orgCode:0,
                                                    select:function (info,write,dialog) {
                                                        write(info.userInfo.realName,info.userInfo.superiorLeader);
                                                        dialog.close();
                                                    }
                                                },
                                            },
                                            hidden:false
                                        }]
                                    }
                                }
                            };
                        } else {
                            arr.list[2].config ={
                                template:'<input name="contentText"  type="text" style="height:30px;line-height:30px;" class="contentText"/>',
                                scope:{
                                }
                            };

                            if (tag[2] == '3') {   //部门选择
                                //组织架构树
                                var orgListModel = $FRAME.model('HOME@custom/commApi:orgList');
                                orgListModel.method('getData','0');
                                arr.list[2].config ={
                                    template:'<form-layout config="threeChoose"></form-layout>',
                                    scope:{
                                        threeChoose:{
                                            scope: {},
                                            filter: {},
                                            list:[{
                                                title: '',
                                                required: true,
                                                config: {
                                                    type: 'tree',
                                                    name:'orgCode',
                                                    $config:{
                                                        treeConf:orgListModel,
                                                        select:function (info,write) {
                                                            document.querySelector("#addOrgId").value=info.id;
                                                            info=info||{orgName:'',orgCode:''};
                                                            write(info.orgName,info.orgCode);
                                                        }
                                                    }
                                                },
                                                hidden:false
                                            }]
                                        }
                                    }
                                };
                            } else if (tag[2] == '4') {    //人员选择
                                arr.list[2].config = '';
                                arr.list[2].config ={
                                    template:'<form-layout config="threeChoose"></form-layout>',
                                    scope:{
                                        threeChoose:{
                                            scope: {},
                                            filter: {},
                                            list:[{
                                                title: '',
                                                required: true,
                                                config: {
                                                    type: 'organisation',
                                                    name:'superiorLeader',
                                                    $config:{
                                                        orgCode:0,
                                                        select:function (info,write,dialog) {
                                                            write(info.userInfo.realName,info.userInfo.superiorLeader);
                                                            dialog.close();
                                                        }
                                                    },
                                                },
                                                hidden:false
                                            }]
                                        }
                                    }
                                };
                            } else if (moduleName.substring(moduleName.indexOf(".")) == ".C_USER_CODE" || moduleName.substring(moduleName.indexOf(".")) == ".U_USER_CODE") {
                                arr.list[2].config = '';
                                arr.list[2].config ={
                                    template:'<form-layout config="threeChoose"></form-layout>',
                                    scope:{
                                        threeChoose:{
                                            scope: {},
                                            filter: {},
                                            list:[{
                                                title: '',
                                                required: true,
                                                config: {
                                                    type: 'organisation',
                                                    name:'superiorLeader',
                                                    $config:{
                                                        orgCode:0,
                                                        select:function (info,write,dialog) {
                                                            write(info.userInfo.realName,info.userInfo.superiorLeader);
                                                            dialog.close();
                                                        }
                                                    },
                                                },
                                                hidden:false
                                            }]
                                        }
                                    }
                                };
                            }

                        }




                    }
                },
                dataList:[{
                    content:'--请选择--',
                    value:'-1',
                    selected:true

                }]
        };
    
    
            //选择模块
            var $moduleListServer = this.server({
                serverType:'api',
                method:'POST',
                url:'viewCanSearch'
            }).receive(function (res) {
    
                res.data[0].list.forEach(function (column) {
    
                    var columnName = column.moduleCode +'.'+ column.phyColumnName;

                    var tag = [];
                    tag[0] = column.columnType;
                    tag[1] = column.showType;	    //显示类型(1、文本框 2、单选框 3、复选框 4、下拉框 5、多行文本框 6、日期控件 7、数据选择 8、文件上传 9、图片上传 10、富文本 )
                    tag[2] = column.showColValSet;  //显示值设置 (1、手动输入 2、选择相关字典 3、 部门选择 4、人员选择 5、角色选择)
                    tag[3] = column.showColVal;     //字段显示值(手动输入值 或者字典编码)
                    tag[4] = columnName;            //通过value将选中的该字段的 字段名称
                    tag[5] = column.moduleId;       //模块id传出

    
                    moduleList.dataList.push({
                        content:column.columnName,      //模块名称
                        value:tag,        //通过value将选中的该字段的 字段名称和模块id传出
                    })

                    
                    // console.log(tag,'tag============')
                    //根据字段类型 改变联动数据源
                    var type = column.columnType;
    
                        if ( type === 'varchar'){
                            varcharArr.push(columnName)
    
                        } else if (type === 'int' || type === 'decimal'){
                            numberArr.push(columnName)
    
                        } else if (type === 'datetime'){
                            datetimeArr.push(columnName)
                        }
    
                });
    
                // This.$model = moduleList;
                typeof callback === 'function' && callback(moduleList);
            }.bind(this)).send({
                 "moduleId":moduleId
            });
        });
        return moduleListModel
    }
    
});

