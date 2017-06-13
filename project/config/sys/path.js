/**
 * Created by xiyuan on 17-5-30.
 */
sys(function ($app,$innerConfig) {

    var appPath=$innerConfig.appPath;
    var projectPath=$innerConfig.projectPath;

    /*应用路径配置*/
    $app.path({
        'APP':appPath,
        'DEMO':appPath+'/demo',
        'HOME':appPath+'/home',
        'COMM':projectPath+'/comm',
        'TOOLS':projectPath+'/comm/tools',
        'PLUGINS':projectPath+'/comm/plugins'
    });
})