/**
 * Created by xiyuan on 17-5-30.
 */
sys(function ($app,$innerConfig) {

    var rootPath=$innerConfig.rootPath,
        appPath=rootPath+'/project';

    /*应用路径配置*/
    $app.path({
        'APP':appPath,
        'DEMO':appPath+'/demo',
        'HOME':appPath+'/home',
        'COMM':rootPath+'/comm',
        'TOOLS':rootPath+'/comm/tools',
        'PLUGINS':rootPath+'/desktop/plugins'
    });
})