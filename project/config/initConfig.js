
/**
 * 主配置文件
 * $app 配置对象
 * $appConfig 配置文件的自定义配置(以备通用的变量定义)
 */
config(function($app,$innerConfig){

    //设置配置内部配置
    $innerConfig({
        rootPath:location.pathname
    });

    console.log(vf)

    $app.include({
        sys:'./sys/path.js',
        route:'./route/defulat.js'
    })

});


config('sys',function($app,$innerConfig){

    /*路由模式 【  hash 与  html5 】默认hash */
    $app.routeMode('hash');

    /*路由后缀 默认空*/
    $app.routeSuffix('.vf');

    /*视图模板后缀 默认html*/
    $app.tplSuffix('.html');

    //默认的路由
    $app.defaultUrl('home/index');

    /*视图请求方式 【 ajax 与 jsonp 】 默认ajax*/
    $app.viewRequire('ajax');

    //设置系统参数
    $app.system({
        //文件后缀标识
        fileSuffix:{
            view: '.view',
            presenter: '.presenter',
            model: '.model'
        }
    })
})