/**
 * Created by xiyuan on 17-6-5.
 */
$on(function ($app) {

    $app.directive('$-on', {
        priority:100,
        //属性作用域
        props: function (expStr) {

            // console.log(arguments,this)
            return [
                {
                    key:'on',
                    exp:expStr,
                    type:[Array,Object],
                    // autoRender:true
                }
            ]
        },
        render: function (vnode, scope) {

            vnode.data.on=vnode.data.on||{};

            vnode.data.on[this.expInfo.type]=scope.on;

            return vnode;
        }
    });

})