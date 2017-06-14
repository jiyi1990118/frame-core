/**
 *Created by lei on 17-2-28.
 *　　┏┓　　　┏┓+ +
 *　┏┛┻━━━┛┻┓ + +
 *　┃　　　　　　　┃ 　
 *　┃　　　━　　　┃ ++ + + +
 * ████━████ ┃+
 *　┃　　　　　　　┃ +
 *　┃　　　┻　　　┃
 *　┃　　　　　　　┃ + +
 *　┗━┓　　　┏━┛
 *　　　┃　　　┃　　　　　　　　　　　
 *　　　┃　　　┃ + + + +
 *　　　┃　　　┃
 *　　　┃　　　┃ +  神兽保佑
 *　　　┃　　　┃    代码无bug　　
 *　　　┃　　　┃　　+　　　　　　　　　
 *　　　┃　 　　┗━━━┓ + +
 *　　　┃ 　　　　　　　┣┓
 *　　　┃ 　　　　　　　┏┛
 *　　　┗┓┓┏━┳┓┏┛ + + + +
 *　　　　┃┫┫　┃┫┫
 *　　　　┗┻┛　┗┻┛+ + + +
 */

//根据查询自定义标签(C08005)来将数据动态渲染
extend(function () {
    //参数:
    // 1、callback    回调函数
    return function (model,gridApi,callback) {

        var This=model,
            viewId = $_GET['viewId'];
        var customerSystem = $FRAME.$model(function () {


            var $idServer = this.server({
                serverType:'api',
                method:'POST',
                url:'customerSearch'
            }).receive(function (data) {
                var customerSystem = [],
                    Data = data.data,
                    self = this;

                Data.forEach(function(res,key){
                    queryTagsId = Data[key].id

                    var listBtn ={
                        class:'btn btn-sapphire-blue', //【必填项】按钮样式   宝蓝色
                        icon:'iconfont icon-chenghao', //【非必填项】图标
                        label:res.tagName,//【必填项】按钮文字
                        align:'right',//【必填项】文字居中
                        padding:'7px 14px',  //【必填项】按钮内边距，可以控制按钮大小
                        events:{
                            click:function (event) {
                                // console.log(queryTagsId,key)
                                //使用查询标签下的 真实数据分页
                                $gridApi=gridApi.get();
                                console.log(gridApi,$gridApi)

                                $gridApi.sendData({
                                    "viewId":Data[key].viewId,    //暂时写死 应为res.viewId
                                    "currentPage":1,
                                    "pageSize":20,
                                    "sidx":"id",
                                    "order":"desc",
                                    "tagId":237,      //目前写死，应该是上面的queryTagsId
                                    "fuzzyQueryVal":''
                                },false);
                                $gridApi.update();

                            }
                        },
                        iconEvents:{
                            click:function (event) {
                                //停止事件冒泡
                                event.stopPropagation();

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

                                                    var tagsDelete = $FRAME.$model(function (){

                                                        var $queryTagsServer = this.server({
                                                            serverType:'api',
                                                            method:'POST',
                                                            url:'deleteTags'
                                                        }).receive(function (res) {
                                                            customerSystem.splice(key,1)


                                                        }.bind(this)).send({
                                                            "id" : queryTagsId
                                                        });
                                                    });

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
                    }

                    customerSystem.push(listBtn)
                })

                typeof callback === 'function' && callback(customerSystem);
            }.bind(this)).send({
                "viewId": viewId
            });
        });
        return customerSystem
    }
});




