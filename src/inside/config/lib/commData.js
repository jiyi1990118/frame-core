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
    routeList:[]
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
        //模型目录名称
        moduleDirName:{
            view: 'view',
            presenter: 'presenter',
            model: 'model'
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
    pathList:[],
    //视图模板后缀
    tplSuffix:'.html',
    //默认视图请求方式
    viewRequire:'ajax'
};

//内部配置
function innerConf(arg1,agr2) {
    if(arguments.length === 1 ){
        if(arg1 instanceof Object){
            Object.keys(arg1).forEach(function (key) {
                innerConf[key]=arg1[key];
            })
        }else{
            return innerConf[key];
        }
    }else if(arguments.length === 2 ){
        if(typeof arg1 === 'string'){
            innerConf[arg1]=agr2;
        }
    }
}

module.exports={
    appConf:appConf,
    stateData:stateData,
    insideConf:insideConf,
    innerConf:innerConf
}