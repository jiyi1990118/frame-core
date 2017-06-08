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

            // vnode.elm.addEventListener(this.expInfo.type,scope.on,false)

            vnode.data.on=vnode.data.on||{};

            vnode.data.on[this.expInfo.type]=[scope.on,function () {
                console.log(this)
            }];

            // this.update(vnode);

            // console.log(scope,vnode.elm)
            return vnode;
        }
    });

})