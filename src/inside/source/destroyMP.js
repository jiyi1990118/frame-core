/**
 * Created by xiyuan on 17-6-11.
 */

var commData=require('../../inside/config/lib/commData');

//调度器存储器
var presenterSource=commData.presenterSource;

/**
 * presenter销毁
 * @param presenter
 */
function destroyPresenter(presenter) {
    var source=presenterSource[presenter.__sourceId__];

    //销毁presenter数据资源记录
    delete presenterSource[presenter.__sourceId__];

    ['assign','filter','assignReal','info'].forEach(function (type) {
        //销毁数据
        Object.keys(source[type]).forEach(function (key) {
            delete source[type][key];
        });
    });

    //销毁当前presenter数据
    Object.keys(source).forEach(function (key) {
        delete source[key];
    });
}

/**
 * model销毁
 * @param model
 */
function destroyModel(model) {

    var Interface=model.interface,
        source=Interface.__source__;

    delete Interface.exports;

    //销毁触发器
    Object.keys(source.trigger).forEach(function (key) {
        delete source.trigger[key];
    });

    //销毁数据通道
    source.observer.destroy();

    //销毁内部server
    source.server.forEach(function (server) {
        server.destroy();
    })

    //销毁资源
    Object.keys(source).forEach(function (key) {
        delete source[key];
    });

    //销毁资源
    Object.keys(Interface).forEach(function (key) {
        delete Interface[key];
    });



}

module.exports={
    destroyModel:destroyModel,
    destroyPresenter:destroyPresenter
}