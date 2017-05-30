/**
 * Created by xiyuan on 17-5-30.
 */
route(function ($appConf) {

    $appConf.route('home',{
        presenter: 'appHome@index',
        view: function ($view) {
            $view({
                layout:'',
                suffix: 'tpl',
                requireType: 'ajax'
            });
            return 'appHome@index:index'
        }
    },function ($route) {

        $route.when('login',{
            controller: 'appHome@index:login',
            view: 'appHome@index:login'
        }).when('help',{
            controller: 'appHome@index:help',
            view: 'appHome@index:help'
        }).when('reg',{
            controller: 'appHome@index:reg',
            view: 'appHome@index:reg'
        });

        //自动路由
        $route.autoRoute('appHome');
    })

})