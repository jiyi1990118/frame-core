/**
 * Created by xiyuan on 17-6-5.
 */
projectPath(function ($app,$innerConfig) {

    $app.custom({
        PROJECT_PATH:{
            config:$innerConfig.projectPath+'/config',
            serverData:$innerConfig.projectPath+'/serverData'
        }
    })
})