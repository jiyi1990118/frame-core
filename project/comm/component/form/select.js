/**
 * Created by xiyuan on 17-6-13.
 */

select(function ($app) {

    $app.component('select-multi',['PLUGINS/test/a'],function (a) {

        return{
            props: {
                conf: {
                    key: 'conf',
                        type: Object,
                        watch:function (newVal) {
                        console.log(newVal)
                    },
                    autoRender: true
                }
            },
            isReplace: true,
                render:function (vnode,scope) {
                var ele=document.createElement('select');
                ele.innerHTML=scope.conf.reduce(function (str,val) {
                    str+='<option>'+val+'</option>';

                    return str;
                },'')
                // console.log($(ele).multiSelect())
                return ele;
            }
        }
    })



})