/**
 *Created by lei on 17-2-8.
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

 //根据查询系统标签(C08002)来将数据动态渲染
extend(function () {
    //参数:
          // 1、callback    回调函数
    return function (model,gridApi,callback) {

        var This=model,
            viewId = $_GET['viewId'];
        var btnSystem = $FRAME.$model(function () {
            
         
            var $idServer = this.server({
                    serverType:'api',
                    method:'POST',
                    url:'systemSearch'
                }).receive(function (data) {
                    
                    var btnGroupsSystem = [],
                        self = this;
                    
                    data.data.forEach(function(res){
                        tagId = res.id

                        var listBtn ={
                            class:'btn btn-sapphire-blue', //【必填项】按钮样式   宝蓝色
                            icon:'', //【非必填项】图标
                            label:res.tagName,//【必填项】按钮文字
                            align:'center',//【必填项】文字居中
                            padding:'7px 14px',  //【必填项】按钮内边距，可以控制按钮大小
                            events:{
                                click:function (event) {

                                    //使用查询标签下的 真实数据分页
                                    $gridApi=gridApi.get();

                                    $gridApi.sendData({
                                        "viewId":viewId,    //暂时写死 应为res.viewId
                                        "currentPage":1,
                                        "pageSize":20,
                                        "sidx":"id",
                                        "order":"desc",
                                        "tagId":tagId,      //目前写死，应该是上面的tagId
                                        "fuzzyQueryVal":''
                                    },false);
                                    $gridApi.update();

                                }
                            }
                        }

                        btnGroupsSystem.push(listBtn)
                    })

                typeof callback === 'function' && callback(btnGroupsSystem);
             }.bind(this)).send({
                "viewId": viewId       //目前写死，应该是上面传参里的viewId
            });
        });
        return btnSystem
    }
});

