/**
 * Created by xiyuan on 17-6-19.
 */

inputType(function ($app) {
    var vf=this;

    //图标选择组件
    function iconsRender(vnode, tools) {

        var showEle=document.createElement('div');
        showEle.className="input-icon";

        showEle.innerHTML='<div class="icon-container"><i class="default"></i></div>'

        //里面的小图标(根据选择的图标而变动)
        var iEle = showEle.querySelector('i');
        vnode.type = 'hidden';
        vnode.value && (iEle.className = "iconfont icon-" + vnode.value);
        vnode.parentNode.replaceChild(showEle, vnode);
        showEle.appendChild(vnode);

        //设置展示的文本框只读
        vnode.setAttribute('readOnly', '');
        showEle.addEventListener('click', function () {
            var scope,
                iconName = vnode.value;

            tools.$dialog({
                title: '图标选择',
                maxmin: true,
                content: '<list-icon api="iconApi"></list-icon>',
                scope: scope={
                    iconApi:{}
                },
                filter: {},
                height: '360px',
                width: '600px',
                btns: [
                    {
                        name: '确定',
                        trigger: function (eve, interface) {
                            vnode.value = iconName;
                            vnode.dispatchEvent(new Event('change'));
                            iEle.className = "iconfont icon-" + scope.iconApi.selectIcon;
                            iconName && (iEle.innerHTML = "");
                            interface.close();
                        }
                    },
                    {
                        name: '取消',
                        theme: "warning", //[ primary , success , info , warning , danger ]
                        trigger: function (eve, interface) {
                            interface.close();
                        }
                    }
                ]
            })
        });
    }

    $app.directive('type',['PLUGINS/form/jscolor.js','PLUGINS/form/layDate.js','PLUGINS/modal/dialog.js'],function (jscolor,layDate,dialog) {
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

                    var lay,
                        expInfo=this.expInfo;

                    switch (expInfo.value){
                        //取色器
                        case 'color':
                            newVnode.setAttr('type','text');
                            newVnode.setAttr('value',newVnode.getAttr('value')||'white');
                            new jscolor(newVnode.elm);
                            break;
                        //日期组件
                        case 'datetime':
                            newVnode.setAttr('type','text');
                            lay=document.getElementById('laydate_box');
                            if(lay)lay.parentNode.removeChild(lay);
                            layDate({elem:newVnode.elm,format: 'YYYY-MM-DD hh:mm:ss',istime: true});
                            break;
                        case 'date':
                            newVnode.setAttr('type','text');
                            lay=document.getElementById('laydate_box');
                            if(lay)lay.parentNode.removeChild(lay);
                            layDate({elem:newVnode.elm,format: 'YYYY-MM-DD',istime: false,});
                            break;
                        case 'time':
                            newVnode.setAttr('type','text');
                            lay=document.getElementById('laydate_box');
                            if(lay)lay.parentNode.removeChild(lay);
                            lay=layDate({elem:newVnode.elm,format: 'YYYY-MM-DD hh:mm:ss',istime: true,});
                            break;
                        //图标样式选择组件
                        case 'icons':
                            newVnode.setAttr('type','text');
                            iconsRender(newVnode.elm,{$dialog:dialog});
                            break;
                    }

                }
            }

        }

    })

})