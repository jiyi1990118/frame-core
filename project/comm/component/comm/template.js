/**
 * Created by xiyuan on 17-6-4.
 */
template(function ($app) {

    //列表组件
    $app.component('template', {
        props: {
            config: {
                key: 'templateConf',
                type: Object,
                autoRender: true
            },
        },
        isReplace: true,
        render:function (vnode, scope) {
            var templateConf=scope.templateConf||{};

            return this.render(templateConf.template||'',templateConf.scope||{},templateConf.filter);
        }
    })

})
