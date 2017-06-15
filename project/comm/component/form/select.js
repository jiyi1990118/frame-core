/**
 * Created by xiyuan on 17-6-13.
 */

select(function ($app) {

    $app.component('select', ['PLUGINS/form/selectize:selectize','PLUGINS/comm/jquery'], function ($,j) {

        return {
            props: {
                conf: {
                    key: 'conf',
                    type: Object,
                    watch: function (newVal) {
                        console.log(newVal)
                    },
                    autoRender: true
                }
            },
            hook: {
                create: function (oldVnode, newVnode) {
                    console.log(newVnode, 'yes+++++')

                    /*selectize(ele,{
                     persist: false,
                     createOnBlur: true,
                     create: true
                     })*/
                }
            },
            isReplace: true,
            render: function (vnode, scope) {
                var ele = document.createElement('select');
                ele.multiple=true;
                ele.innerHTML = scope.conf.reduce(function (str, val) {
                    str += '<option>' + val + '</option>';
                    return str;
                }, '')

                setTimeout(function () {
                    $(ele).selectize({
                        persist: false,
                        createOnBlur: true,
                        create: true
                    })

                }, 100)

                return ele;
            }
        }
    })


})