
/**
 * 主配置文件
 * $app 配置对象
 * $appConfig 配置文件的自定义配置(以备通用的变量定义)
 */
config(function($app,$innerConfig){

    var rootPath=location.pathname.match(/[^?#]*\//)[0];

    //设置配置内部配置
    $innerConfig({
        rootPath:rootPath,
        projectPath:rootPath+'/project',
        appPath:rootPath+'/project/app'
    });

    //引入其他资源
    $app.include({
        sys:'./sys/path.js',
        route:'./route/defulat.js',
        devCustom:'./custom/dev.js',
        proCustom:'./custom/pro.js',
        apiMap:'./custom/apiMap.js',
        projectPath:'./custom/projectPath.js',
        server:'../comm/server/index.js',
        directive:'../comm/directive/index.js',
        components:'../comm/component/index.js'
    });

    //加载配置模式
    $app.loadConfMode('pro');

});


config(function($app,$innerConfig){

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