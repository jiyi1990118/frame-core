/**
 * Created by xiyuan on 17-6-13.
 */

select(function ($app) {

    $app.component('select', ['PLUGINS/form/selectize:selectize', 'PLUGINS/comm/jquery'], function ($, j) {

        return {
            props: {
                config: {
                    key: 'conf',
                    type: Object,
                    watch:function (selectData) {
                        //数据提取
                        console.log( selectData,this.vnode);

                    },
                    isEmpty:true
                }
            },
            hook: {
                insert: function (newVnode) {


                    //保存当前select插件实例
                    var select=this.stroage.selectize = $(newVnode.elm).selectize({
                        persist: false,
                        createOnBlur: true,
                        create: false,
                        optgroupField: 'group',
                        optgroupLabelField: 'label',
                        options: [
                            {value: 'avenger', group: 'dodge', text: 'Avenger'},
                            {value: 'caliber', group: 'dodge', text: 'Caliber'},
                            {value: 'caravan-grand-passenger', group: 'dodge', text: 'Caravan Grand Passenger'},
                            {value: 'challenger', group: 'dodge', text: 'Challenger'},
                            {value: 'ram-1500', group: 'dodge', text: 'Ram 1500'},
                            {value: 'viper', group: 'dodge', text: 'Viper'},
                            {value: 'a3', group: 'audi', text: 'A3'},
                            {value: 'a6', group: 'audi', text: 'A6'},
                            {value: 'r8', group: 'audi', text: 'R8'},
                            {value: 'rs-4', group: 'audi', text: 'RS 4'},
                            {value: 's4', group: 'audi', text: 'S4'},
                            {value: 's8', group: 'audi', text: 'S8'},
                            {value: 'tt', group: 'audi', text: 'TT'},
                            {value: 'avalanche', group: 'chevrolet', text: 'Avalanche'},
                            {value: 'aveo', group: 'chevrolet', text: 'Aveo'},
                            {value: 'cobalt', group: 'chevrolet', text: 'Cobalt'},
                            {value: 'silverado', group: 'chevrolet', text: 'Silverado'},
                            {value: 'suburban', group: 'chevrolet', text: 'Suburban'},
                            {value: 'tahoe', group: 'chevrolet', text: 'Tahoe'},
                            {value: 'trail-blazer', group: 'chevrolet', text: 'TrailBlazer'},
                        ],
                        optgroups: [
                            {value: 'dodge', label: 'Dodge'},
                            {value: 'audi', label: 'Audi'},
                            {value: 'chevrolet', label: 'Chevrolet'}
                        ],
                    })[0].selectize;


                    setTimeout(function () {
                        select.clearOptions();
                        select.clearOptionGroups();
                    },3000)



                },
                destroy:function (vnode,v) {
                    //元素销毁移除下拉真实元素
                    this.stroage.selectize.destroy()
                }
            },
            isReplace: false,
            render: function (vnode, scope) {
                if(vnode.elm){
                    this.stroage.selectize
                };
            }
        }
    })


})