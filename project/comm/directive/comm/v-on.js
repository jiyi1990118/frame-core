/**
 * Created by xiyuan on 17-6-5.
 */
vOn(function ($app) {

    $app.directive('v-on', {
        priority:100,
        //属性作用域
        props: function (expStr,expInfo) {
            var vnode=this.vnode,
                oldEventFn;

            return [
                {
                    exp:expStr,
                    key:'eventFn',
                    watch:function (newEventFn) {
                        vnode.removeListener(expInfo.type||'click',oldEventFn,false);
                        vnode.addEventListener(expInfo.type||'click',oldEventFn=newEventFn,false);
                    }
                }
            ]
        }
    });

})