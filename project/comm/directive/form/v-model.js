/**
 * Created by xiyuan on 17-6-14.
 */

vModel(function ($app) {

    $app.directive('v-model',{
        props: function (exp) {
            console.log(exp);
            return {
                exp:exp,
                key:'class',
                default:'',
                watch:function () {

                }
            }
        },
        hook: {
            create: function (oldVnode,newVnode) {
                console.log('----',this)

                var api=this;
                newVnode.addEventListener('input',function () {
                    console.log(this.value)
                    api.exports('')
                })
            }
        }

    })

})
