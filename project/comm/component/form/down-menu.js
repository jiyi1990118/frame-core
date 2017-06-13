/**
 * Created by xiyuan on 17-6-12.
 */
downMenu(function ($app) {

    $app.component('down-menu',{
        props: {
            conf: {
                key: 'conf',
                type: Object,
                default: {},
                autoRender: true
            }
        },
        isReplace: true,
        template:'<select><option v-for="val in conf">{{val}}</option></select>',
        render:function (vnode,scope) {
            // return this.template;
        }
    })


})