
/**
 * 主配置文件
 * $app 配置对象
 * $appConfig 配置文件的自定义配置(以备通用的变量定义)
 */
config(function($app,$appConfig){

    $app.include({
        sys:'./sys/path.js',
        route:'./route/defulat.js'
    })

});

config('as',function($app,$appConfig){

})