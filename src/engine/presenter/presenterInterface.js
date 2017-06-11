/**
 * Created by xiyuan on 16-5-17.
 */

"use strict";

//唯一标识生成
var uid=require('../../inside/lib/encrypt/uid');

var viewEngine=require('../view/exports');

var commData=require('../../inside/config/lib/commData');

var destroyMP=require('../../inside/source/destroyMP');

var layoutEngine=require('../layout/index');

var modelEngine=require('../model/index');

var sourcePathNormal=require('../../inside/source/sourcePathNormal');

var appConf=commData.appConf;

var mvpRecord=commData.mvpRecord;

//调度器存储器
var presenterSource=commData.presenterSource;

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
 * @param info
 * @param view
 */
function presenterInterface(info,view) {
    //调度器数据存储
    presenterSource[this.__sourceId__=uid()]={
        //存储视图分配的数据
        assign: {},
        assignReal:{},
        filter:{},
        animate: null,
        view: view,
        display: false,
        info: info
    };

    //检查当前的presenter类型 并记录
    if(info.isLayout){
        info.originType='layout';
        mvpRecord.lp.push(this);
    }else{

        //当前是主presenter （此处需销毁之前的相关数据）
        if(mvpRecord.p){
            //销毁之前页面的presenter
            destroyMP.destroyPresenter(mvpRecord.p);

            //销毁model
            mvpRecord.m.forEach(function (model) {
                destroyMP.destroyModel(model);
            });

            mvpRecord.m=[];
        }

        //标识当前资源类型
        mvpRecord.p=this;
        info.originType='presenter';
    }

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
    var source=presenterSource[this.__sourceId__];

    //检查资源是否存在/销毁
    if(!source)return;

    //检查此key之前是否存在model数据类型中
    if(source.assignReal[key] ){

        //检查与当前数据是否同源，否则移除监听
        if(source.assignReal[key] !== val){
            source.assignReal[key].unWatch()
        }else{
            return this;
        }
    }

    //检查当前数据是否model数据
    if(val instanceof modelEngine.modelExample){

        //记录到assign真实数据中
        source.assignReal[key]=val;

        val.watch(function (resData) {
            source.assign[key]=resData;
        },true)

    }else{
        source.assign[key]=val;
    }
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
presenterInterface.prototype.layout = function (layoutPath) {
    var source=presenterSource[this.__sourceId__];
    if(source.info.isLayout)return;
    //标识使用layout
    source.useLayout=true;
    //layout渲染
    layoutEngine.layout(layoutPath,source.info,presenterExec);
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
    }else if(source.view instanceof Object){
        Object.keys(source).forEach(function (key) {
            viewInfo[key]=source[key];
        });
    }

    //格式化视图模板后缀
    viewInfo.tplSuffix='.'+viewInfo.tplSuffix.replace(/^\./,'');

    //视图资源请求
    viewEngine.viewSourc(viewInfo, source.info ,function (viewSource) {
        //结合layout来渲染
        layoutEngine.display(viewSource,source);
    });
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
    var source=presenterSource[this.__sourceId__];
    var pathInfo=sourcePathNormal(modelPath,source.info,'model');
    return new modelEngine.modelExample(pathInfo);
};

/**
 * 调度执行
 * @param source
 * @param sourceInfo
 * @param pathInfo
 * @param view
 */
function presenterExec(source,sourceInfo,pathInfo,view) {
    var calle=source[0];
    if(!source){
        log.error('presenter ['+  sourceInfo.url +']中缺失'+sourceInfo.slice+'操作(切片)');
        return;
    }

    if(source.length > 1){
        calle=source[1];
    }

    //调度器执行
    calle.call(new presenterInterface({
        //是否布局
        isLayout:sourceInfo.isLayout,
        //参数
        parameter:pathInfo.parameter,
        //当前模块
        module:sourceInfo.module,
        //当前操作(切片)
        slice:sourceInfo.slice,
        //当前资源地址
        url:sourceInfo.url,
        //当前资源路径(不包含文件 module路径、mode类型目录、文件module后缀、文件后缀)
        pathName:sourceInfo.pathName,
        //资源来源地址
        origin:sourceInfo.origin,
        mode:'presenter'
    },view));
}

module.exports={
    presenterExec:presenterExec,
    interface:presenterInterface
};





