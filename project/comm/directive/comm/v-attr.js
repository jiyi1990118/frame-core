/**
 * Created by xiyuan on 17-6-14.
 */
vAttr(function ($app) {

    $app.directive('v-attr',{
        props: function (exp,expInfo) {
            var vnode=this.vnode;
            return {
                exp:exp,
                key:expInfo.type,
                default: '',
                watch:function (data) {
                    vnode.setAttr(expInfo.type,data);
                }
            }
        }

    })

})