/**
 * Created by xiyuan on 17-6-19.
 */

inputType(function ($app) {

    $app.directive('type',['PLUGINS/form/jscolor.js','PLUGINS/form/layDate.js'],function (jscolor,layDate) {
        return {
            props: function (exp) {
                //还原属性（指令渲染后会移除对应的指令属性）
                this.vnode.setAttr('type',exp);
                return []
            },
            hook: {
                insert: function (newVnode) {

                    //input 类型检查
                    if(newVnode.tag !== 'input')return

                    var expInfo=this.expInfo;

                    switch (expInfo.value){
                        //取色器
                        case 'color':
                            newVnode.setAttr('type','text');
                            newVnode.setAttr('value',newVnode.getAttr('value')||'white');
                            newVnode.addClass('jscolor');
                            break;
                        //日期组件
                        case 'date':
                            newVnode.setAttr('type','text');
                            var lay=document.getElementById('laydate_box');
                            if(lay)lay.parentNode.removeChild(lay);

                            layDate({elem:newVnode.elm});
                            break;
                    }

                }
            }

        }

    })

})