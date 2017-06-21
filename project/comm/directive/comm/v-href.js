/**
 * Created by xiyuan on 17-6-14.
 */
vHref(function ($app) {

    $app.directive('v-href',{
        props: function (exp) {
            var vnode=this.vnode;
            return {
                exp:exp,
                key:'href',
                watch:function (data) {
                    vnode.setAttr('href',data);
                }
            }
        }

    })

})