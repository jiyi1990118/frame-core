/**
 * Created by xiyuan on 17-5-30.
 */
route(function ($appConf) {

    $appConf.route('home',{
        presenter: 'HOME@index',
        view: function ($view,parameter) {
            $view({
                tplSuffix: 'html',
                requireType: 'ajax'
            });
            return 'HOME@index:index'
        },
        suffix:'java'
    },function ($route) {

        $route.when(['login{id}',{id:/\d+/}],{
            controller: 'appHome@index:login',
            view: 'appHome@index:login'
        }).when('help',{
            controller: 'appHome@index:help',
            view: 'appHome@index:help'
        }).when(/reg/,{
            controller: 'appHome@index:reg',
            view: 'appHome@index:reg'
        });

        //自动路由
        $route.autoRoute({
            presenter: 'HOME',
            view: 'HOME',
            suffix:'html'
        })
    });

    $appConf.route('demo',function ($route) {
        //自动路由
        $route.autoRoute({
            presenter: 'DEMO',
            view: 'DEMO',
            suffix:'html'
        })
    })


})