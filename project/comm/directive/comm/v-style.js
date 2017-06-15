/**
 * Created by xiyuan on 17-6-12.
 */
vStyle(function ($app) {

    $app.directive('v-style',{
        props: function (exp) {
            var This=this,
                vnode=this.vnode;

            return {
                exp:exp,
                key:'style',
                default: {},
                watch:function (data) {
                    vnode.css(data);
                }
            }
        }

    })

})