/**
 * Created by xiyuan on 17-6-13.
 */

select(function ($app) {

    function dataConversion(selectData,api,$) {
        var vnode=api.vnode,
            selectHtml='';

        var selectOption={
            placeholder:selectData?selectData.placeholder:'',
        };

        //检查是否有数据
        if(!selectData){
            if(vnode.elm){
                api.stroage.plugins = $(vnode.elm).chosen(selectOption);
            }
            return
        }

        //数据拼接
        selectData.name && vnode.setAttr('name',selectData.name);
        selectData.multiple && vnode.setAttr('multiple',selectData.multiple);
        selectData.placeholder && vnode.setAttr('data-placeholder',selectData.placeholder)

        selectData.dataList.forEach(function (optionData,index) {

            if(optionData.list){
                selectHtml+='<optgroup label="'+(optionData.label||optionData.content)+'">';

                optionData.list.forEach(function (optionInfo) {
                    selectHtml+='<option '+(optionInfo.selected?'selectd ':'')+'value="'+optionInfo.value+'" '+(optionInfo.disabled?'disabled':'')+'>'+optionInfo.content+'</option>'
                })
                selectHtml+='</optgroup>';
            }else{
                selectHtml+='<option '+(optionData.selected?'selectd ':'')+'value="'+optionData.value+'" '+(optionData.disabled?'disabled':'')+'>'+optionData.content+'</option>'
            }
        });

        if(vnode.elm){
            //更改内部选项
            vnode.elm.innerHTML=selectHtml;
            //检查是否更新或初始化
            api.stroage.plugins? api.stroage.plugins.trigger("chosen:updated"):api.stroage.plugins = $(vnode.elm).chosen(selectOption);
            //绑定事件
            if(selectData.change) api.stroage.plugins.on('change',selectData.change);
        }
    }

    $app.component('select', ['PLUGINS/form/chosen.jquery.js'], function ($) {
        return {
            props: {
                config: {
                    key: 'conf',
                    type: Object,
                    watch: function (selectData) {
                        //数据提取
                        dataConversion(selectData, this,$);
                    },
                    isEmpty: true
                }
            },
            hook: {
                insert: function (newVnode) {
                    //数据提取
                    dataConversion(this.scope.conf,this,$);
                },
                destroy: function (vnode, v) {
                    //元素销毁移除下拉真实元素
                    this.stroage.plugins.chosen("destroy");
                }
            },
            isReplace: false
        }
    })


})