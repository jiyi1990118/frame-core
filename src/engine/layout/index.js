/**
 * Created by xiyuan on 17-6-2.
 */

var sourcePathNormal = require('../../inside/source/sourcePathNormal');
//资源获取
var getSource = require('../../inside/source/getSource');

var viewEngine = require('../../engine/view/exports');

var log = require('../../inside/log/log');

var domApi = viewEngine.vdom.domApi;

var destroyMP=require('../../inside/source/destroyMP');

//布局存储器
var layoutStroage = {
    //当前layout路径
    url: null,
    //当前layout虚拟节点
    vnode: null,
    //layout 主体
    main: null,
    //是否重复布局
    isRepeat: null,
    //当前presenter
    presenter: {},
    //当前layout块级
    blockMap: {}
}

//视图渲染
function render() {

    var pageContainer = document.body,
        oldPresenter=layoutStroage.presenter.vnode,
        emptyNode=viewEngine.vdom.node2vnode(pageContainer);

    //检查当前是否需要渲染布局
    if (layoutStroage.vnode) {

        //检查是否重复布局
        if (!layoutStroage.isRepeat) {

            //渲染页面布局
            viewEngine.vdom.patch(null, layoutStroage.vnode.vnode, layoutStroage.vnode.source, undefined, function (containerElm, replaceParent) {
                //元素替换
                pageContainer.innerHTML = '';
                pageContainer.appendChild(containerElm)
                replaceParent(pageContainer);
            });
        }
        pageContainer = layoutStroage.main;
    };

    //传递父节点信息给 presenter视图元素
    [].concat(layoutStroage.presenter.vnode).forEach(function (childVnode) {
        if(pageContainer.vnode){
            childVnode.parentVnode=pageContainer.vnode;
        }else{
            childVnode.parentVnode=emptyNode;
            emptyNode.children.push(childVnode);
        }

    });

    //渲染 presenter 视图
    viewEngine.vdom.patch(null, layoutStroage.presenter.vnode, layoutStroage.presenter.source, undefined, function (containerElm, replaceParent) {

        var location,
            mainElm,
            parentVnode = pageContainer.parentNode,
            presenterBlockMap = layoutStroage.presenter.source.layoutInfo.blockMap;

        //检查布局主体是否存在
        if (layoutStroage.vnode && layoutStroage.main) {

            //替换layout-block
            Object.keys(presenterBlockMap).forEach(function (key) {

                var blockElm,
                    location,
                    parentVnode,
                    layoutBlock = layoutStroage.blockMap[key],
                    presenterBlock = presenterBlockMap[key],
                    presenterParentNode = presenterBlock.parentNode || layoutStroage.presenter.vnode;

                //检查在layout中是否存在 对应的 block
                if (layoutBlock) {

                    blockElm = layoutBlock.vnode.elm[0];
                    //检查是否有父元素
                    if (parentVnode = layoutBlock.parentNode) {

                        location = parentVnode.children.indexOf(layoutBlock.vnode);
                        //更改layout-block子元素
                        [].splice.apply(parentVnode.children, [location, 1].concat(presenterBlock.vnode));

                        //插入presenter block 视图
                        domApi.insertBefore(blockElm.parentNode, presenterBlock.vnode.elm, blockElm)
                    }else{
                        //插入presenter block 视图
                        domApi.insertBefore(document.body, presenterBlock.vnode.elm, blockElm)
                    }

                    //销毁旧的 layout-block 元素
                    layoutBlock.vnode.destroy();

                    //移除presenter 视图中的站位
                    if (presenterParentNode instanceof Array) {
                        presenterParentNode.splice(presenterParentNode.indexOf(presenterBlock.vnode, 1));
                    }

                    //更换成新的layout-block元素
                    layoutStroage.blockMap[key]=presenterBlock;
                }
            });

            //获取layout-main 真实元素
            mainElm = [].concat(pageContainer.vnode.elm)[0];

            if (parentVnode) {
                //获取 layout-main 元素在父节点内部的位置
                location = parentVnode.children.indexOf(pageContainer.vnode);
                //更改layout-main元素的子元素
                ;[].splice.apply(parentVnode.children, [location, 1].concat(layoutStroage.presenter.vnode));
            }

            // console.log(mainElm.parentNode, containerElm, mainElm,pageContainer)
            //插入presenter 视图
            if(mainElm){
                domApi.insertBefore(mainElm.parentNode||document.body, containerElm, mainElm)
            }else{
                pageContainer.vnode.parentVnode.updateChildrenShow();
            }

            //销毁旧的 layout-main 子元素
            pageContainer.vnode.innerVnode.forEach(function (vnode) {
                vnode.destroy();
            });

            pageContainer.vnode.elm = [];
            pageContainer.vnode.children = [];
            pageContainer.vnode.innerVnode = [];

            //替换layout中的主体layout
            (layoutStroage.main.vnode.innerVnode = layoutStroage.main.vnode.innerVnode.concat(layoutStroage.presenter.vnode)).forEach(function (vnode) {
                pageContainer.vnode.elm = pageContainer.vnode.elm.concat(vnode.elm);
            });

        } else {
            pageContainer.innerHTML = '';
            pageContainer.appendChild(containerElm)
            replaceParent(pageContainer);
        }

    });


}

/**
 * presenter Layout 代理
 * @param layoutPath
 * @param originInfo
 * @param presenterExec
 */
function layout(layoutPath, originInfo, presenterExec) {
    //获取layout的路径信息
    var layoutPathInfo = sourcePathNormal(layoutPath, originInfo, 'presenter');

    if (layoutStroage.vnode) {

        //检查上一个页面layout与此次layout是否一致
        if (layoutPathInfo.url === layoutStroage.url) {
            layoutStroage.isRepeat = true;
            return;
        };

        //此处销毁上一个layout presenter资源
        mvpRecord.lp.forEach(function (presenter) {
            destroyMP.destroyPresenter(presenter);
        });

        //此处销毁上一个layout model
        mvpRecord.lm.forEach(function (model) {
            destroyMP.destroyModel(model);
        });

        mvpRecord.lp=[];
        mvpRecord.lm=[];

        //销毁旧布局的布局块级节点
        Object.keys(layoutStroage.blockMap).forEach(function (blockInfo) {
            blockInfo.vnode.destroy();
        });

        //销毁旧的布局
        layoutStroage.vnode.vnode.destroy();

        //销毁presenter虚拟节点
        if (layoutStroage.presenter) layoutStroage.presenter.vnode.destroy();
    }

    //清空之前标识
    layoutStroage.vnode = null;
    layoutStroage.blockMap = {};
    layoutStroage.isRepeat = null;
    layoutStroage.presenter = {};

    layoutStroage.url = layoutPathInfo.url;

    //获取layout相关presenter资源
    getSource(layoutPathInfo, {
        mode: 'presenter'
    }, function (source, info) {
        //标识当前调度器是layout
        info.isLayout = true;
        //调度器执行
        presenterExec(source, info, originInfo, layoutPath);
    });
}

/**
 * presenter display 代理
 * @param viewSource
 * @param presenterSource
 */
function display(viewSource, presenterSource) {
    var vnode = viewEngine.html2vdom(viewSource);

    //检查当前是否layout
    if (presenterSource.info.isLayout) {
        layoutStroage.vnode = {
            vnode: vnode,
            source: {
                scope: presenterSource.assign,
                filter: presenterSource.filter,
                layoutInfo: layoutStroage
            }
        }
        //检查 presenter 是否完全加载
        if (layoutStroage.presenter) render();
    } else {
        layoutStroage.oldPresenterVnode=layoutStroage.presenter.vnode;
        //记录当前资源
        layoutStroage.presenter = {
            vnode: vnode,
            source: {
                scope: presenterSource.assign,
                filter: presenterSource.filter,
                layoutInfo: {
                    blockMap: {}
                }
            }
        };

        if (presenterSource.useLayout) {
            //检查当前layout是否加载完毕
            if (!layoutStroage.vnode)return;
        } else {

            //检查是否存在布局信息 并销毁
            if (layoutStroage.vnode) {
                //销毁旧布局的布局块级节点
                Object.keys(layoutStroage.blockMap).forEach(function (key) {
                    layoutStroage.blockMap[key].vnode.destroy();
                });

                //销毁旧的布局
                [].concat(layoutStroage.vnode.vnode).forEach(function (vnode) {
                    vnode.destroy();
                });

                //清空之前标识
                layoutStroage.vnode = null;
                layoutStroage.url = null;
                layoutStroage.blockMap = {};
            }
        }

        //视图渲染
        render();
    }
}


module.exports = {
    layout: layout,
    display: display
};