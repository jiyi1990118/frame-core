/**
 * Created by xiyuan on 17-5-30.
 */
sys(function ($app,$innerConfig) {

    var rootPath=$innerConfig.rootPath;

    /*应用路径配置*/
    $app.path({
        'APP':rootPath+'/app',
        'DEMO':rootPath+'/app/demo',
        'HOME':rootPath+'/app/home',
        'COMM':rootPath+'/comm',
        'TOOLS':rootPath+'/comm/tools',
        'PLUGINS':rootPath+'/desktop/plugins'
    });
})