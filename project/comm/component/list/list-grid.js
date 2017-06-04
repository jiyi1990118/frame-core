/**
 * Created by xiyuan on 17-6-4.
 */
listGrid(function ($app) {

    //列表组件
    $app.component('list-grid', {
        template: '<div class="grid"><strong>grid{{gridConf}}</strong>dsfsdf</div><p>o::::</p>',
        props: {
            conf: {
                key: 'gridConf',
                type: Object,
                // default: {},
                watch: function () {

                },
                autoRender: true
            },
        },
        isReplace: true,
        data: function () {
            var sortOrders = {}
            this.columns.forEach(function (key) {
                sortOrders[key] = 1
            })
            return {
                sortKey: '',
                sortOrders: sortOrders
            }
        },
        filters: {},
        hook: {
            init: function () {

            },
            create: function () {

            },
            destroy: function () {

            }
        },
        render:function () {







        }
    })

})
