/**
 * Created by xiyuan on 17-5-29.
 */


//状态数据
var stateData={
    isConf:false,
    nowUrl:'',
    fileLength:0
};

//框架内部配置
var insideConf={

}

//配置
var appConf={
    //框架系统配置
    system:{
        //文件回调
        fileCallback:{
            model:'model',
            view:'view',
            presenter:'presenter'
        },
        //文件后缀标识
        fileSuffix:{
            view: 'view',
            presenter: 'presenter',
            model: 'model'
        },
        //默认的视图或调度器器及模型 /切片
        default:{
            view:'index',
            model:'index',
            presenter:'index',
            viewSlice:'index',
            modelSlice:'index',
            presenterSlice:'index'
        }
    },
    route:{
        //路由模式
        mode:'hash',
        //路由后缀
        suffix:'',
    },
    //视图模板后缀
    tplSuffix:'html',
    //默认视图请求方式
    viewRequire:'ajax'
};

module.exports={
    appConf:appConf,
    stateData:stateData,
    insideConf:insideConf
}