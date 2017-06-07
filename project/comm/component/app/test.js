/**
 * Created by xiyuan on 17-6-4.
 */
test(function ($app) {

    //列表组件
    $app.component('test', {
        props: {
            config: {
                key:'yyy',
                type: Object,
                autoRender: true,
            },
        },
        isReplace: true,
        render:function (vnode, scope) {
            var div=document.createElement('div');

            console.log(scope)

            div.innerHTML='uuu'+scope.yyy;
            return div

        }
    })

})
