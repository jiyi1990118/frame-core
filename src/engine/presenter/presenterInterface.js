/**
 * Created by xiyuan on 16-5-17.
 */

//唯一标识生成
var uid=require('../../inside/lib/encrypt/uid');

var viewEngine=require('../view/exports');

var appConf=require('../../inside/config/lib/commData').appConf;

//调度器存储器
var presenterSource={};

/**
 * 数据属性设置
 * @param obj
 * @param key
 */
function def(obj, key, val, enumerable) {
    var conf = {
        writable: true,
        configurable: true,
        enumerable: !!enumerable
    };
    typeof val !== 'undefined' && (conf['value'] = val);
    Object.defineProperty(obj, key, conf);
}

/**
 * 调度器接口(调度器的实现)
 * @param parameter
 * @param info
 */
function presenterInterface(info,view) {
    //调度器数据存储
    presenterSource[this.__sourceId__=uid()]={
        //存储视图分配的数据
        assign: {},
        filter:{},
        layout: null,
        animate: null,
        view: view,
        display: false,
        layoutSource:null,
        eleStorage:{
            tpls:[],
            blocks:{}
        },
        info: info
    };

    //设置资源id不可写
    def(this, '__sourceId__');
}

/**
 * 页面标题设置
 * @param title
 * @returns {String}
 */
presenterInterface.prototype.title = function (title) {
    if (title) {
        window.document.title = title;
        presenterSource[this.__sourceId__].title=title;
    }
    return this;
};

/**
 * 视图数据分配
 * @param key
 * @param val
 * @returns {presenterInterface}
 */
presenterInterface.prototype.assign = function (key, val) {
    presenterSource[this.__sourceId__].assign[key]=val;
    return this;
};

/**
 * 过滤器
 * @param filterName
 * @param fn
 * @returns {*}
 */
presenterInterface.prototype.filter = function (filterName, fn) {
    presenterSource[this.__sourceId__].filter[filterName]=fn;
    return this;
};

/**
 * 控制器继承 第一个参数是控制器路径  之后参数都是需要传递的参数
 * @param presenter
 * @returns {presenterInterface}
 */
presenterInterface.prototype.extend = function (presenter) {
    var args = arguments, i = 0, l = args.length,
        parameter = [];

    while (++i < l) {
        parameter.push(args[i]);
    }


    return this;
};

/**
 * 页面布局
 * @param layoutPath
 * @returns {presenterInterface}
 */
presenterInterface.prototype.layout = function (layoutPath,layoutpresenter,layoutSuffix) {
    if(!layoutPath || typeof layoutPath !== 'string')return this;

    var source=presenterSource[this.__sourceId__];
    source.layout=layoutPath;
    layoutSuffix = typeof layoutpresenter === 'string' && layoutpresenter;

    return this;
};

/**
 * 页面跳换动画模式
 * @param animate
 * @returns {presenterInterface}
 */
presenterInterface.prototype.animate = function (animate) {
    presenterSource[this.__sourceId__].animate = animate;
    return this;
};

/**
 * 页面展示
 * @param view
 * @returns {presenterInterface}
 */
presenterInterface.prototype.display = function (view) {
    var source=presenterSource[this.__sourceId__];

    //检查页面是否需要渲染
    if (view === false || source.display) {
        source.display = true;
        return;
    } else if(view){
        source.view = view;
    }
    //标识页面已渲染
    source.display = true;
    
    var viewInfo={
        tplSuffix: appConf.tplSuffix,
        requireType: appConf.viewRequire,
        view:source.view
    };
    
    //解析视图参数
    if(source.view instanceof Function){
        view=source.view(function (conf) {
            Object.keys(conf).forEach(function (key) {
                viewInfo[key]=conf[key];
            });
        },source.info);

        if(view)viewInfo.view=view;
    }else if(source instanceof Object){
        Object.keys(source).forEach(function (key) {
            viewInfo[key]=source[key];
        });
    }

    viewInfo.tplSuffix='.'+viewInfo.tplSuffix.replace(/^\./,'');

    //视图资源请求
    viewEngine.viewSourc(viewInfo,source.info,function (viewSource) {
        console.log(viewSource);
    });

    //调用展示
    // viewEngine.html2vdom()



    return this;
};

/**
 * 页面重定向
 * @param pagePath
 * @returns {presenterInterface}
 */
presenterInterface.prototype.redirect = function (pagePath) {

    return this;
};

/**
 * 数据模型调用
 * @param modelPath
 * @returns {$modelInterface}
 */
presenterInterface.prototype.model = function (modelPath) {


};

module.exports=presenterInterface;





