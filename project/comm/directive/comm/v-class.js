/**
 * Created by xiyuan on 17-6-12.
 */
vClass(function ($app) {

    $app.directive('v-class',{
        props: function (exp) {

            this.stroage=[];
            var This=this,
                vnode=this.vnode;

            return {
                exp:exp,
                key:'class',
                default: {},
                watch:function (data) {
                    var classList=Object.keys(data).reduce(function (list,key) {
                        if(data[key]){
                            list.push(key);
                            var location=This.stroage.indexOf(key);
                            if(location !== -1){
                                This.stroage.splice(location,1);
                            }
                        };
                        return list;
                    },[]);

                    vnode.removeClass(This.stroage);
                    vnode.addClass(classList);

                    This.stroage=classList;

                }
            }
        }

    })

})