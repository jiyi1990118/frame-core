


/**
 * Created by lei on 17-1-12.
 */
//此方法是根据列表顶部按钮的类型不同来做不同的事件处理
extend('gridBtnOperation',function(){

    // var inputIds = document.querySelector("input[name=ids]").val;  //页面中未显示标签作传值用

    function btnOperation(rowData,btndata,view,gridApi) {

        var topEventsList ={
            click:function(event){
                var inputIds = document.querySelector('input[name=ids]').value,//页面中未显示标签作传值用
                    viewId = $_GET['viewId'],
                    moduleId = $_GET['moduleId'];

                var arr1 = inputIds.split(','),
                    arr2 = arr1.splice(0,1);

                if (btndata.type == '0') {            		//提交，以下是提交类型的判断
                    var submiturl = "";
                    if (btndata.submitType == 2) {            //自定义提交
                        submiturl = btndata.submitUrl;
                        var sendObj = null;

                        if (btndata.operationPosition == '0') {    //操作位置在页面顶部
                            sendObj = {
                                'recordIds':inputIds.replace(/^,/,''),
                                'viewId':viewId,
                                'moduleId':moduleId
                            }
                        } else if(btndata.operationPosition == '1'){   //操作位置在列表中
                            sendObj = {
                                'id':rowData.ID,
                                'viewId':viewId,
                                'moduleId':moduleId
                            }
                        }
                        var viewDetail = $FRAME.$model(function () {

                            //请求接口视图详情
                            var $moduleListServer = this.server({
                                serverType:'api',
                                method:'POST',
                                url:submiturl
                            }).receive(function (res) {

                            }.bind(this)).send(sendObj);

                        });

                    }

                    if(btndata.flushType=="REDIRECT"){   //页面跳转
                        if (btndata.forwardVid != null) {
                            var viewDetail = $FRAME.$model(function () {
                                //请求接口视图详情
                                var $moduleListServer = this.server({
                                    serverType:'api',
                                    method:'POST',
                                    url:'viewSearchDetail'     //根据Id查询视图详情
                                }).receive(function (res) {
                                    // console.log(res,"\\\\\\\\\\\\\\\\\\\\")
                                    if( res.status == 0 ) {
                                        console.log("数据异常!")
                                    } else {

                                        var view = res.data;

                                        //判断视图类型
                                        if (view.viewType == 1) {      //列表

                                            if(btndata.followType=="FOLLOW"){
                                                $FRAME.redirect('home/custom/list.html?viewId=' + view.id );
                                            }else{
                                                if(btndata.flushType=="ALL"){
                                                    $FRAME.redirect('home/custom/list.html?viewId=' + view.id);
                                                }else if(btndata.flushType=="CURRENT"){
                                                    $FRAME.refresh()
                                                }
                                            }
                                        } else if (view.viewType == 2) {   //新增
                                            $FRAME.redirect('home/custom/add?viewId=' + view.id + '&moduleId=' + view.moduleId );
                                        } else if (view.viewType == 3) {      //编辑
                                            $FRAME.redirect('home/custom/edit?viewId=' + view.id + '&moduleId=' + view.moduleId );
                                        } else if (view.viewType == 5) {
                                            var params = {
                                                //meViewId: view.id,
                                                meModuleId: view.moduleId,
                                                ids: inputIds
                                            }
                                            if(view.viewUrl.indexOf('?')>=0){
                                                $FRAME.redirect(view.viewUrl+'&viewId=' + view.id + '&moduleId=' + view.moduleId );
                                            }else{
                                                $FRAME.redirect(view.viewUrl+'?viewId=' + view.id + '&moduleId=' + view.moduleId );
                                            }
                                        }
                                    }
                                }.bind(this)).send({
                                    "id":btndata.forwardVid
                                });

                            });
                        }

                    }else if(btndata.flushType=="GOBACK"){   //返回上一步
                        $FRAME.goBack()
                    }else if(btndata.flushType=="CURRENT"){   //刷新当前页
                        $FRAME.refresh()
                    }else if(btndata.flushType=="NO"){
                        //ME.page.refreshto();
                    }else if(btndata.flushType=="FLUSHLIST"){  //刷新当前列表
                        $FRAME.refresh()
                    }


                    // var submiturl = "";
                    // if (btndata.submitType == 0) {            //新增提交
                    //     // submiturl = '这里是新增提交接口'
                    //
                    // } else if (btndata.submitType == 1) {     //修改提交
                    //     // submiturl =  '这里是修改提交接口'
                    //
                    // } else if (btndata.submitType == 2 && btndata.submitUrl != null && btndata.submitUrl != "") {  //自定义提交
                    //     submiturl = btndata.submitUrl;
                    //
                    // } else if (btndata.submitUrl == null ||btndata.submitUrl == undefined || btndata.submitUrl == ""){
                    //

                    //     if(btndata.flushType=="REDIRECT"){   //页面跳转
                    //         if (btndata.forwardVid != null) {
                    //             var viewDetail = $FRAME.$model(function () {
                    //                 //请求接口视图详情
                    //                 var $moduleListServer = this.server({
                    //                     serverType:'api',
                    //                     method:'POST',
                    //                     url:'viewSearchDetail'     //根据Id查询视图详情
                    //                 }).receive(function (res) {
                    //                     // console.log(res,"\\\\\\\\\\\\\\\\\\\\")
                    //                     if( res.status == 0 ) {
                    //                         console.log("数据异常!")
                    //                     } else {
                    //
                    //                         var view = res.data;
                    //
                    //                         //判断视图类型
                    //                         if (view.viewType == 1) {      //列表
                    //
                    //                             if(btndata.followType=="FOLLOW"){
                    //                                 $FRAME.redirect('home/custom/list.html?viewId=' + view.id );
                    //                             }else{
                    //                                 if(btndata.flushType=="ALL"){
                    //                                     $FRAME.redirect('home/custom/list.html?viewId=' + view.id);
                    //                                 }else if(btndata.flushType=="CURRENT"){
                    //                                     $FRAME.refresh()
                    //                                 }
                    //                             }
                    //                         } else if (view.viewType == 2) {   //新增
                    //                             $FRAME.redirect('home/custom/add?viewId=' + view.id + '&moduleId=' + view.moduleId );
                    //                         } else if (view.viewType == 3) {      //编辑
                    //                             $FRAME.redirect('home/custom/edit?viewId=' + view.id + '&moduleId=' + view.moduleId );
                    //                         } else if (view.viewType == 5) {
                    //                             var params = {
                    //                                 //meViewId: view.id,
                    //                                 meModuleId: view.moduleId,
                    //                                 ids: inputIds
                    //                             }
                    //                             if(view.viewUrl.indexOf('?')>=0){
                    //                                 $FRAME.redirect(view.viewUrl+'&viewId=' + view.id + '&moduleId=' + view.moduleId );
                    //                             }else{
                    //                                 $FRAME.redirect(view.viewUrl+'?viewId=' + view.id + '&moduleId=' + view.moduleId );
                    //                             }
                    //                         }
                    //                     }
                    //                 }.bind(this)).send({
                    //                     "id":btndata.forwardVid
                    //                 });
                    //
                    //             });
                    //         }
                    //
                    //     }else if(btndata.flushType=="GOBACK"){   //返回上一步
                    //         $FRAME.goBack()
                    //     }else if(btndata.flushType=="CURRENT"){   //刷新当前页
                    //         $FRAME.refresh()
                    //     }else if(btndata.flushType=="NO"){
                    //         //ME.page.refreshto();
                    //     }else if(btndata.flushType=="FLUSHLIST"){  //刷新当前列表
                    //         $FRAME.refresh()
                    //     }
                    // }
                }  else if (btndata.type == '1') {       //新增 ( 主要 ：跳转 )

                    if (btndata.forwardVid != null) {
                        //
                        var viewDetail = $FRAME.$model(function () {
                            //请求接口视图详情
                            var $moduleListServer = this.server({
                                serverType:'api',
                                method:'POST',
                                url:'viewSearchDetail'     //根据Id查询视图详情
                            }).receive(function (res) {

                                if( res.status == 0 ) {
                                    console.log("新增页面数据异常!")
                                } else {

                                    var view = res.data;

                                    if (view.viewType == 5)	{    		//viewType == 5 表示‘自定义新增’
                                        var params = {
                                            ids: inputIds,
                                            meModuleId: view.moduleId
                                        }
                                        if(view.viewUrl.indexOf('?')>=0){
                                            $FRAME.redirect(view.viewUrl+ "&moduleId=" + params.meModuleId);
                                        }else{
                                            $FRAME.redirect(view.viewUrl+ "&moduleId=" + params.meModuleId);
                                        }
                                    } else if (view.viewType == 7) {    //viewType == 7 表示‘批量新增’

                                        $FRAME.redirect("home/custom/add?viewId="+btndata.forwardVid+ '&moduleId=' + view.moduleId);

                                    } else {

                                        if (btndata.followType=="FOLLOW") {
                                            $FRAME.redirect("home/custom/add?viewId="+btndata.forwardVid+ '&moduleId=' + view.moduleId +'&saveId='+$_GET['viewId'])
                                        }else if(btndata.followType=="DIALOG"){
                                            $dialog({
                                                // title: view.viewName,
                                                // width:1100,
                                                // height:400,
                                                // content:'<form id="form" name="form" enctype="multipart/form-data"><div id="dialog"></div><div id="button"></div></form>',
                                                // init:function(){
                                                //     ME.getModel("custom:viewrender/add",btndata.forwardVid,1)(function(data){
                                                //         ME.GUI.runGui({
                                                //             name: "form-layout-two",
                                                //             config: data.layoutList[0],
                                                //             element: document.querySelector('#dialog')
                                                //         });
                                                //         ME.GUI.runGui({
                                                //             name: "btn-group-me",
                                                //             config: ME.getModel("comm:button/groupForData","custom:common/viewconfig/getViewbtndata",btndata.forwardVid),
                                                //             element: document.querySelector('#button')
                                                //         });
                                                //     });
                                                // }
                                            })
                                        }
                                    }
                                }
                            }.bind(this)).send({
                                "id":btndata.forwardVid
                            });

                        });

                    }
                }  else if (btndata.type == '5') {	     //流程提交
                    if (btndata.forwardVid != null) {
                        //
                        var viewDetail = $FRAME.$model(function () {
                            //请求接口视图详情
                            var $moduleListServer = this.server({
                                serverType:'api',
                                method:'POST',
                                url:'viewSearchDetail'     //根据Id查询视图详情
                            }).receive(function (res) {
                                console.log(res,"\\\\\\\\\\\\\\\\\\\\")
                                if( res.status == 0 ) {
                                    console.log("新增页面数据异常!")
                                } else {
                                    var view = res.data;

                                    $FRAME.redirect(view.viewUrl.replace(':','/')+ "&viewId="+btndata.forwardVid+ "&meModuleId=" + view.moduleId);
                                }
                            }.bind(this)).send({
                                "id":btndata.forwardVid
                            });

                        });

                    }
                }  else if (btndata.type == '9') {       //提交确认
                    //在新增页面或修改页面顶部已写死
                    $packages('{PLUGINS}/modal/modal-dialog',function (dialog) {
                        dialog({
                            title:'确认提交',
                            maxmin:true,
                            content:'<h3>{{title}}</h3>',
                            scope:{
                                title:'确认提交?'
                            },
                            filter:{},
                            height:'200px',
                            width:'400px',
                            btns:[
                                {
                                    name:'确认',
                                    trigger:function (eve,interface) {
                                        var submiturl = "";
                                        if (btndata.submitType == 2) {            //自定义提交
                                            submiturl = btndata.submitUrl;
                                            var sendObj = null;

                                            if (btndata.operationPosition == '0') {    //操作位置在页面顶部
                                                sendObj = {
                                                    'recordIds':inputIds.replace(/^,/,''),
                                                    'viewId':viewId,
                                                    'moduleId':moduleId
                                                }
                                            } else if(btndata.operationPosition == '1'){   //操作位置在列表中
                                                sendObj = {
                                                    'id':rowData.ID,
                                                    'viewId':viewId,
                                                    'moduleId':moduleId
                                                }
                                            }
                                            var viewDetail = $FRAME.$model(function () {

                                                //请求接口视图详情
                                                var $moduleListServer = this.server({
                                                    serverType:'api',
                                                    method:'POST',
                                                    url:submiturl
                                                }).receive(function (res) {

                                                }.bind(this)).send(sendObj);

                                            });

                                        }

                                        if(btndata.flushType=="REDIRECT"){   //页面跳转
                                            if (btndata.forwardVid != null) {
                                                var viewDetail = $FRAME.$model(function () {
                                                    //请求接口视图详情
                                                    var $moduleListServer = this.server({
                                                        serverType:'api',
                                                        method:'POST',
                                                        url:'viewSearchDetail'     //根据Id查询视图详情
                                                    }).receive(function (res) {
                                                        // console.log(res,"\\\\\\\\\\\\\\\\\\\\")
                                                        if( res.status == 0 ) {
                                                            console.log("数据异常!")
                                                        } else {

                                                            var view = res.data;

                                                            //判断视图类型
                                                            if (view.viewType == 1) {      //列表

                                                                if(btndata.followType=="FOLLOW"){
                                                                    $FRAME.redirect('home/custom/list.html?viewId=' + view.id );
                                                                }else{
                                                                    if(btndata.flushType=="ALL"){
                                                                        $FRAME.redirect('home/custom/list.html?viewId=' + view.id);
                                                                    }else if(btndata.flushType=="CURRENT"){
                                                                        $FRAME.refresh()
                                                                    }
                                                                }
                                                            } else if (view.viewType == 2) {   //新增
                                                                $FRAME.redirect('home/custom/add?viewId=' + view.id + '&moduleId=' + view.moduleId );
                                                            } else if (view.viewType == 3) {      //编辑
                                                                $FRAME.redirect('home/custom/edit?viewId=' + view.id + '&moduleId=' + view.moduleId );
                                                            } else if (view.viewType == 5) {
                                                                var params = {
                                                                    //meViewId: view.id,
                                                                    meModuleId: view.moduleId,
                                                                    ids: inputIds
                                                                }
                                                                if(view.viewUrl.indexOf('?')>=0){
                                                                    $FRAME.redirect(view.viewUrl+'&viewId=' + view.id + '&moduleId=' + view.moduleId );
                                                                }else{
                                                                    $FRAME.redirect(view.viewUrl+'?viewId=' + view.id + '&moduleId=' + view.moduleId );
                                                                }
                                                            }
                                                        }
                                                    }.bind(this)).send({
                                                        "id":btndata.forwardVid
                                                    });

                                                });
                                            }

                                        }else if(btndata.flushType=="GOBACK"){   //返回上一步
                                            $FRAME.goBack()
                                        }else if(btndata.flushType=="CURRENT"){   //刷新当前页
                                            $FRAME.refresh()
                                        }else if(btndata.flushType=="NO"){
                                            //ME.page.refreshto();
                                        }else if(btndata.flushType=="FLUSHLIST"){  //刷新当前列表
                                            $FRAME.refresh()
                                        }

                                        interface.close();
                                    }
                                },
                                {
                                    name:'取消',
                                    theme:"warning", //[ primary , success , info , warning , danger ]
                                    trigger:function (eve,interface) {
                                        interface.close();
                                    }
                                }
                            ]
                        })
                    })

                }  else if (btndata.type == '10') {      //数据导出
                    alert("数据导出")
                }  else if(btndata.type == '8'){         //新增关联模块数据
                    //获取新增页面的model层数据
                    var viewStructConf =  $FRAME.model('HOME@custom/add:popViewStructConf');
// console.log(btndata,'btndata')
                    viewStructConf.method('getConf',{viewId:btndata.forwardVid},rowData.ID,btndata.moduleId);
                    var domHtml = '<div class="batchUpdata" style="padding:20px"><tab-scroll config="viewStructConf.tabConf"></tab-scroll></div>';

                    $packages('{PLUGINS}/modal/modal-dialog',function (dialog) {
                        dialog({
                            title:btndata.operationName,
                            maxmin:true,
                            content:domHtml,
                            scope:{
                                viewStructConf:viewStructConf
                            },
                            filter:{},
                            height:'400px',
                            width:'1100px',
                            btns:[
                                {
                                    name:'确认',
                                    trigger:function (eve,interface) {
                                        var batchForms=viewStructConf.batchForms,
                                            masterForms=viewStructConf.masterForms;

                                        var isPass = true,
                                            formData = {
                                                viewId: btndata.forwardVid,
                                                columnMap: {},
                                                batchColumn: {}
                                            };

                                        masterForms.forEach(function (masterForm) {
                                            var batchData = [];
                                            if (!masterForm.form.valid()) isPass = false;
                                            masterForm.form.getData().forEach(function (vals, name) {
                                                formData.columnMap[name]=vals;
                                            });
                                        })

                                        // if(isUpdate) formData.columnMap['obj.ID']=isUpdate;
                                        //检查数据校验是否通过
                                        if (!isPass)return;

                                        batchForms.forEach(function (formInfo) {
                                            var batchData = [];
                                            if (!formInfo.form.valid()) isPass = false;
                                            formInfo.form.getData().forEach(function (vals, name) {
                                                typeof vals === "object" ? vals.forEach(function (val, index) {
                                                    batchData[index] = batchData[index] || {};
                                                    batchData[index][name] = val;
                                                }) : batchData[0] = batchData[0] || {}, batchData[0][name] = vals;
                                            });
                                            formData.batchColumn['obj'+formInfo.id] = batchData;
                                        });
console.log(formData,'formData')
                                        //检查数据校验是否通过
                                        if (!isPass)return;

                                        $packages('{PLUGINS}/hint/hint-message',function ($message) {

                                            $FRAME.server({
                                                serverType:'api',
                                                url:'realAdd'           //新增
                                            }).success(function (res) {
                                                $message('新增成功','success');
                                                

                                                // $FRAME.redirect('home/custom/list?viewId='+$_GET['saveId']+'&moduleId='+viewInfo.moduleId);
                                            }).fail(function () {
                                                $message('新增失败','danger');
                                            }).send(formData)

                                        })
                                        interface.close();
                                    }

                                },
                                {
                                    name:'取消',
                                    theme:"warning", //[ primary , success , info , warning , danger ]
                                    trigger:function (eve,interface) {
                                        interface.close();
                                    }
                                }
                            ]
                        })
                    })
                } else if (btndata.type == '7') {	  //批量操作

                    if (btndata.submitDataType != null && btndata.submitDataType == "ALL") {

                    }

                    if (inputIds == null || inputIds == "" || inputIds.replace(/,/g,'') == "") {
                        $packages('{PLUGINS}/hint/hint-message',function ($message) {
                            $message('请选择要批量操作的数据！');
                        })
                    } else {
                        if (btndata.batchType == 'DELETE') { //如果是批量删除

                            $packages('{PLUGINS}/modal/modal-dialog',function (dialog) {
                                dialog({
                                    title:'确认删除',
                                    maxmin:true,
                                    content:'<h3>{{title}}</h3>',
                                    scope:{
                                        title:'确认对选中的'+inputIds.replace(/^,/,'').split(",").length+'条数据进行批量删除？'
                                    },
                                    filter:{},
                                    height:'200px',
                                    width:'400px',
                                    btns:[
                                        {
                                            name:'确认',
                                            trigger:function (eve,interface) {

                                                var viewDetail = $FRAME.$model(function () {
                                                    //选择模块
                                                    var $moduleListServer = this.server({
                                                        serverType:'api',
                                                        method:'POST',
                                                        url:'viewbtndataDelete'      //删除真实数据，custom/C12003
                                                    }).receive(function (data) {

                                                        if (data.state == 0) {
                                                            $packages('{PLUGINS}/hint/hint-message',function ($message) {
                                                                $message(data.message);
                                                            })
                                                        } else {
                                                            if(btndata.flushType=="REDIRECT"){   //页面跳转
                                                                if (btndata.forwardVid != null) {
                                                                    var $moduleListServer = this.server({
                                                                        serverType:'api',
                                                                        method:'POST',
                                                                        url:'viewSearchDetail'  //根据Id查询视图详情 custom/C11002
                                                                    }).receive(function (viewDt) {

                                                                        if (viewDt.state == '0') {
                                                                            $packages('{PLUGINS}/hint/hint-message',function ($message) {
                                                                                $message("数据异常！");
                                                                            })
                                                                        } else {
                                                                            var view = viewDt.data;
                                                                            if (view.viewType == 1) {				//列表
                                                                                $FRAME.redirect("home/custom/list?viewId="+view.id + '&moduleId=' + view.moduleId);
                                                                            } else if (view.viewType == 2) {   //新增
                                                                                $FRAME.redirect("home/custom/add?viewId="+view.id + '&moduleId=' + view.moduleId);

                                                                            } else if (view.viewType == 3) {      //编辑
                                                                                $FRAME.redirect("home/custom/edit?viewId="+view.id + '&moduleId=' + view.moduleId);

                                                                            } else if (view.viewType == 5) { 	  //自定义
                                                                                var params = {
                                                                                    ids: inputIds,
                                                                                    meModuleId: view.moduleId
                                                                                }
                                                                                if(view.viewUrl.indexOf('?')>=0){
                                                                                    $FRAME.redirect(view.viewUrl+'&ids='+params.ids +'&moduleId='+params.meModuleId );
                                                                                }else{
                                                                                    $FRAME.redirect(view.viewUrl+'?ids'+params.ids +'&moduleId='+params.meModuleId );
                                                                                }
                                                                            }
                                                                        }
                                                                    }.bind(this)).send({
                                                                        "id":btndata.forwardVid
                                                                    });
                                                                }
                                                            }else if(btndata.flushType=="GOBACK"){   //返回上一步
                                                                $FRAME.goBack()
                                                            }else if(btndata.flushType=="CURRENT"){   //刷新当前页
                                                                $FRAME.refresh()
                                                            }else if(btndata.flushType=="NO"){
                                                                //ME.page.refreshto();
                                                            }else if(btndata.flushType=="FLUSHLIST"){  //刷新当前列表
                                                                $FRAME.refresh()
                                                            }
                                                        }
                                                    }.bind(this)).send({

                                                        "viewId": view.id,
                                                        "recordIds":arr1
                                                    });
                                                })
                                                interface.close();
                                            }

                                        },
                                        {
                                            name:'取消',
                                            theme:"warning", //[ primary , success , info , warning , danger ]
                                            trigger:function (eve,interface) {
                                                interface.close();
                                            }
                                        }
                                    ]
                                })
                            })

                        }else{
                            if(btndata.batchUpdateViewId!=null){

                                var batchdetail = $FRAME.$model(function () {
                                    var $moduleListServer = this.server({
                                        serverType:'api',
                                        method:'POST',
                                        url:'viewSearchDetail'  //根据Id查询视图详情 custom/C11002
                                    }).receive(function (viewDt) {

                                        if (viewDt.state == '0') {
                                            $packages('{PLUGINS}/hint/hint-message',function ($message) {
                                                $message("数据异常！");
                                            })
                                        } else {
                                            var view = viewDt.data;

                                            //获取新增页面的model层数据
                                            var viewStructConf =  $FRAME.model('HOME@custom/add:viewStructConf');

                                            viewStructConf.method('getConf',btndata.batchUpdateViewId,true);
                                            var domHtml = '<div class="batchUpdata" style="padding:20px"><tab-scroll config="viewStructConf.tabConf"></tab-scroll></div>';

                                            $packages('{PLUGINS}/modal/modal-dialog',function (dialog) {
                                                dialog({
                                                    title:btndata.operationName,
                                                    maxmin:true,
                                                    content:domHtml,
                                                    scope:{
                                                        viewStructConf:viewStructConf
                                                    },
                                                    filter:{},
                                                    height:'400px',
                                                    width:'1100px',
                                                    btns:[
                                                        {
                                                            name:'确认',
                                                            trigger:function (eve,interface) {
                                                                $packages('{PLUGINS}/modal/modal-dialog',function (dialog) {
                                                                    dialog({
                                                                        title:'确认批量更新',
                                                                        maxmin:true,
                                                                        content:'<h3>{{title}}</h3>',
                                                                        scope:{
                                                                            title:'确认对选中的'+inputIds.replace(/^,/,'').split(",").length+'条数据进行批量更新？'
                                                                        },
                                                                        filter:{},
                                                                        height:'300px',
                                                                        width:'600px',
                                                                        btns:[
                                                                            {
                                                                                name:'确认',
                                                                                trigger:function (eve,interface) {


                                                                                    //正常提交
                                                                                    var addApi = $FRAME.model('HOME@custom/list:batchsUpdata');

                                                                                    submit(viewStructConf.masterForms,viewStructConf.viewInfo)

                                                                                    function submit(masterForms,viewInfo) {
                                                                                        var isPass = true,
                                                                                            formData = {
                                                                                                viewId: btndata.batchUpdateViewId,
                                                                                                recordIds: arr1,
                                                                                                columnMap: {}
                                                                                            };
                                                                                        var $gridApi = gridApi.get();

                                                                                        masterForms.forEach(function (masterForm) {
                                                                                            var batchData = [];
                                                                                            if (!masterForm.form.valid()) isPass = false;
                                                                                            masterForm.form.getData().forEach(function (vals, name) {
                                                                                                formData.columnMap[name]=vals;
                                                                                            });
                                                                                            console.log( masterForm.form,masterForm.form.getData())
                                                                                        })

                                                                                        console.log(formData,btndata.batchType,'tijia');
                                                                                        //检查数据校验是否通过
                                                                                        if (!isPass)return;

                                                                                        var plsubmiturl = "";
                                                                                        //批量操作的方式  自定义

                                                                                        if(btndata.batchType == 'CUSTOM'){
                                                                                            plsubmiturl = btndata.submitUrl;

                                                                                            //请求接口视图详情
                                                                                            $FRAME.server({
                                                                                                serverType:'api',
                                                                                                method:'POST',
                                                                                                url:plsubmiturl
                                                                                            }).receive(function (res) {
                                                                                                console.log(res,'自定义的批量保存接口返回数据')
                                                                                                $packages('{PLUGINS}/hint/hint-message',function ($message) {
                                                                                                    if(res.status == 200){
                                                                                                        $message('更新成功','success');

                                                                                                        if(btndata.flushType=="REDIRECT"){   //页面跳转
                                                                                                            if (btndata.forwardVid != null) {
                                                                                                                var viewDetail = $FRAME.$model(function () {
                                                                                                                    //请求接口视图详情
                                                                                                                    var $moduleListServer = this.server({
                                                                                                                        serverType:'api',
                                                                                                                        method:'POST',
                                                                                                                        url:'viewSearchDetail'     //根据Id查询视图详情
                                                                                                                    }).receive(function (res) {
                                                                                                                        // console.log(res,"\\\\\\\\\\\\\\\\\\\\")
                                                                                                                        if( res.status == 0 ) {
                                                                                                                            console.log("数据异常!")
                                                                                                                        } else {

                                                                                                                            var view = res.data;

                                                                                                                            //判断视图类型
                                                                                                                            if (view.viewType == 1) {      //列表

                                                                                                                                if(btndata.followType=="FOLLOW"){
                                                                                                                                    $FRAME.redirect('home/custom/list.html?viewId=' + view.id );
                                                                                                                                }else{
                                                                                                                                    if(btndata.flushType=="ALL"){
                                                                                                                                        $FRAME.redirect('home/custom/list.html?viewId=' + view.id);
                                                                                                                                    }else if(btndata.flushType=="CURRENT"){
                                                                                                                                        $FRAME.refresh()
                                                                                                                                    }
                                                                                                                                }
                                                                                                                            } else if (view.viewType == 2) {   //新增
                                                                                                                                $FRAME.redirect('home/custom/add?viewId=' + view.id + '&moduleId=' + view.moduleId );
                                                                                                                            } else if (view.viewType == 3) {      //编辑
                                                                                                                                $FRAME.redirect('home/custom/edit?viewId=' + view.id + '&moduleId=' + view.moduleId );
                                                                                                                            } else if (view.viewType == 5) {
                                                                                                                                var params = {
                                                                                                                                    //meViewId: view.id,
                                                                                                                                    meModuleId: view.moduleId,
                                                                                                                                    ids: inputIds
                                                                                                                                }
                                                                                                                                if(view.viewUrl.indexOf('?')>=0){
                                                                                                                                    $FRAME.redirect(view.viewUrl+'&viewId=' + view.id + '&moduleId=' + view.moduleId );
                                                                                                                                }else{
                                                                                                                                    $FRAME.redirect(view.viewUrl+'?viewId=' + view.id + '&moduleId=' + view.moduleId );
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }.bind(this)).send({
                                                                                                                        "id":btndata.forwardVid
                                                                                                                    });

                                                                                                                });
                                                                                                            }

                                                                                                        }else if(btndata.flushType=="GOBACK"){   //返回上一步
                                                                                                            $FRAME.goBack()
                                                                                                        }else if(btndata.flushType=="CURRENT"){   //刷新当前页
                                                                                                            $FRAME.refresh()
                                                                                                        }else if(btndata.flushType=="NO"){
                                                                                                            //ME.page.refreshto();
                                                                                                        }else if(btndata.flushType=="FLUSHLIST"){  //刷新当前列表
                                                                                                            $gridApi.sendData({
                                                                                                                viewId: viewId,
                                                                                                                "currentPage": 1,
                                                                                                                "pageSize": 20,
                                                                                                                "sidx": "id",
                                                                                                                "order": "desc",
                                                                                                                fuzzyQueryVal: ''
                                                                                                            }, false);
                                                                                                            $gridApi.update();
                                                                                                        }

                                                                                                        return
                                                                                                    }
                                                                                                    $message('更新失败','danger');
                                                                                                })
                                                                                            }.bind(this)).send({
                                                                                                recordIds:arr1,
                                                                                                columnMap:formData.columnMap,
                                                                                                viewId:viewId
                                                                                            });

                                                                                        }else{
                                                                                            addApi.method('sendData', formData, function (state) {

                                                                                                $packages('{PLUGINS}/hint/hint-message',function ($message) {
                                                                                                    if(state){
                                                                                                        $message(state.message,'success');
                                                                                                        setTimeout(function(){
                                                                                                            if(btndata.flushType=="REDIRECT"){   //页面跳转
                                                                                                                if (btndata.forwardVid != null) {
                                                                                                                    var viewDetail = $FRAME.$model(function () {
                                                                                                                        //请求接口视图详情
                                                                                                                        var $moduleListServer = this.server({
                                                                                                                            serverType:'api',
                                                                                                                            method:'POST',
                                                                                                                            url:'viewSearchDetail'     //根据Id查询视图详情
                                                                                                                        }).receive(function (res) {
                                                                                                                            // console.log(res,"\\\\\\\\\\\\\\\\\\\\")
                                                                                                                            if( res.status == 0 ) {
                                                                                                                                console.log("数据异常!")
                                                                                                                            } else {

                                                                                                                                var view = res.data;

                                                                                                                                //判断视图类型
                                                                                                                                if (view.viewType == 1) {      //列表

                                                                                                                                    if(btndata.followType=="FOLLOW"){
                                                                                                                                        $FRAME.redirect('home/custom/list.html?viewId=' + view.id );
                                                                                                                                    }else{
                                                                                                                                        if(btndata.flushType=="ALL"){
                                                                                                                                            $FRAME.redirect('home/custom/list.html?viewId=' + view.id);
                                                                                                                                        }else if(btndata.flushType=="CURRENT"){
                                                                                                                                            $FRAME.refresh()
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                } else if (view.viewType == 2) {   //新增
                                                                                                                                    $FRAME.redirect('home/custom/add?viewId=' + view.id + '&moduleId=' + view.moduleId );
                                                                                                                                } else if (view.viewType == 3) {      //编辑
                                                                                                                                    $FRAME.redirect('home/custom/edit?viewId=' + view.id + '&moduleId=' + view.moduleId );
                                                                                                                                } else if (view.viewType == 5) {
                                                                                                                                    var params = {
                                                                                                                                        //meViewId: view.id,
                                                                                                                                        meModuleId: view.moduleId,
                                                                                                                                        ids: inputIds
                                                                                                                                    }
                                                                                                                                    if(view.viewUrl.indexOf('?')>=0){
                                                                                                                                        $FRAME.redirect(view.viewUrl+'&viewId=' + view.id + '&moduleId=' + view.moduleId );
                                                                                                                                    }else{
                                                                                                                                        $FRAME.redirect(view.viewUrl+'?viewId=' + view.id + '&moduleId=' + view.moduleId );
                                                                                                                                    }
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }.bind(this)).send({
                                                                                                                            "id":btndata.forwardVid
                                                                                                                        });

                                                                                                                    });
                                                                                                                }

                                                                                                            }else if(btndata.flushType=="GOBACK"){   //返回上一步
                                                                                                                $FRAME.goBack()
                                                                                                            }else if(btndata.flushType=="CURRENT"){   //刷新当前页
                                                                                                                $FRAME.refresh()
                                                                                                            }else if(btndata.flushType=="NO"){
                                                                                                                //ME.page.refreshto();
                                                                                                            }else if(btndata.flushType=="FLUSHLIST"){  //刷新当前列表
                                                                                                                $gridApi.sendData({
                                                                                                                    viewId: viewId,
                                                                                                                    "currentPage": 1,
                                                                                                                    "pageSize": 20,
                                                                                                                    "sidx": "id",
                                                                                                                    "order": "desc",
                                                                                                                    fuzzyQueryVal: ''
                                                                                                                }, false);
                                                                                                                $gridApi.update();
                                                                                                            }
                                                                                                        },1300)

                                                                                                        return
                                                                                                    }
                                                                                                    $message('更新失败','danger');
                                                                                                })
                                                                                            });
                                                                                        }


                                                                                    }




                                                                                    interface.close();
                                                                                }

                                                                            },
                                                                            {
                                                                                name:'取消',
                                                                                theme:"warning", //[ primary , success , info , warning , danger ]
                                                                                trigger:function (eve,interface) {
                                                                                    interface.close();
                                                                                }
                                                                            }
                                                                        ]
                                                                    })
                                                                })
                                                                interface.close();
                                                            }

                                                        },
                                                        {
                                                            name:'取消',
                                                            theme:"warning", //[ primary , success , info , warning , danger ]
                                                            trigger:function (eve,interface) {
                                                                interface.close();
                                                            }
                                                        }
                                                    ]
                                                })
                                            })
                                        }
                                    }.bind(this)).send({
                                        "id":btndata.batchUpdateViewId
                                    });
                                })
                            }else{
                                if(btndata.submitUrl!=null&&btndata.submitUrl!=""){
                                    var submitmodule = $FRAME.$model(function () {
                                        //请求接口视图详情
                                        var $moduleListServer = this.server({
                                            serverType:'api',
                                            method:'POST',
                                            url:btndata.submitUrl     //自定义提交地址
                                        }).receive(function (data) {

                                            if (data.state == 0) {
                                                $packages('{PLUGINS}/hint/hint-message',function ($message) {
                                                    $message(data.message);
                                                })
                                            } else {
                                                if(btndata.flushType=="REDIRECT"){   //页面跳转
                                                    if (btndata.forwardVid != null) {
                                                        var $moduleListServer = this.server({
                                                            serverType:'api',
                                                            method:'POST',
                                                            url:'viewSearchDetail'  //根据Id查询视图详情 custom/C11002
                                                        }).receive(function (viewDt) {

                                                            if (viewDt.state == '0') {
                                                                $packages('{PLUGINS}/hint/hint-message',function ($message) {
                                                                    $message("数据异常！");
                                                                })
                                                            } else {
                                                                var view = viewDt.data;
                                                                if (view.viewType == 1) {				//列表
                                                                    $FRAME.redirect("home/custom/list?viewId="+view.id + '&moduleId=' + view.moduleId);
                                                                } else if (view.viewType == 2) {   //新增
                                                                    $FRAME.redirect("home/custom/add?viewId="+view.id + '&moduleId=' + view.moduleId);

                                                                } else if (view.viewType == 3) {      //编辑
                                                                    $FRAME.redirect("home/custom/edit?viewId="+view.id + '&moduleId=' + view.moduleId);

                                                                } else if (view.viewType == 5) { 	  //自定义
                                                                    var params = {
                                                                        ids: inputIds,
                                                                        meModuleId: view.moduleId
                                                                    }
                                                                    if(view.viewUrl.indexOf('?')>=0){
                                                                        $FRAME.redirect(view.viewUrl+'&ids='+params.ids +'&moduleId='+params.meModuleId );
                                                                    }else{
                                                                        $FRAME.redirect(view.viewUrl+'?ids'+params.ids +'&moduleId='+params.meModuleId );
                                                                    }
                                                                }
                                                            }
                                                        }.bind(this)).send({
                                                            "id":btndata.forwardVid
                                                        });
                                                    }
                                                }else if(btndata.flushType=="GOBACK"){   //返回上一步
                                                    $FRAME.goBack()
                                                }else if(btndata.flushType=="CURRENT"){   //刷新当前页
                                                    $FRAME.refresh()
                                                }else if(btndata.flushType=="NO"){
                                                    //ME.page.refreshto();
                                                }else if(btndata.flushType=="FLUSHLIST"){  //刷新当前列表
                                                    $FRAME.refresh()
                                                }
                                            }

                                        }.bind(this)).send({
                                            "id":inputIds          //不一定是这个，总之跟这个储存选中值的有关系
                                        });

                                    });
                                }
                            }
                        }
                    }
                } else if(btndata.type == "2"){
                    // console.log(rowData)
                    var recordId = rowData.ID;
                    // var cp = document.querySelector(".focus").querySelector(".focus span").innerHTML;
                    if (btndata.forwardVid != null) {
                        var operationDetail = $FRAME.$model(function () {

                            var $moduleListServer = this.server({
                                serverType:'api',
                                method:'POST',
                                url:'viewSearchDetail'       //根据Id查询视图详情
                            }).receive(function (viewDt) {
                                // console.log(viewDt,"\\\\\\\\\\\\\\\\\\\\")
                                if (viewDt.state == '0') {
                                    console.log("数据异常！");
                                } else {
                                    var view = viewDt.data; /*console.log(rowData,view,'-----------------')*/
                                    if (view.viewType == 5) {          //自定义

                                        if (view.viewUrl.indexOf('?') > 0) {
                                            $FRAME.redirect(view.viewUrl + "&recordId=" + recordId + '&cp=' + cp);
                                        } else {
                                            $FRAME.redirect(view.viewUrl + "?meViewId=" + btndata.forwardVid + "&recordId=" + recordId + '&cp=' + cp);
                                        }

                                    } else if (view.viewType == 3) {    //修改
                                        // $FRAME.redirect();            /******************/
                                        $FRAME.redirect('home/custom/edit?viewId='+btndata.forwardVid+ '&moduleId=' + view.moduleId +'&recordId='+rowData.ID)
                                    } else if (view.viewType == 8) {    //修改【含批量新增明细】
                                        $FRAME.redirect('home/custom/edit?viewId='+btndata.forwardVid+ '&moduleId=' + view.moduleId +'&recordId='+rowData.ID);
                                    }
                                }
                            }.bind(this)).send({
                                "id":btndata.forwardVid
                            });
                        })
                    }
                } else if(btndata.type == "3"){
                    $packages('{PLUGINS}/modal/modal-dialog',function (dialog) {
                        dialog({
                            title:'确认删除',
                            maxmin:true,
                            content:'<h3>{{title}}</h3>',
                            scope:{
                                title:'确认删除?'
                            },
                            filter:{},
                            height:'200px',
                            width:'400px',
                            btns:[
                                {
                                    name:'确认',
                                    trigger:function (eve,interface) {

                                        var viewDetail = $FRAME.$model(function () {
                                            //选择模块
                                            var $moduleListServer = this.server({
                                                serverType:'api',
                                                method:'POST',
                                                url:'viewOperationDelete'    //12003列表操作中删除数据
                                            }).receive(function (data) {

                                                if (data.state == 0) {
                                                    console.log(data.message);
                                                } else {
                                                    if (btndata.flushType == "REDIRECT" && btndata.forwardVid != null && btndata.forwardVid != undefined && btndata.forwardVid != "") {
                                                        var $moduleListServer = this.server({
                                                            serverType:'api',
                                                            method:'POST',
                                                            url:'viewSearchDetail'  //根据Id查询视图详情
                                                        }).receive(function (viewDt) {

                                                            if (viewDt.state == '0') {
                                                                console.log("数据异常！");
                                                            } else {
                                                                var view = viewDt.data;
                                                                if (view.viewType == 5) {          //自定义
                                                                    $FRAME.redirect(view.viewUrl);
                                                                } else if (view.viewType == 1) {    //列表
                                                                    console.log('原来你在这！！！！',gridApi.update)

                                                                    gridApi.update();
                                                                    // $FRAME.redirect('home/custom/list?viewId='+view.id);            /******************/
                                                                } else if (view.viewType == 2) {    //新增
                                                                    $FRAME.redirect();
                                                                }
                                                            }
                                                        }.bind(this)).send({
                                                            "id":btndata.forwardVid
                                                        });
                                                    } else if (btndata.flushType == "GOBACK") {
                                                        window.history.back();
                                                    } else if (btndata.flushType == "CURRENT") {
                                                        // ME.page.refreshto();
                                                    } else if (btndata.flushType == "FLUSHLIST") {
                                                        gridApi.update();
                                                    }
                                                }
                                            }.bind(this)).send({
                                                "viewId": view.id,
                                                "recordIds":[rowData.ID]
                                            });
                                        })
                                        interface.close();
                                    }
                                },
                                {
                                    name:'取消',
                                    theme:"warning", //[ primary , success , info , warning , danger ]
                                    trigger:function (eve,interface) {
                                        interface.close();
                                    }
                                }
                            ]
                        })
                    })
                }
            }
        };

        return topEventsList;
    }

    return 	btnOperation;
})