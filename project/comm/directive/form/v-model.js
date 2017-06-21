/**
 * Created by xiyuan on 17-6-14.
 */

vModel(function ($app) {

    $app.directive('v-model',{
        props: function (exp) {
            return {
                exp:exp,
                key:'modelVal',
                isExports:true,
                watch:function (val) {
                    if(this.stroage.val !== val){
                        if(this.vnode.elm){
                            this.vnode.elm.value=val;
                        }
                        this.stroage.val = val;
                    }
                }
            }
        },
        hook: {
            insert: function (vnode) {
                var api=this;
                vnode.addEventListener('input',function () {
                    api.exports('modelVal',this.value);
                })
            }
        }

    })

})
