/**
 * Created by xiyuan on 17-6-11.
 */
test(function ($app) {

    $app.component('app-nav',['COMM/plugins/outerPlugins.js'], function (outerPlugins) {


        console.log('this is',outerPlugins);

        return {
            template:'<h3>testPlugins</h3>'
        }

    })


})