/**
 * Created by xiyuan on 17-6-12.
 */
vIf(function ($app) {

    $app.directive('v-if',{
        props: function (exp) {

            var vnode=this.vnode;
            return {
                exp:exp,
                key:'isShow',
                default: true,
                watch:function (data) {
                    data?vnode.show():vnode.hide();
                }
            }


        }

    })

})