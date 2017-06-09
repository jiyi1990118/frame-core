(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require === "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e)
            }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
    }
    var i = typeof require === "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s
})({
    1: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-6-8.
         */

        var PATH = require('../../inside/lib/path');
        var extendInterface = require('./lib/extenInterface');
        var getSource = require('../../inside/source/getSource');
        var modelEngine = require('../model/index');
        var sourcePathNormal = require('../../inside/source/sourcePathNormal');
        var modelExample;

        //扩展存储
        var extendStroage = {};

        //扩展状态
        var extendLoadState = {};

        //扩展监听
        var extendWatch = {};

        function extendExample(pathInfo, callbcak) {

            var url = PATH.resolve(pathInfo.url + '/' + pathInfo.slice),
                extendObj = extendStroage[url],
                state = extendLoadState[url];

            if (extendObj || state) {
                if (extendObj) {
                    callbcak(extendObj);
                } else {
                    extendWatch[url].push(callbcak);
                }
                return;
            }

            extendLoadState[url] = 1;
            extendWatch[url] = [];

            //资源获取
            getSource(pathInfo, {
                mode: pathInfo.mode,
            }, function(resSource) {
                var extendLib = [];
                var count = 0;
                var isExec;
                var calle = resSource[0];

                if (resSource === false) {
                    log.error(pathInfo.mode + '文件 [' + this.responseURL + ']缺失！');
                    return;
                }

                if (resSource.length > 1) {
                    calle = resSource[1];
                    extendLib = [].concat(resSource[0]);
                }

                function extendExec() {
                    if (count === extendLib.length && !isExec) {
                        isExec = true;
                        var watchFn,
                            extendObj = calle.apply(new extendInterface(), extendLib);

                        //存储当前扩展
                        extendStroage[url] = extendObj;
                        //资源状态
                        extendLoadState[url] = 2;
                        //返回数据
                        callbcak(extendObj);
                        //执行监听
                        while (watchFn = extendWatch[url].pop()) {
                            watchFn(extendObj);
                        }
                        delete extendWatch[url];
                    }
                }

                extendLib.forEach(function(extendPath, index) {
                    var packagePath = extendPath.replace(/^\$:/, '');
                    //两种路径 一、model  二、lib 扩展
                    if (packagePath !== extendPath) {
                        //扩展获取
                        extendExample(sourcePathNormal(packagePath, pathInfo, 'extend'), function(extend) {
                            extendLib[index] = extend;
                            count++;
                            extendExec()
                        });
                    } else {
                        count++;
                        extendLib[index] = new modelExample(sourcePathNormal(packagePath, pathInfo, 'model'));
                    }
                });
                extendExec();

            });
        }


        module.exports = {
            extendInterface: extendInterface,
            extendExample: extendExample,
            //主要由model传递model实例接口
            setModelExample: function(ModelExample) {
                modelExample = ModelExample;
            }
        }
    }, {
        "../../inside/lib/path": 56,
        "../../inside/source/getSource": 62,
        "../../inside/source/sourcePathNormal": 63,
        "../model/index": 5,
        "./lib/extenInterface": 2
    }],
    2: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-6-8.
         */

        var serverEngine = require('../../server/index');

        var lib = require('../../../inside/lib/exports');

        function extendInterface() {

        }

        extendInterface.prototype.lib = lib;

        extendInterface.prototype.server = function(option) {
            return serverEngine.serverExec(option)
        }


        module.exports = extendInterface;
    }, {
        "../../../inside/lib/exports": 49,
        "../../server/index": 10
    }],
    3: [function(require, module, exports) {
        /**
         * 引擎中心
         * Created by xiyuan on 17-5-9.
         */
        "use strict";

        //视图引擎
        var viewEngin = require('./view/exports');

        //资源获取
        var getSource = require('../inside/source/getSource');
        var presenterEngine = require('./presenter/index');

        /**
         * 引擎运行器
         * @param routeInfo 路由信息
         * @param pathInfo 路径信息
         */
        function engineExec(routeInfo, pathInfo) {

            //获取调度器资源
            getSource(routeInfo.presenter, {
                mode: 'presenter'
            }, function(source, info) {
                //调度器执行
                presenterEngine.exec(source, info, pathInfo, routeInfo.view);
            });
        }

        module.exports = {
            //视图引擎
            viewEngin: viewEngin,
            //引擎执行器
            exec: engineExec
        }

    }, {
        "../inside/source/getSource": 62,
        "./presenter/index": 8,
        "./view/exports": 15
    }],
    4: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-6-2.
         */

        var sourcePathNormal = require('../../inside/source/sourcePathNormal');
        //资源获取
        var getSource = require('../../inside/source/getSource');

        var viewEngine = require('../../engine/view/exports');

        var log = require('../../inside/log/log');

        var domApi = viewEngine.vdom.domApi;

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
            presenter: null,
            //当前layout块级
            blockMap: {}
        }

        //视图渲染
        function render() {

            var pageContainer = document.body;

            //检查当前是否需要渲染布局
            if (layoutStroage.vnode) {

                //检查是否重复布局
                if (!layoutStroage.isRepeat) {

                    //渲染页面布局
                    viewEngine.vdom.patch(null, layoutStroage.vnode.vnode, layoutStroage.vnode.source, undefined, function(containerElm, replaceParent) {
                        //元素替换
                        pageContainer.innerHTML = '';
                        pageContainer.appendChild(containerElm)
                        replaceParent(pageContainer);
                    });
                }
                pageContainer = layoutStroage.main;
            }

            //渲染 presenter 视图
            viewEngine.vdom.patch(null, layoutStroage.presenter.vnode, layoutStroage.presenter.source, undefined, function(containerElm, replaceParent) {

                var location,
                    mainElm,
                    parentVnode = pageContainer.parentNode,
                    presenterBlockMap = layoutStroage.presenter.source.layoutInfo.blockMap;


                //检查布局主体是否存在
                if (layoutStroage.vnode && layoutStroage.main) {

                    //替换layout-block
                    Object.keys(presenterBlockMap).forEach(function(key) {

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
                            } else {
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
                            layoutStroage.blockMap[key] = presenterBlock;
                        }
                    });

                    //获取layout-main 真实元素
                    mainElm = [].concat(pageContainer.vnode.elm)[0];

                    if (parentVnode) {
                        //获取 layout-main 元素在父节点内部的位置
                        location = parentVnode.children.indexOf(pageContainer.vnode);

                        //更改layout-main元素的子元素
                        [].splice.apply(parentVnode.children, [location, 1].concat(layoutStroage.presenter.vnode));
                    }

                    // console.log(mainElm.parentNode, containerElm, mainElm,pageContainer)
                    //插入presenter 视图
                    domApi.insertBefore(mainElm.parentNode || document.body, containerElm, mainElm)

                    //销毁旧的 layout-main 子元素
                    pageContainer.vnode.innerVnode.forEach(function(vnode) {
                        vnode.destroy();
                    });

                    pageContainer.vnode.elm = [];
                    pageContainer.vnode.children = [];
                    pageContainer.vnode.innerVnode = [];

                    //替换layout中的主体layout
                    (layoutStroage.main.vnode.innerVnode = layoutStroage.main.vnode.innerVnode.concat(layoutStroage.presenter.vnode)).forEach(function(vnode) {
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

                //销毁旧布局的布局块级节点
                Object.keys(layoutStroage.blockMap).forEach(function(blockInfo) {
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
            layoutStroage.presenter = null;

            layoutStroage.url = layoutPathInfo.url;

            //获取layout相关presenter资源
            getSource(layoutPathInfo, {
                mode: 'presenter'
            }, function(source, info) {
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
                    if (!layoutStroage.vnode) return;
                } else {

                    //检查是否存在布局信息 并销毁
                    if (layoutStroage.vnode) {
                        //销毁旧布局的布局块级节点
                        Object.keys(layoutStroage.blockMap).forEach(function(key) {
                            layoutStroage.blockMap[key].vnode.destroy();
                        });

                        //销毁旧的布局
                        [].concat(layoutStroage.vnode.vnode).forEach(function(vnode) {
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
    }, {
        "../../engine/view/exports": 15,
        "../../inside/log/log": 61,
        "../../inside/source/getSource": 62,
        "../../inside/source/sourcePathNormal": 63
    }],
    5: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-6-1.
         */

        "use strict";

        var modelExample = require('./lib/modelExample');
        var modelInterface = require('./modelInterface');

        module.exports = {
            modelExample: modelExample,
            modelInterface: modelInterface
        }

    }, {
        "./lib/modelExample": 6,
        "./modelInterface": 7
    }],
    6: [function(require, module, exports) {
        /**
         * 数据模型 实例
         * Created by xiyuan on 17-6-4.
         */
        "use strict";

        var getSource = require('../../../inside/source/getSource');
        var modelInterface = require('../modelInterface');
        var extendEngine = require('../../extend/index');
        var sourcePathNormal = require('../../../inside/source/sourcePathNormal');

        extendEngine.setModelExample(modelExample);

        //模型实例
        function modelExample(pathInfo) {
            var This = this;
            this.interface = new modelInterface();
            this.useTrigger = [];

            var source = this.interface.__source__;

            getSource(pathInfo, {
                mode: pathInfo.mode,
            }, function(resSource) {
                var extendLib = [];
                var count = 0;
                var isExec;
                var calle = resSource[0];
                if (resSource === false) {
                    log.error('model文件 [' + this.responseURL + ']缺失！');
                    return;
                }

                if (resSource.length > 1) {
                    calle = resSource[1];
                    extendLib = [].concat(resSource[0]);
                }

                function modelExec() {
                    if (count === extendLib.length && !isExec) {
                        isExec = true;
                        //资源回调,初始化model
                        if (calle instanceof Function) {
                            //开始实例化model代码
                            calle.apply(This.interface, extendLib);
                            //标识模型已调用
                            source.isExec = true;
                            //检查triggle
                            This.useTrigger.forEach(function(info) {
                                if (source.trigger[info.name] instanceof Function) {
                                    info.callback(source.trigger[info.name].apply(This, info.args));
                                }
                            });
                        } else if (calle instanceof Object) {
                            console.log('暂不支持model 数据对象')
                        }
                    }
                }

                extendLib.forEach(function(extendPath, index) {
                    var packagePath = extendPath.replace(/^\$:/, '');
                    //两种路径 一、model  二、lib 扩展
                    if (packagePath !== extendPath) {
                        extendEngine.extendExample(sourcePathNormal(packagePath, pathInfo, 'extend'), function(extend) {
                            extendLib[index] = extend;
                            count++;
                            modelExec()
                        })

                    } else {
                        count++;
                        extendLib[index] = new modelExample(sourcePathNormal(packagePath, pathInfo, 'model'));
                    }

                });
                modelExec()
            });
        };

        //模型数据监听
        modelExample.prototype.watch = function(watchKey, fn, isRead) {
            this.interface.watch(watchKey, fn, isRead);
        };

        //移除数据监听
        modelExample.prototype.unWatch = function(watchKey, fn) {
            this.interface.unWatch(watchKey, fn);
        };

        //模型数据监听
        modelExample.prototype.write = function(key, data) {
            this.interface.write(key, data);
        }

        //模型数据监听
        modelExample.prototype.read = function(key, fn) {
            this.interface.read(key, fn);
        }

        //模型触发器调用
        modelExample.prototype.trigger = function(name, arg1) {
            var args = [].slice.call(arguments).slice(1),
                source = this.interface.__source__,
                info = {
                    name: name,
                    args: args,
                    callback: function() {}
                },
                flag,
                resData;

            //检查model是否实例化
            if (source.isExec) {
                if (source.trigger[name]) {
                    flag = true;
                    resData = source.trigger[name].apply(this, args);
                }
            } else {
                this.useTrigger.push(info)
            }

            return function(fn) {
                if (fn instanceof Function) {
                    if (flag) {
                        fn(resData);
                    } else {
                        info.callback = fn;
                    }
                }
            };
        }


        module.exports = modelExample;
    }, {
        "../../../inside/source/getSource": 62,
        "../../../inside/source/sourcePathNormal": 63,
        "../../extend/index": 1,
        "../modelInterface": 7
    }],
    7: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-6-1.
         */
        "use strict";

        var observer = require('../../inside/lib/observer');
        var serverEngine = require('../server/index');

        function modelInterface() {

            //model资源
            this.__source__ = {
                trigger: {},
                isExec: false,
                observer: observer(this)
            };
        }

        /**
         * 调用另一个model
         * @param modelPath
         */
        modelInterface.prototype.model = function(modelPath) {

        }


        /**
         * 数据监控
         * @param watchKey
         * @param fn
         * @param isRead
         * @returns {modelInterface}
         */
        modelInterface.prototype.watch = function(watchKey, fn, isRead) {
            var ob = this.__source__.observer;

            if (isRead === undefined) {
                if (watchKey instanceof Function) {
                    if (typeof fn === 'boolean') {
                        ob.readWatch('exports', watchKey);
                        return this;
                    }
                    ob.watch('exports', watchKey);
                    return this;
                }

            } else if (isRead) {
                ob.readWatch('exports.' + watchKey, fn);
                return this;
            }
            ob.watch('exports.' + watchKey, fn);
            return this;
        };

        /**
         * 数据读取
         * @param key
         * @param fn
         * @returns {modelInterface}
         */
        modelInterface.prototype.read = function(key, fn) {
            if (arguments.length === 2) {
                key = 'exports.' + key;
            } else {
                fn = key;
                key = 'exports'
            }
            this.__source__.observer.read(key, fn);
            return this;
        };

        /**
         * 移除数据监控
         * @param key
         * @param fn
         * @returns {modelInterface}
         */
        modelInterface.prototype.unWatch = function(key, fn) {
            if (arguments.length === 2) {
                key = 'exports.' + key;
            } else {
                fn = key;
                key = 'exports'
            }
            this.__source__.observer.unWatch(key, fn);
            return this;
        };

        /**
         * 移除数据读取监控
         * @param watchKey
         * @param fn
         * @returns {modelInterface}
         */
        modelInterface.prototype.unRead = function(watchKey, fn) {

            if (arguments.length === 2) {
                watchKey = 'exports.' + watchKey;
            } else {
                fn = watchKey;
                watchKey = 'exports'
            }
            this.__source__.observer.unRead(watchKey, fn);
            return this;
        };

        /**
         * model数据写入
         * @param key
         * @param data
         */
        modelInterface.prototype.write = function(key, data) {
            if (arguments.length === 1) {
                this.exports = key;
            } else if (arguments.length === 2) {
                if (!(this.exports instanceof Object)) {
                    this.exports = {}
                }
                this.exports[key] = data;
            }
        };

        /**
         * 自定义触发器
         * @param name
         * @param fn
         */
        modelInterface.prototype.trigger = function(name, fn) {
            this.__source__.trigger[name] = fn;
        };

        /**
         * 服务请求
         * @param option
         */
        modelInterface.prototype.server = function(option) {
            return serverEngine.serverExec(option)
        }

        module.exports = modelInterface;
    }, {
        "../../inside/lib/observer": 55,
        "../server/index": 10
    }],
    8: [function(require, module, exports) {
        /**
         * 调度器引擎
         * Created by xiyuan on 17-5-9.
         */
        "use strict";

        var log = require('../../inside/log/log');
        var presenterEngine = require('./presenterInterface');

        module.exports = {
            exec: presenterEngine.presenterExec
        }
    }, {
        "../../inside/log/log": 61,
        "./presenterInterface": 9
    }],
    9: [function(require, module, exports) {
        /**
         * Created by xiyuan on 16-5-17.
         */

        "use strict";

        //唯一标识生成
        var uid = require('../../inside/lib/encrypt/uid');

        var viewEngine = require('../view/exports');

        var appConf = require('../../inside/config/lib/commData').appConf;

        var layoutEngine = require('../layout/index');

        var modelEngine = require('../model/index');

        var sourcePathNormal = require('../../inside/source/sourcePathNormal');

        //调度器存储器
        var presenterSource = {};

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
        function presenterInterface(info, view) {
            //调度器数据存储
            presenterSource[this.__sourceId__ = uid()] = {
                //存储视图分配的数据
                assign: {},
                assignReal: {},
                filter: {},
                animate: null,
                view: view,
                display: false,
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
        presenterInterface.prototype.title = function(title) {
            if (title) {
                window.document.title = title;
                presenterSource[this.__sourceId__].title = title;
            }
            return this;
        };

        /**
         * 视图数据分配
         * @param key
         * @param val
         * @returns {presenterInterface}
         */
        presenterInterface.prototype.assign = function(key, val) {
            var source = presenterSource[this.__sourceId__];

            //检查此key之前是否存在model数据类型中
            if (source.assignReal[key]) {

                //检查与当前数据是否同源，否则移除监听
                if (source.assignReal[key] !== val) {
                    source.assignReal[key].unWatch()
                } else {
                    return this;
                }
            }

            //检查当前数据是否model数据
            if (val instanceof modelEngine.modelExample) {

                //记录到assign真实数据中
                source.assignReal[key] = val;

                val.watch(function(resData) {
                    source.assign[key] = resData;
                }, true)

            } else {
                source.assign[key] = val;
            }
            return this;
        };

        /**
         * 过滤器
         * @param filterName
         * @param fn
         * @returns {*}
         */
        presenterInterface.prototype.filter = function(filterName, fn) {
            presenterSource[this.__sourceId__].filter[filterName] = fn;
            return this;
        };

        /**
         * 控制器继承 第一个参数是控制器路径  之后参数都是需要传递的参数
         * @param presenter
         * @returns {presenterInterface}
         */
        presenterInterface.prototype.extend = function(presenter) {
            var args = arguments,
                i = 0,
                l = args.length,
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
        presenterInterface.prototype.layout = function(layoutPath) {
            var source = presenterSource[this.__sourceId__];
            if (source.info.isLayout) return;
            //标识使用layout
            source.useLayout = true;
            //layout渲染
            layoutEngine.layout(layoutPath, source.info, presenterExec);
            return this;
        };

        /**
         * 页面跳换动画模式
         * @param animate
         * @returns {presenterInterface}
         */
        presenterInterface.prototype.animate = function(animate) {
            presenterSource[this.__sourceId__].animate = animate;
            return this;
        };

        /**
         * 页面展示
         * @param view
         * @returns {presenterInterface}
         */
        presenterInterface.prototype.display = function(view) {
            var source = presenterSource[this.__sourceId__];

            //检查页面是否需要渲染
            if (view === false || source.display) {
                source.display = true;
                return;
            } else if (view) {
                source.view = view;
            }
            //标识页面已渲染
            source.display = true;

            var viewInfo = {
                tplSuffix: appConf.tplSuffix,
                requireType: appConf.viewRequire,
                view: source.view
            };

            //解析视图参数
            if (source.view instanceof Function) {
                view = source.view(function(conf) {
                    Object.keys(conf).forEach(function(key) {
                        viewInfo[key] = conf[key];
                    });
                }, source.info);

                if (view) viewInfo.view = view;
            } else if (source.view instanceof Object) {
                Object.keys(source).forEach(function(key) {
                    viewInfo[key] = source[key];
                });
            }

            //格式化视图模板后缀
            viewInfo.tplSuffix = '.' + viewInfo.tplSuffix.replace(/^\./, '');

            //视图资源请求
            viewEngine.viewSourc(viewInfo, source.info, function(viewSource) {
                //结合layout来渲染
                layoutEngine.display(viewSource, source);
            });
            return this;
        };

        /**
         * 页面重定向
         * @param pagePath
         * @returns {presenterInterface}
         */
        presenterInterface.prototype.redirect = function(pagePath) {

            return this;
        };

        /**
         * 数据模型调用
         * @param modelPath
         * @returns {$modelInterface}
         */
        presenterInterface.prototype.model = function(modelPath) {
            var source = presenterSource[this.__sourceId__];
            var pathInfo = sourcePathNormal(modelPath, source.info, 'model');
            return new modelEngine.modelExample(pathInfo);
        };

        /**
         * 调度执行
         * @param source
         * @param sourceInfo
         * @param pathInfo
         * @param view
         */
        function presenterExec(source, sourceInfo, pathInfo, view) {
            var calle = source[0];
            if (!source) {
                log.error('presenter [' + sourceInfo.url + ']中缺失' + sourceInfo.slice + '操作(切片)');
                return;
            }

            if (source.length > 1) {
                calle = source[1];
            }

            //调度器执行
            calle.call(new presenterInterface({
                //是否布局
                isLayout: sourceInfo.isLayout,
                //参数
                parameter: pathInfo.parameter,
                //当前模块
                module: sourceInfo.module,
                //当前操作(切片)
                slice: sourceInfo.slice,
                //当前资源地址
                url: sourceInfo.url,
                //当前资源路径(不包含文件 module路径、mode类型目录、文件module后缀、文件后缀)
                pathName: sourceInfo.pathName,
                //资源来源地址
                origin: sourceInfo.origin
            }, view));
        }

        module.exports = {
            presenterExec: presenterExec,
            interface: presenterInterface
        };






    }, {
        "../../inside/config/lib/commData": 33,
        "../../inside/lib/encrypt/uid": 47,
        "../../inside/source/sourcePathNormal": 63,
        "../layout/index": 4,
        "../model/index": 5,
        "../view/exports": 15
    }],
    10: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-6-4.
         */

        var serverExec = require('./lib/serverExec');
        var serverRegister = require('./lib/serverRegister');

        module.exports = {
            serverExec: serverExec,
            serverRegister: serverRegister
        }
    }, {
        "./lib/serverExec": 12,
        "./lib/serverRegister": 14
    }],
    11: [function(require, module, exports) {
        /**
         * 服务存储
         * Created by xiyuan on 17-6-4.
         */

        serverComm = {
            serverStroage: {}
        };

        module.exports = serverComm;

    }, {}],
    12: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-6-4.
         */

        var serverComm = require('./serverComm');
        var serverInterface = require('./serverInterface');

        //服务执行
        function serverExec(option) {

            return new server(option);
        }

        function server(option) {

            //server配置
            var serverConf = serverComm.serverStroage[option.serverType || 'http'];

            //内部配置
            this.__innerConf__ = {
                option: option,
                error: [],
                success: [],
                receive: [],
                serverConf: serverConf
            };

            //server实例
            var example = new serverInterface(this.__innerConf__);

            //遍历公共配置
            Object.keys(serverConf.config || {}).forEach(function(key) {

                //检查内部是否map类型
                if (typeof option[key] === 'object' && typeof serverConf.config === 'object') {
                    Object.keys(serverConf.config[key]).forEach(function(ckey) {
                        option[key][ckey] = serverConf.config[key][ckey];
                    })
                } else {
                    option[key] = serverConf.config[key];
                }
            });

            //检查是否有过滤器
            if (typeof serverConf.filter === 'object' && serverConf.filter.request instanceof Function) {
                //执行请求过滤器
                serverConf.filter.request.call(example, option);
            }
        }

        //错误回调
        server.prototype.error = function(fn) {
            if (this.__innerConf__.error.indexOf(fn) === -1) {
                this.__innerConf__.error.push(fn);
            }
            return this;
        }

        //成功回调
        server.prototype.success = function(fn) {
            if (this.__innerConf__.success.indexOf(fn) === -1) {
                this.__innerConf__.success.push(fn);
            }
            return this;
        }

        //数据接收
        server.prototype.receive = function() {
            if (this.__innerConf__.receive.indexOf(fn) === -1) {
                this.__innerConf__.receive.push(fn);
            }
            return this;
        }

        //数据请求
        server.prototype.send = function(data) {
            var innerConf = this.__innerConf__;
            //开始请求数据
            innerConf.serverConf.request.call(innerConf.example, innerConf.option, data);
        }

        module.exports = serverExec;
    }, {
        "./serverComm": 11,
        "./serverInterface": 13
    }],
    13: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-6-4.
         */

        //服务接口
        function serverInterface(innerConf) {
            //实例传递
            innerConf.example = this;
            this.__innerConf__ = innerConf;

        }

        //数据请求完成
        serverInterface.prototype.complete = function() {
            var This = this,
                resData,
                agrs = [].slice.call(arguments),
                innerConf = this.__innerConf__,
                serverConf = innerConf.serverConf;

            //检查是否有过滤器
            if (typeof serverConf.filter === 'object' && serverConf.filter.receive instanceof Function) {
                //执行过滤器
                resData = serverConf.filter.receive.call(this, agrs[0], innerConf.option);
                if (resData === undefined) return
                agrs[0] = resData
            }

            innerConf.receive.forEach(function(fn) {
                fn.apply(This, agrs);
            })
        }

        //数据请求成功
        serverInterface.prototype.success = function() {
            var This = this,
                resData,
                agrs = [].slice.call(arguments),
                innerConf = this.__innerConf__,
                serverConf = innerConf.serverConf;

            //检查是否有过滤器
            if (typeof serverConf.filter === 'object' && serverConf.filter.success instanceof Function) {
                //执行过滤器
                resData = serverConf.filter.success.call(this, agrs[0], innerConf.option);
                if (resData === undefined) return
                agrs[0] = resData
            }

            innerConf.success.forEach(function(fn) {
                fn.apply(This, agrs);
            })
        }

        //数据请求失败
        serverInterface.prototype.error = function() {
            var This = this,
                resData,
                agrs = [].slice.call(arguments),
                innerConf = this.__innerConf__,
                serverConf = innerConf.serverConf;

            //检查是否有过滤器
            if (typeof serverConf.filter === 'object' && serverConf.filter.error instanceof Function) {
                //执行过滤器
                resData = serverConf.filter.error.call(this, agrs[0], innerConf.option);
                if (resData === undefined) return
                agrs[0] = resData
            }

            innerConf.error.forEach(function(fn) {
                fn.apply(This, agrs);
            })
        }


        module.exports = serverInterface;

    }, {}],
    14: [function(require, module, exports) {
        /**
         * 服务注册
         * Created by xiyuan on 17-6-4.
         */

        var serverComm = require('./serverComm');

        function serverRegister(serverType, option) {
            serverComm.serverStroage[serverType] = option;
        }


        module.exports = serverRegister;
    }, {
        "./serverComm": 11
    }],
    15: [function(require, module, exports) {
        /**
         * 视图引擎
         * Created by xiyuan on 17-5-9.
         */
        "use strict";

        //虚拟dom
        var vdom = require('./lib/vdom');

        //语法解析
        var syntaxStruct = require('./lib/syntaxStruct');

        //语法结构处理
        var syntaxHandle = require('./lib/syntaxHandle');

        //html字符转换成虚拟DOM数据结构
        var html2vdom = require('./lib/html2vdom');

        var viewSourc = require('./lib/viewSourc');

        //组件管理
        var compMange = require('./lib/componentManage');

        //指令管理
        var directiveMange = require('./lib/directiveManage');

        /**
         * 视图渲染
         * @param html      html元素 或 html字符串
         * @param scope     [作用域]
         * @param filter    [过滤器]
         */
        function render(html, scope, filter) {
            return html2vdom(html)
        }

        //虚拟Dom或实体Dom销毁
        function destroy(vnode) {

        }


        //对外提供基础接口
        exports.vdom = vdom;
        exports.html2vdom = html2vdom;
        exports.syntaxStruct = syntaxStruct;
        exports.syntaxHandle = syntaxHandle;

        exports.componentMange = compMange;
        exports.directiveMange = directiveMange;

        //对外提供视图渲染接口
        exports.render = render;

        //对外提供视图销毁接口
        exports.destroy = destroy;

        exports.viewSourc = viewSourc;


    }, {
        "./lib/componentManage": 16,
        "./lib/directiveManage": 17,
        "./lib/html2vdom": 18,
        "./lib/syntaxHandle": 19,
        "./lib/syntaxStruct": 20,
        "./lib/vdom": 21,
        "./lib/viewSourc": 22
    }],
    16: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-11.
         */


        //语法解析
        var syntaxStruct = require('./syntaxStruct');

        //语法结构处理
        var syntaxHandle = require('./syntaxHandle');

        // var encrypt= require('../../../inside/lib/encrypt');

        var compStroage = {};

        //组件类
        function compClass(compConf, vnode, extraParameters, vdomApi) {

            //标识当前节点是组件
            vnode.isComponent = true;

            //组件元素内部作用域
            vnode.innerScope = {};

            if (compConf.scope instanceof Function) {
                vnode.innerScope = compConf.scope();
            } else if (compConf.scope instanceof Object) {
                Object.keys(compConf.scope || {}).forEach(function(key) {
                    vnode.innerScope[key] = compConf.scope[key];
                })
            }

            vnode.innerFilter = compConf.filter || {};

            //组件实例配置
            this.conf = compConf;

            //当前组件虚拟节点
            this.vnode = vnode;

            //组件优先级
            this.priority = compConf.priority || 0;

            //组件扩展参数
            this.extraParameter = extraParameters;

            //监听存储
            this.watchs = {
                create: [],
                render: []
            }

            this.$api = {
                //作用域
                scope: vnode.innerScope,
                //过滤器
                filter: {},
                //模板
                template: compConf.template,
                //虚拟节点
                vnode: vnode,
                //节点渲染
                render: function(html, scope, filter) {

                    var vnode = vdomApi.html2vdom(html);
                    vnode.innerScope = scope;
                    vnode.$scope = scope || vnode.$scope;
                    vnode.innerFilter = filter;

                    return vnode;

                },
                stroage: {}

            }

        }

        //监听创建
        compClass.prototype.watchCreate = function(fn) {
            if (fn instanceof Function) this.watchs.create.push(fn);
        }

        //监听渲染
        compClass.prototype.watchRender = function(fn) {
            if (fn instanceof Function) this.watchs.render.push(fn);
        }

        //实例化
        compClass.prototype.init = function() {
            var isRender,
                $this = this,
                $api = this.$api,
                conf = this.conf,
                vnode = this.vnode,
                data = vnode.data,
                propLoad = 0,
                attrsMap = data.attrsMap,
                props = conf.props,
                watchProps = [],
                extraParameters = this.extraParameter;

            //处理观察的属性
            function propHandle(propName, prop) {
                var proData = {};
                if (!attrsMap[propName]) {
                    return console.warn('组件数据属性 ' + propName + ' 未定义!');
                }

                if (prop instanceof Function) {
                    proData = prop = prop.call(this, attrsMap[propName].value)
                    proData.key = prop.key || propName;
                    watchProps = watchProps.concat(proData);
                } else if (prop instanceof Object) {
                    proData.key = prop.key || propName;
                    proData.exp = prop.exp || attrsMap[propName].value;

                    Object.keys(prop).forEach(function(key) {
                        proData[key] = prop[key];
                    })

                    watchProps.push(proData);

                } else {
                    watchProps.push({
                        key: propName,
                        exp: attrsMap[propName].value
                    })
                }
            }

            function renderTrigger() {
                if (watchProps.length <= ++propLoad) {
                    isRender = true;
                    $this.render();
                }
            }

            //检查模板
            if (!conf.template) {
                conf.template = vnode.children;
            }

            //检查观察的属性 并处理
            if (props) {
                if (props instanceof Array) {
                    props.forEach(function(propName) {
                        propHandle(propName);
                    })
                } else if (props instanceof Object) {
                    Object.keys(props).forEach(function(propName) {
                        propHandle(propName, props[propName]);
                    })
                }

                if (watchProps.length) {
                    //进行属性作用域数据获取
                    watchProps.forEach(function(propConf) {
                        var syntaxExample,
                            strcut = syntaxStruct(propConf.exp);

                        //检查表达式是否错误
                        if (!strcut.errMsg) {

                            //收集作用域
                            var scopes = [vnode.rootScope].concat(vnode.middleScope);
                            scopes.push(vnode.$scope);


                            syntaxExample = syntaxHandle(strcut, scopes, extraParameters.filter, true);

                            //读取表达式返回的值
                            if (!syntaxExample.read(function(newData) {

                                    $api.scope[propConf.key] = newData;

                                    //监听当前语法
                                    if (propConf.watch instanceof Function) {
                                        propConf.watch.apply(this, arguments);
                                        syntaxExample.watch(propConf.watch)
                                    }

                                    //获取当前值的watchKey
                                    if (propConf.getWatchInfo instanceof Function) {
                                        propConf.getWatchInfo(syntaxExample.getWatchInfo());
                                    }

                                    //检查是否自动渲染
                                    if (propConf.autoRender) {
                                        //监听表达式返回的值
                                        syntaxExample.watch(function(newData) {
                                            $api.scope[propConf.key] = newData;

                                            //获取当前值的watchKey
                                            if (propConf.getWatchInfo instanceof Function) {
                                                propConf.getWatchInfo(syntaxExample.getWatchInfo());
                                            }

                                            if (isRender) {
                                                $this.render();
                                            } else {
                                                renderTrigger();
                                            }

                                        })
                                    }

                                    //检查是否有默认数据 并渲染
                                    if (propConf.hasOwnProperty('default') && isRender) {
                                        $this.render();
                                    } else {
                                        renderTrigger();
                                    }

                                })) {
                                //检查是否有默认数据
                                if (propConf.hasOwnProperty('default')) {
                                    $api.scope[propConf.key] = propConf['default'];
                                    renderTrigger();
                                }
                            }

                        } else {
                            console.warn('表达式： ' + propConf.exp + '有误！')
                        }

                    })
                    return this;
                }
            } else {
                isRender = true;
                this.render();
            }

        }

        compClass.prototype.render = function() {
            var conf = this.conf,
                vnode = this.vnode;

            //检查是否有渲染的方法
            if (conf.render instanceof Function) {
                vnode.innerVnode = conf.render.call(this.$api, this.$api.vnode, this.$api.scope) || conf.template;
            } else if (conf.template) {

                if (conf.isReplace || conf.isReplace === undefined) {
                    conf.isReplace = true;
                    vnode.innerVnode = conf.template;
                } else {

                }
            }

            //标识当前节点是否替换
            vnode.isReplace = conf.isReplace;

            //触发创建的观察
            if (!this.isRender) {
                this.watchs.create.forEach(function(create) {
                    create();
                })
            }

            //触发渲染的观察
            this.watchs.render.forEach(function(render) {
                render();
            })

            this.isRender = true;
        }

        //组件获取
        exports.get = function(compName) {
            return compStroage[compName];
        }

        //组件注册
        exports.register = function(compName, compConf) {
            compStroage[compName] = function(vnode, extraParameters, vdomApi) {
                return new compClass(compConf, vnode, extraParameters, vdomApi);
            };
        }
    }, {
        "./syntaxHandle": 19,
        "./syntaxStruct": 20
    }],
    17: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-15.
         */
        // var observer=require('../../../inside/lib/observer');

        //语法解析
        var syntaxStruct = require('./syntaxStruct');

        //语法结构处理
        var syntaxHandle = require('./syntaxHandle');

        var directiveStroage = {};

        //指令类
        function directiveClass(directiveConf, vnode, extraParameters, directiveName, vdomApi) {
            this.vdomApi = vdomApi;

            //标识当前节点是指令
            vnode.isDirective = true;

            //指令名称
            this.name = directiveName;

            this.expInfo = vnode.data.attrsMap[directiveName];

            //表达式
            this.exp = vnode.data.attrsMap[directiveName].value;

            //指令实例配置
            this.conf = directiveConf;

            //当前指令虚拟节点
            this.vnode = vnode;

            //当前节点备份
            this.cloneVnode = vnode.clone();

            //指令扩展参数
            this.extraParameter = extraParameters;

            //指令优先级
            this.priority = directiveConf.priority || 0;

            //监听存储
            this.watchs = {
                create: [],
                render: []
            }

            this.$api = {
                //作用域
                scope: vnode.$scope, // directiveConf.scope = directiveConf.scope || {},
                //过滤器
                filter: {},
                //虚拟节点
                vnode: vnode,
                //expInfo
                expInfo: vnode.data.attrsMap[directiveName],
                //节点渲染
                render: function() {

                },
                rootScope: vnode.rootScope,
                stroage: {},
                //模板节点
                templateVnode: vnode.clone()

            }
        }

        //监听创建
        directiveClass.prototype.watchCreate = function(fn) {
            if (fn instanceof Function) this.watchs.create.push(fn);
        }

        //监听渲染
        directiveClass.prototype.watchRender = function(fn) {
            if (fn instanceof Function) this.watchs.render.push(fn);
        }

        //实例化
        directiveClass.prototype.init = function() {
            var isRender,
                propLoad = 0,
                $this = this,
                $api = this.$api,
                conf = this.conf,
                vnode = this.vnode,
                data = vnode.data,
                props = conf.props,
                watchProps = [],
                exp = this.exp,
                extraParameters = this.extraParameter;

            //写入钩子
            if (conf.hook) {
                vnode.data.hook = vnode.data.hook || {};
                Object.keys(conf.hook).forEach(function(hookName) {
                    vnode.data.hook[hookName] = conf.hook[hookName];
                })
            }

            function renderTrigger() {
                if (watchProps.length <= ++propLoad) {
                    isRender = true;
                    $this.render();
                }
            }

            //检查模板
            if (!conf.template) {
                conf.template = vnode.children;
            }

            //作用域处理合并
            /*Object.keys(extraParameters.scope = extraParameters.scope || {}).forEach(function (sKey) {
                $api.scope[sKey] = extraParameters.scope[sKey];
            })*/

            //作用域处理合并
            Object.keys(conf.scope = conf.scope || {}).forEach(function(sKey) {
                $api.scope[sKey] = conf.scope[sKey];
            })

            //检查观察的属性 中数据是否完全加载
            if (conf.props) {
                if (props instanceof Function) {
                    props = props.call($api, exp, this.expInfo);
                    watchProps = watchProps.concat(props)

                    if (watchProps.length) {
                        //进行属性作用域数据获取
                        watchProps.forEach(function(propConf) {
                            propConf.exp = propConf.exp || exp;

                            if (!propConf.exp) return renderTrigger();

                            var syntaxExample,
                                strcut = syntaxStruct(propConf.exp);

                            //检查表达式是否错误
                            if (!strcut.errMsg) {
                                //收集作用域
                                var scopes = [vnode.rootScope].concat(vnode.middleScope);
                                if (vnode.innerScope) {
                                    scopes.push(vnode.innerScope);
                                } else {
                                    scopes.push(vnode.$scope);
                                }

                                syntaxExample = syntaxHandle(strcut, scopes, extraParameters.filter, true);

                                //读取表达式返回的值
                                if (!syntaxExample.read(function(newData) {
                                        $api.scope[propConf.key] = newData;

                                        //监听当前语法
                                        if (propConf.watch instanceof Function) {
                                            propConf.watch.apply(this, arguments);
                                            syntaxExample.watch(propConf.watch)
                                        }

                                        //获取当前值的watchKey
                                        if (propConf.getWatchInfo instanceof Function) {
                                            propConf.getWatchInfo(syntaxExample.getWatchInfo());
                                        }

                                        //检查是否自动渲染
                                        if (propConf.autoRender) {
                                            //监听表达式返回的值
                                            syntaxExample.watch(function(newData) {

                                                $api.scope[propConf.key] = newData;

                                                //获取当前值的watchKey
                                                if (propConf.getWatchInfo instanceof Function) {
                                                    propConf.getWatchInfo(syntaxExample.getWatchInfo());
                                                }

                                                if (isRender) {
                                                    $this.render();
                                                } else {
                                                    renderTrigger();
                                                }
                                            })
                                        }

                                        //检查是否有默认数据 并渲染
                                        if (propConf.hasOwnProperty('default') && isRender) {
                                            $this.render();
                                        } else {
                                            renderTrigger();
                                        }
                                    })) {
                                    //检查是否有默认数据
                                    if (propConf.hasOwnProperty('default')) {
                                        //默认值
                                        $api.scope[propConf.key] = propConf['default'];
                                        renderTrigger();
                                    }
                                };

                            } else {
                                console.warn('表达式： ' + propConf.exp + '有误！')
                            }

                        })

                    }


                } else {
                    console.warn('指令配置中props只能为function')
                }
            } else {
                $this.render();
            }
        }

        directiveClass.prototype.render = function() {
            var conf = this.conf,
                vnode = this.vnode,
                renderVnode;

            //检查是否有渲染的方法
            if (conf.render instanceof Function) {
                renderVnode = conf.render.call(this.$api, this.$api.vnode, this.$api.scope);

                switch (true) {
                    case !renderVnode:
                        return;
                    case renderVnode === vnode:
                    case renderVnode.elm && renderVnode.elm === vnode.elm:
                        //检查是否渲染，并检查更新元素
                        vnode.elm && this.vdomApi.cbs.update.forEach(function(updateHandle) {
                            updateHandle(vnode, renderVnode);
                        })
                        return;
                }

                vnode.innerVnode = renderVnode;
            }

            //标识当前节点是否替换
            vnode.isReplace = conf.isReplace;

            //触发创建的观察
            if (!this.isRender) {
                this.watchs.create.forEach(function(create) {
                    create();
                })
            }

            //触发渲染的观察
            this.watchs.render.forEach(function(render) {
                render();
            })

            this.isRender = true;
        }

        exports.directiveClass = directiveClass;

        //指令获取
        exports.get = function(directiveName) {
            return directiveStroage[directiveName];
        }

        //指令注册
        exports.register = function(directiveName, directiveConf) {
            directiveStroage[directiveName] = function(vnode, extraParameters, vdomApi) {
                return new directiveClass(directiveConf, vnode, extraParameters, directiveName, vdomApi);
            };
        }
    }, {
        "./syntaxHandle": 19,
        "./syntaxStruct": 20
    }],
    18: [function(require, module, exports) {
        /**
         * html字符转虚拟dom数据
         * Created by xiyuan on 17-5-9.
         */
        /*
         * HTML5 Parser
         *
         * Designed for HTML5 documents
         *
         * Original Code from HTML5 Parser By Sam Blowes (https://github.com/blowsie/Pure-JavaScript-HTML5-Parser)
         * Original code by John Resig (ejohn.org)
         * http://ejohn.org/blog/pure-javascript-html-parser/
         * Original code by Erik Arvidsson, Mozilla Public License
         * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
         *
         * // To get a DocumentFragment. If doctype is defined then it returns a Document.
         * HTMLtoDOM(htmlString);
         */
        "use strict";

        //browser and jsdom compatibility
        var window = window || this;
        var document = window.document;

        //虚拟Dom
        var vdom = require('./vdom');

        var string = require('../../../inside/lib/string');

        //语法解析
        var syntaxStruct = require('./syntaxStruct');

        var HTMLParser = (function() {
            // Regular Expressions for parsing tags and attributes
            var startTag = /^<([-\w:]+)((?:\s+[^\s\/>"'=]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*>/,
                endTag = /^<\/([-\w:]+)[^>]*>/,
                cdataTag = /^<!\[CDATA\[([\s\S]*?)\]\]>/i,
                attr = /^\s+([^\s\/>"'=]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/;

            // Empty Elements - HTML 5
            var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr"),

                // Block Elements - HTML 5
                block = makeMap("address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video"),

                // Inline Elements - HTML 5
                inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var"),

                // Elements that you can, intentionally, leave open
                // (and which close themselves)
                closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr"),

                // Special Elements (can contain anything)
                special = {
                    script: /^([\s\S]*?)<\/script[^>]*>/i,
                    style: /^([\s\S]*?)<\/style[^>]*>/i
                };

            return function Parser(html, handler) {
                //remove trailing spaces
                html = html.trim();

                var index, chars, match, stack = [],
                    last = html,
                    lastTag;

                var specialReplacer = function(all, text) {
                    if (handler.chars)
                        handler.chars(text);
                    return "";
                };

                while (html) {
                    chars = true;

                    //Handle script and style tags
                    if (special[lastTag]) {
                        html = html.replace(special[lastTag], specialReplacer);
                        chars = false;

                        parseEndTag("", lastTag);

                        // end tag
                    } else if (html.substring(0, 2) === "</") {
                        match = html.match(endTag);

                        if (match) {
                            html = html.substring(match[0].length);
                            parseEndTag.apply(this, match);
                            chars = false;
                        }

                        // Comment
                    } else if (html.substring(0, 4) === "<!--") {
                        index = html.indexOf("-->");

                        if (index >= 0) {
                            if (handler.comment)
                                handler.comment(html.substring(4, index));
                            html = html.substring(index + 3);
                            chars = false;
                        }

                        //CDATA
                    } else if (html.substring(0, 9).toUpperCase() === '<![CDATA[') {
                        match = html.match(cdataTag);

                        if (match) {
                            if (handler.cdata)
                                handler.cdata(match[1]);
                            html = html.substring(match[0].length);
                            chars = false;
                        }

                        // doctype
                    } else if (html.substring(0, 9).toUpperCase() === '<!DOCTYPE') {
                        index = html.indexOf(">");

                        if (index >= 0) {
                            if (handler.doctype)
                                handler.doctype(html.substring(0, index));
                            html = html.substring(index + 1);
                            chars = false;
                        }
                        // start tag
                    } else if (html[0] === "<") {
                        match = html.match(startTag);

                        if (match) {
                            html = html.substring(match[0].length);
                            parseStartTag.apply(this, match);
                            chars = false;
                        } else { //ignore the angle bracket
                            html = html.substring(1);
                            if (handler.chars) {
                                handler.chars('<');
                            }
                            chars = false;
                        }
                    }

                    if (chars) {
                        index = html.indexOf("<");

                        var text = index < 0 ? html : html.substring(0, index);
                        html = index < 0 ? "" : html.substring(index);

                        if (handler.chars) {
                            handler.chars(text);
                        }
                    }

                    if (html === last)
                        throw "Parse Error: " + html;
                    last = html;
                }

                // Clean up any remaining tags
                parseEndTag();

                function parseStartTag(tag, tagName, rest, unary) {
                    var casePreservedTagName = tagName;
                    tagName = tagName.toLowerCase();

                    if (block[tagName]) {
                        while (lastTag && inline[lastTag]) {
                            parseEndTag("", lastTag);
                        }
                    }

                    //TODO: In addition to lastTag === tagName, also check special case for th, td, tfoot, tbody, thead
                    if (closeSelf[tagName] && lastTag === tagName) {
                        parseEndTag("", tagName);
                    }

                    unary = empty[tagName] || !!unary;

                    if (!unary) {
                        stack.push(tagName);
                        lastTag = tagName;
                    }

                    if (handler.start) {
                        var attrs = [],
                            match, name, value;

                        while ((match = rest.match(attr))) {
                            rest = rest.substr(match[0].length);

                            name = match[1];
                            value = match[2] || match[3] || match[4] || '';

                            attrs.push({
                                name: name,
                                value: value,
                                escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
                            });
                        }

                        if (handler.start)
                            handler.start(casePreservedTagName, attrs, unary);
                    }
                }

                function parseEndTag(tag, tagName) {
                    var pos;
                    // If no tag name is provided, clean shop
                    if (!tagName)
                        pos = 0;

                    // Find the closest opened tag of the same type
                    else
                        for (pos = stack.length - 1; pos >= 0; pos -= 1)
                            if (stack[pos] === tagName)
                                break;

                    if (pos >= 0) {
                        // Close all the open elements, up the stack
                        for (var i = stack.length - 1; i >= pos; i -= 1)
                            if (handler.end)
                                handler.end(stack[i]);

                        // Remove the open elements from the stack
                        stack.length = pos;
                        lastTag = stack[pos - 1];
                    }
                }
            };

        }());

        function makeMap(str) {
            var obj = {},
                items = str.split(",");
            for (var i = 0; i < items.length; i += 1)
                obj[items[i]] = true;
            return obj;
        }

        /**
         * html字符串转虚拟dom
         * @param htmlStr
         * @returns {Array}
         */
        function str2vdom(htmlStr) {
            var nowStruct,
                eleStruct = [],
                structLevel = [];

            HTMLParser(string.HTMLDecode(htmlStr), {
                //标签节点起始
                start: function(tagName, attrs, unary) {
                    nowStruct = vdom.vnode(
                        tagName, {
                            attrsMap: attrs.reduce(function(attrs, current) {
                                var type,
                                    localtion,
                                    modifiers,
                                    attrName = current.name;

                                //获取自定义属性的类型
                                if ((localtion = attrName.indexOf(':')) !== -1) {
                                    type = attrName.slice(localtion + 1);
                                    attrName = attrName.slice(0, localtion) || 'bind';
                                    //获取修饰符
                                    if ((localtion = type.indexOf('.')) !== -1) {
                                        modifiers = type.slice(localtion + 1);
                                        type = type.slice(0, localtion);
                                        modifiers = modifiers.split('.')
                                    }
                                } else {
                                    //获取修饰符
                                    if ((localtion = attrName.indexOf('.')) !== -1) {
                                        modifiers = attrName.slice(localtion + 1);
                                        attrName = attrName.slice(0, localtion);
                                        modifiers = modifiers.split('.')
                                    }
                                }

                                attrs[attrName] = {
                                    type: type,
                                    modifiers: modifiers,
                                    value: current.value,
                                    attrName: current.name
                                };

                                return attrs;
                            }, {})
                        }, []
                    )

                    structLevel.push(nowStruct)
                    if (unary) {
                        this.end();
                    }
                },
                //标签节点结束
                end: function() {
                    //前一个元素结构
                    var parentStruct = structLevel.pop();

                    //检查当前是否顶级层级
                    if (structLevel.length) {
                        //检查当前元素是否子元素
                        if (parentStruct === nowStruct) {
                            parentStruct = structLevel[structLevel.length - 1];
                        }
                        parentStruct.children.push(nowStruct);
                        nowStruct = parentStruct;
                    } else {
                        if (parentStruct !== nowStruct) {
                            parentStruct.children.push(nowStruct)
                        }
                        eleStruct.push(parentStruct)
                    }
                },
                //文本节点
                chars: function(text) {
                    //空字符直接忽略
                    if (/^\s+$/.test(text)) return

                    //获取界定符位置
                    //界定符
                    var DelimiterLeft = "{{",
                        DelimiterRight = "}}";

                    var exps = [],
                        strs = [],
                        expStr;

                    /**
                     * 获取表达式
                     * @param text
                     * @returns {*}
                     */
                    (function findExp(text) {
                        var sid,
                            eid,
                            _str,
                            str = text;

                        if (str.length) {
                            if ((sid = str.indexOf(DelimiterLeft)) === -1 || (eid = str.indexOf(DelimiterRight, sid)) === -1) {
                                exps.push(str);
                                strs.push(str);
                            } else {
                                if (sid) {
                                    _str = str.slice(0, sid);
                                    exps.push(_str);
                                    strs.push(_str);
                                }
                                //截取界定符中的表达式字符
                                expStr = str.slice(sid + DelimiterLeft.length).slice(0, eid - sid - DelimiterLeft.length);
                                //解析表达式
                                exps.push(syntaxStruct(expStr));
                                //剩下的字符
                                findExp(str.slice(eid + DelimiterRight.length));
                            }
                        }
                        return text;
                    })(text)

                    var nowStruct = vdom.vnode(
                        undefined, {
                            exps: exps,
                            textExpString: expStr
                        },
                        undefined,
                        strs.join('')
                    )

                    //检查当前是否顶级层级
                    if (structLevel.length) {
                        structLevel[structLevel.length - 1].children.push(nowStruct)
                    } else {
                        eleStruct.push(nowStruct)
                    }
                }
            })
            structLevel = undefined;
            return eleStruct.length === 1 ? eleStruct[0] : eleStruct;
        }

        /**
         * dom转虚拟Dom
         * @param dom
         */
        function dom2vdom(dom) {
            var vnode;

            switch (dom.nodeType) {
                //Text
                case 3:
                    if (/^\s+$/.test(dom.textContent)) return;
                    vnode = vdom.vnode(undefined, undefined, undefined, dom.textContent, dom)
                    break;
                    //Element
                case 1:
                    vnode = vdom.node2vnode(dom);
                    //DocumentFragment
                case 11:
                    vnode = vnode || [];
                    dom.childNodes.forEach(function(node) {
                        var cvnode = dom2vdom(node);
                        if (cvnode) vnode.children.push(cvnode);
                    })
                    break;
                    //DocumentType
                case 9:
                    console.warn('暂不支持document')
            }
            return vnode;
        }

        /**
         * html 转换成虚拟dom数据结构
         */
        module.exports = vdom.html2vdom = function html2vdom(html) {
            //检查是否dom节点
            return html.nodeName ? dom2vdom(html) : str2vdom(html);
        };

    }, {
        "../../../inside/lib/string": 58,
        "./syntaxStruct": 20,
        "./vdom": 21
    }],
    19: [function(require, module, exports) {
        /**
         * 语法结构处理
         * Created by xiyuan on 17-5-11.
         */

        "use strict";

        var log = require('../../../inside/log/log');

        var observer = require('../../../inside/lib/observer');

        //语法值观察专用
        var $ob = function() {
            this.count = 0;
            this.watchCount = 0;
            this.stroage = {};
            this.receiveStroage = [];
        }

        $ob.prototype.watch = function(type) {
            var $this = this,
                loadState,
                stroage = this.stroage;

            this.watchCount++;


            return function(data) {
                //记录值
                stroage[type] = data;

                if (!loadState) {
                    ++$this.count
                    loadState = true;
                }

                //计数器
                if ($this.count === $this.watchCount) {
                    if ($this.receiveStroage.length) {
                        $this.receiveStroage.forEach(function(fn) {
                            fn(stroage)
                        })
                    }
                }
            }
        }

        $ob.prototype.receive = function(fn) {
            var stroage = this.stroage;
            this.receiveStroage.push(fn);

            //检查是否加载完毕
            if (this.watchCount === this.count) {
                this.receiveStroage.forEach(function(fn) {
                    fn(stroage)
                })
            }
        }

        /**
         * 运算方法
         * @param symbol
         * @param val1
         * @param val2
         * @param val3
         * @returns {*}
         */
        function operation(symbol, val1, val2, val3) {
            switch (symbol) {
                //一元运算
                case '$!':
                    return !val1.value;
                case '$~':
                    return ~val1.value;
                case '$-':
                    return -val1.value;
                case '$+':
                    return +val1.value;
                    //二元运算
                case '+':
                    return (val1.value === undefined ? '' : val1.value) + (val2.value === undefined ? '' : val2.value);
                case '-':
                    return val1.value - val2.value;
                case '*':
                    return val1.value * val2.value;
                case '/':
                    return val1.value / val2.value;
                case '%':
                    return val1.value % val2.value;
                    //三元运算
                case '?':
                    return val1.value ? val2.value : val3.value;
                    //成员表达式
                case 'Member':
                    return val1.value[val2.value];
                    //数组表达式
                case 'Array':
                    var arr = [];
                    Object.keys(val1).forEach(function(key) {
                        arr.push(val1[key].value)
                    })
                    return arr;
                    //对象表达式
                case 'Object':
                    var obj = {};
                    Object.keys(val1).forEach(function(key) {
                        obj[key] = val1[key];
                    })
                    return obj;
                    //方法执行
                case 'Call':
                    var call,
                        ags = [];

                    Object.keys(val1).forEach(function(key) {
                        if (key === 'callee') {
                            return call = val1[key].value
                        }
                        ags.push(val1[key].value);
                    })
                    return call.apply(this, ags);

                    //过滤器
                case 'Filter':
                    var fcall,
                        fags = [];

                    Object.keys(val1).forEach(function(key) {
                        if (key === 'callee') {
                            return fcall = val1[key].value
                        }
                        fags.push(val1[key].value);
                    });
                    if (typeof fcall === 'function') return fcall.apply(this, fags);
                    return log.error('过滤器 ' + val2 + ' 不存在!');
                    //赋值运算
                case '+=':
                    return val1.value += val2.value;
                    break;
            }
        }

        /**
         * 语法结构分析
         * @param struct
         * @param scope
         * @param filter
         */
        function analysis(struct, scope, filter, multiple) {
            var $this = this;

            this.reads = [];
            this.watchs = [];
            this.scope = scope;
            this.filter = filter;
            this.observers = [];
            this.multiple = multiple;

            this.lex(struct, function(resData) {
                $this.resData = resData.value;

                //获取监听key
                delete $this.watchInfo;
                if (resData.keys instanceof Array) {
                    $this.watchInfo = {
                        observer: resData.observer,
                        key: resData.keys.join('.')
                    };
                };

                //触发观察
                $this.watchs.forEach(function(fn) {
                    fn(resData.value);
                });

                //触发读取
                $this.reads.forEach(function(fn) {
                    fn(resData.value);
                });
                $this.reads = [];
            });

        }

        //语法结果观察
        analysis.prototype.watch = function(fn) {
            this.watchs.push(fn);
        }

        //移除语法观察
        analysis.prototype.unWatch = function(fn) {
            if (fn && this.watchs.indexOf(fn) !== -1) {
                this.watchs.splice(this.watchs.indexOf(fn), 1)
            } else {
                this.watchs = [];
            }
        }

        //语法结果读取
        analysis.prototype.read = function(fn) {
            //检查返回的数据
            if (this.hasOwnProperty('resData')) {
                fn(this.resData);
            } else {
                this.reads.push(fn);
            }
            return this.resData;
        }

        //语法结果读取
        analysis.prototype.readWatch = function(fn) {
            //检查返回的数据
            if (this.hasOwnProperty('resData')) {
                fn(this.resData);
            }
            this.watchs.push(fn);
            return this.resData;
        }

        //语法结构检查
        analysis.prototype.lex = function(nowStruct, callback, isFilter) {

            var keys,
                _keys,
                obData,
                $this = this,
                ob = new $ob();

            switch (nowStruct.exp) {
                //一元表达式
                case 'UnaryExpression':
                    this.lex(nowStruct.argment, ob.watch('argment'));
                    ob.receive(function(data) {
                        callback({
                            value: operation('$' + nowStruct.operator, data.argment)
                        })
                    })
                    break;
                    //二元表达式
                case 'BinaryExpression':
                    this.lex(nowStruct.left, ob.watch('left'))
                    this.lex(nowStruct.right, ob.watch('right'));

                    ob.receive(function(data) {
                        callback({
                            value: operation(nowStruct.operator, data.left, data.right)
                        })
                    })

                    break;
                    //三元表达式
                case 'TernaryExpression':
                    this.lex(nowStruct.condition, ob.watch('condition'))
                    this.lex(nowStruct.accord, ob.watch('accord'));
                    this.lex(nowStruct.mismatch, ob.watch('mismatch'));

                    ob.receive(function(data) {
                        callback({
                            value: operation(nowStruct.operator, data.condition, data.accord, data.mismatch)
                        })
                    })
                    break;
                    //成员表达式
                case 'MemberExpression':
                    this.lex(nowStruct.object, ob.watch('object'), isFilter)
                    this.lex(nowStruct.property, ob.watch('property'), nowStruct.computed || 'noComputed');

                    ob.receive(function(data) {

                        //检查是否对象表达式
                        if (data.object.type === 'Object' && data.object.value[data.property.value].observer) {
                            callback({
                                value: data.object.value[data.property.value].value,
                                observer: data.object.value[data.property.value].observer,
                                keys: data.object.value[data.property.value].keys
                            });
                        } else {

                            //检查是否是观察对象
                            if (data.object.observer) {
                                keys = data.object.keys.concat(data.property.value).join('.');

                                if (_keys !== keys) {
                                    _keys && data.object.observer.unwatch(_keys);
                                    //数据读取并监听
                                    data.object.observer.readWatch(_keys = keys, function(newData) {
                                        callback({
                                            value: newData,
                                            observer: data.object.observer,
                                            keys: data.object.keys.concat(data.property.value)
                                        });
                                    });
                                }

                                //检查是否数组子级元素
                            } else if (data.object.atoms) {

                                var VAL = data.object.atoms[data.property.value];

                                if (VAL.observer) {
                                    keys = VAL.keys.join('.');

                                    if (_keys !== keys) {
                                        _keys && VAL.observer.unwatch(_keys);
                                        //数据读取并监听
                                        VAL.observer.readWatch(_keys = keys, function(newData) {
                                            callback({
                                                value: newData,
                                                observer: VAL.observer,
                                                keys: VAL.keys.concat()
                                            });
                                        });
                                    }
                                } else {
                                    callback(VAL)
                                }

                            } else {

                                callback({
                                    value: data.object.value[data.property.value]
                                });

                                console.warn('语法对象错误!')
                            }
                        }

                    })
                    break;
                    //数组表达式
                case 'ArrayExpression':
                    //遍历数组元素
                    nowStruct.arguments.forEach(function(args, index) {
                        $this.lex(args, ob.watch(index));
                    })

                    ob.receive(function(data) {
                        callback({
                            value: operation('Array', data),
                            atoms: data
                        });
                    })
                    break;
                    //对象表达式
                case 'ObjectExpression':
                    nowStruct.property.forEach(function(property) {
                        $this.lex(property.value, ob.watch(property.key.value))
                    })

                    ob.receive(function(data) {
                        var objData = operation('Object', data);
                        obData = observer($this.scope, $this.multiple);

                        //收集监听对象
                        $this.observers.push(obData);

                        callback({
                            value: objData,
                            observer: obData,
                            keys: [],
                            type: 'Object'
                        });

                    })

                    break;
                    //方法执行表达式
                case 'CallExpression':

                    this.lex(nowStruct.callee, ob.watch('callee'));

                    //遍历方法参数
                    nowStruct.arguments.forEach(function(args, index) {
                        $this.lex(args, ob.watch(index))
                    })

                    ob.receive(function(data) {
                        callback({
                            value: operation('Call', data)
                        });
                    })
                    break;
                    //过滤器表达式
                case 'FilterExpression':
                    this.lex(nowStruct.callee, ob.watch('callee'), true);

                    if (nowStruct.arguments.length) {
                        //遍历过滤器参数
                        nowStruct.arguments.forEach(function(arg, index) {
                            if (arg.value === '$') {
                                $this.lex(nowStruct.lead, ob.watch(index));
                            } else {
                                $this.lex(arg, ob.watch(index));
                            }
                        });
                    } else {
                        this.lex(nowStruct.lead, ob.watch(0));
                    }

                    ob.receive(function(data) {
                        callback({
                            value: operation('Filter', data, nowStruct.callee.value)
                        });
                    })

                    break;
                    //自运算
                case 'UpdateExpression':

                    break;
                    //分配运算
                case 'AssignmentExpression':
                    this.lex(nowStruct.identifier, ob.watch('identifier'))
                    this.lex(nowStruct.value, ob.watch('value'));

                    ob.receive(function(data) {
                        callback({
                            value: operation(nowStruct.operator, data.identifier, data.value, nowStruct.identifier)
                        })
                    })
                    break;
                default:
                    //原子类型
                    switch (nowStruct.type) {
                        //空
                        case 'Null':
                            callback({
                                value: null
                            });
                            break;
                            //字符
                        case 'String':
                            callback({
                                value: nowStruct.value
                            });
                            break;
                            //布尔
                        case 'Boolean':
                            callback({
                                value: nowStruct.value === "false" ? false : true
                            });
                            break;
                            //数字
                        case 'Numeric':
                            callback({
                                value: nowStruct.value
                            });
                            break;
                            //关键字
                        case 'Keyword':
                            //标识符
                        case 'identifier':

                            switch (isFilter) {
                                case true:
                                    callback({
                                        value: this.filter[nowStruct.value]
                                    });
                                    break;
                                case 'noComputed':
                                    callback({
                                        value: nowStruct.value
                                    });
                                    break;
                                default:
                                    obData = observer(this.scope, this.multiple);
                                    //收集监听对象
                                    $this.observers.push(obData);
                                    //数据读取并监听
                                    obData.readWatch(nowStruct.value, function(newData) {
                                        callback({
                                            value: newData,
                                            observer: obData,
                                            keys: [nowStruct.value]
                                        });
                                    });
                            }
                            break;
                    }

            }
        }

        analysis.prototype.destroy = function() {
            var $this = this;

            //销毁监听对象
            this.observers.forEach(function(obs) {
                obs.destroy();
            });

            Object.keys(this).forEach(function(key) {
                delete $this[key];
            });
        }

        /**
         * 语法结构处理类
         * @param syntaxStruct
         * @param scope
         * @param filter
         */
        function structHandle(syntaxStruct, scope, filter, multiple) {
            var $this = this;
            //语法过滤器
            this.filter = filter;

            //语法作用域
            this.scope = scope || {};
            //语法结构
            this.structRes = new analysis(syntaxStruct, this.scope, filter, multiple);
        }

        //数据分配
        structHandle.prototype.assign = function(key, data) {
            this.scope[key] = data;
        }

        //表达式数据观察
        structHandle.prototype.watch = function(fn) {
            this.structRes.watch(fn)
        }

        //移除表达式数据观察
        structHandle.prototype.unWatch = function(fn) {
            this.structRes.unWatch(fn)
        }

        //获取值的监听key
        structHandle.prototype.getWatchInfo = function() {
            return this.structRes.watchInfo;
        };

        //表达式数据读取
        structHandle.prototype.read = function(fn) {
            return this.structRes.read(fn)
        }

        //表达式数据读取
        structHandle.prototype.readWatch = function(fn) {
            return this.structRes.readWatch(fn)
        }

        structHandle.prototype.destroy = function() {
            var $this = this;
            this.structRes.destroy();
            Object.keys(this.scope).forEach(function(key) {
                delete $this.scope[key]
            })

            Object.keys(this).forEach(function(key) {
                delete $this[key];
            })
        }

        module.exports = function syntaxStructHandle(syntaxStruct, scope, filter, multiple) {
            return new structHandle(syntaxStruct, scope, filter, multiple);
        }
    }, {
        "../../../inside/lib/observer": 55,
        "../../../inside/log/log": 61
    }],
    20: [function(require, module, exports) {
        /**
         * 语法解析
         * Created by xiyuan on 17-4-25.
         */
        "use strict";

        //字符检测
        var strGate = {
            // 空白字符
            isWhiteSpace: function(cp) {
                return (cp === 0x20) || (cp === 0x09) || (cp === 0x0B) || (cp === 0x0C) || (cp === 0xA0) ||
                    (cp >= 0x1680 && [0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(cp) >= 0);
            },
            // 行结束字符
            isLineTerminator: function(cp) {
                return (cp === 0x0A) || (cp === 0x0D) || (cp === 0x2028) || (cp === 0x2029);
            },
            // 变量起始字符
            isidentifierStart: function(cp) {
                return (cp === 0x24) || (cp === 0x5F) ||
                    (cp >= 0x41 && cp <= 0x5A) ||
                    (cp >= 0x61 && cp <= 0x7A) ||
                    (cp === 0x5C) ||
                    (cp >= 0x80);
            },
            // 变量字符
            isidentifierPart: function(cp) {
                return (cp === 0x24) || (cp === 0x5F) ||
                    (cp >= 0x41 && cp <= 0x5A) ||
                    (cp >= 0x61 && cp <= 0x7A) ||
                    (cp >= 0x30 && cp <= 0x39) ||
                    (cp === 0x5C) ||
                    (cp >= 0x80);
            },
            // 数字字符
            isDecimalDigit: function(cp) {
                return (cp >= 0x30 && cp <= 0x39); // 0..9
            },
            //检查是否关键词
            isKeyword: function(id) {
                switch (id.length) {
                    case 2:
                        return (id === 'if') || (id === 'in') || (id === 'do');
                    case 3:
                        return (id === 'var') || (id === 'for') || (id === 'new') ||
                            (id === 'try') || (id === 'let');
                    case 4:
                        return (id === 'this') || (id === 'else') || (id === 'case') ||
                            (id === 'void') || (id === 'with') || (id === 'enum');
                    case 5:
                        return (id === 'while') || (id === 'break') || (id === 'catch') ||
                            (id === 'throw') || (id === 'const') || (id === 'yield') ||
                            (id === 'class') || (id === 'super');
                    case 6:
                        return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
                            (id === 'switch') || (id === 'export') || (id === 'import');
                    case 7:
                        return (id === 'default') || (id === 'finally') || (id === 'extends');
                    case 8:
                        return (id === 'function') || (id === 'continue') || (id === 'debugger');
                    case 10:
                        return (id === 'instanceof');
                    default:
                        return false;
                }
            },
            //检查是否标识符中一部分
            codePointAt: function(cp) {
                if (cp >= 0xD800 && cp <= 0xDBFF) {
                    var second = this.source.charCodeAt(i + 1);
                    if (second >= 0xDC00 && second <= 0xDFFF) {
                        cp = (cp - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
                    }
                }
                return cp;
            }
        };

        //语法原子类型
        var atomType = {
            //空
            Null: 'Null',
            //字符
            String: 'String',
            //关键字
            Keyword: 'Keyword',
            //布尔
            Boolean: 'Boolean',
            //数字
            Numeric: 'Numeric',
            //符号
            Punctuator: 'Punctuator',
            //标识符
            identifier: 'identifier'
        }

        //语法解析
        function syntaxParserClass(code) {
            //代码资源
            this.source = code;
            //代码长度
            this.length = code.length;
            //扫描索引
            this.index = 0;
            //原子存储器
            this.atoms = [];
            //语法块队列存储
            this.expBlockEnd = [];
            //表达式参数记录
            this.arguments = [];
            //表达式层级参数
            this.levelArgs = [this.arguments];
            //语法表达式结构
            this.expStruct = null;
            //语法表达式处理临时数据
            this.expTemp = {
                valueType: null,
                valueExp: null
            }
            //错误信息
            this.errMsg = null;
            //表达式扫描
            this.expressionLex();

            //检查语法是否完整
            if (this.expBlockEnd.length && !this.errMsg) {
                this.throwErr('表达式不完整缺少' + this.expBlockEnd.length + '个闭合符号 ' + this.expBlockEnd.join(' , '))
            }
        };

        //获取预处理的元素
        syntaxParserClass.prototype.getSoonAtom = function() {
            var atom = this.soonAtom;
            delete this.soonAtom;
            return atom
        }

        //获取后面的表达式
        syntaxParserClass.prototype.nextExpressionLex = function(atom, isAdopt) {
            this.expStruct = null;
            this.expTemp.valueType = null;
            return this.expressionLex(atom, isAdopt);
        }

        //语法块结束符号添加
        syntaxParserClass.prototype.addBlockEnd = function(symbol) {
            this.expBlockEnd.push(symbol);
            //表达式层级参数
            this.levelArgs.push(this.arguments = []);
        }

        //表达式连接属性获取
        syntaxParserClass.prototype.getExpAttr = function(strcut, isBefore) {
            isBefore = isBefore === undefined ? true : isBefore;

            //表达式类型处理
            switch (strcut.exp) {
                //自运算
                case 'UpdateExpression':
                    //一元表达式
                case 'UnaryExpression':
                    return 'argment';
                    //二元表达式
                case 'BinaryExpression':
                    return isBefore ? 'left' : 'right';
                    //三元表达式
                case 'TernaryExpression':
                    return isBefore ? 'condition' : 'mismatch';
                    //成员表达式
                case 'MemberExpression':
                    return isBefore ? 'object' : 'property';
                    //数组表达式
                case 'ArrayExpression':
                    //对象表达式
                case 'ObjectExpression':
                    return 'self';
                    //执行运算
                case 'CallExpression':
                    return 'callee';
                    //分配运算
                case 'AssignmentExpression':

                    break;
                    //过滤器表达式
                case 'FilterExpression':
                    return 'lead';
                    break;
            }
        }

        //表达式连接
        syntaxParserClass.prototype.expConcat = function(strcut, expStruct) {
            if (!strcut) {
                return expStruct;
            }
            //连接当前表达式处理
            if (expStruct === undefined && this.expStruct) {
                expStruct = strcut;
                strcut = this.expStruct;
            }

            if (expStruct) {
                var attr;
                //检查是否表达式结构
                if (expStruct.exp) {
                    //对比前后两个表达式的优先级
                    if (!(strcut.exp && expStruct.priority < strcut.priority)) {
                        attr = this.getExpAttr(expStruct);
                        expStruct[attr] = this.expConcat(strcut, expStruct[attr]);
                        return expStruct;
                    }
                } else if (!strcut.exp) {
                    return strcut;
                }
                attr = this.getExpAttr(strcut, false);
                strcut[attr] = this.expConcat(strcut[attr], expStruct);
            }
            return strcut;
        }

        //语法表达式扫描
        syntaxParserClass.prototype.expressionLex = function(atom, isAdopt) {
            //检查语法是否出错
            if (this.errMsg) return;

            if (!atom) {
                if (this.soonAtom) {
                    atom = this.getSoonAtom();
                } else {
                    atom = this.atomLex();
                }
            }

            if (!atom) return;

            isAdopt = isAdopt === undefined ? true : isAdopt;

            var struct,
                nextAtom,
                brackets,
                args = this.arguments,
                expTemp = this.expTemp;

            //检查表达式值类型
            switch (expTemp.valueType) {

                //内存量（内部定义的数组、对象）
                case 'memory':
                    //字面量
                case 'literal':
                    //标识量
                case 'identifier':
                    if (atom.value === '.' || atom.value === '[') {
                        struct = this.expMember(atom, expTemp);
                        nextAtom = this.getSoonAtom();
                        break;
                    }
                    if (expTemp.valueType !== 'literal') {
                        if (atom.identity === 'assignment') {
                            struct = this.expAssignment(atom, expTemp);
                            break;
                        }
                    }
                case atomType.Null:
                case atomType.String:
                case atomType.Numeric:
                case atomType.Boolean:
                    switch (atom.type) {
                        case atomType.Punctuator:
                            switch (atom.identity) {
                                //二元运算符
                                case 'single':
                                case 'complex':
                                case 'logical':
                                case 'bitwise':
                                    struct = this.expBinary(atom, expTemp);
                                    break;
                                    //三元运算
                                case 'interrogation':
                                    struct = this.expTernary(atom, expTemp);
                                    break;
                                    //自运算
                                case 'update':
                                    struct = this.expUpdateAfter(atom, expTemp);
                                    break;
                                    //过滤运算
                                case 'filter':
                                    struct = this.expFilter(atom, expTemp);
                                    break;
                                    //逗号
                                case 'comma':
                                    //检查是否对象表达式模式
                                    if (this.expMode === 'Object') {
                                        //获取当前参数 并进行对象拼接
                                        if (struct = args[args.length - 1]) {
                                            struct.value = this.expStruct;
                                            expTemp.valueType = null;
                                            this.expStruct = null;
                                        }
                                        break;
                                    }

                                    args.push(this.expStruct);
                                    this.nextExpressionLex();

                                    //检查当前语法是否结束
                                    if (args[args.length - 1] !== this.expStruct) {
                                        args.push(this.expStruct);
                                    } else {
                                        //块级表达式结束
                                    }
                                    break;
                                    //分号
                                case 'semicolon':
                                    break;
                                    //冒号
                                case 'colon':
                                    //检查是否对象表达式模式
                                    if (this.expMode === 'Object') {
                                        //检查是否以括号为key
                                        if (expTemp.brackets) {
                                            if (expTemp.brackets !== 2) {
                                                return this.throwErr('语法错误，对象表达式key有误!')
                                            }
                                            if (this.expStruct.arguments.length === 1) {
                                                //记录当前匹配的对象属性
                                                args.push({
                                                    computed: true,
                                                    key: this.expStruct.arguments[0]
                                                });
                                            } else {
                                                return this.throwErr('语法错误，对象表达式key有误!');
                                            }

                                        } else {
                                            //记录当前匹配的对象属性
                                            args.push({
                                                computed: false,
                                                key: this.expStruct
                                            });
                                        }
                                        this.nextExpressionLex();
                                        return;
                                    }
                                    //用于判断是否执行表达式
                                case "bracketsLeft":
                                    //右括号
                                case "bracketsRight":
                                    //检查是否能匹配语法块结束符号
                                    if (this.expBlockEnd.length && this.expBlockEnd.pop() === atom.value) {
                                        this.arguments = this.levelArgs.pop();
                                        break;
                                    }
                                default:
                                    this.throwErr('语法错误,多出符号"' + atom.value + '"');
                                    break;
                            }
                            break;
                        default:
                            this.throwErr('语法表达式错误 ')
                    }
                    break;
                default:

                    //元素类型
                    switch (atom.type) {
                        case atomType.Punctuator:
                            switch (atom.identity) {
                                //一元运算符
                                case "unitary":
                                case "single":
                                    struct = this.expUnary(atom, expTemp);
                                    nextAtom = this.getSoonAtom();
                                    break;
                                    //分号
                                case "semicolon":
                                    break;
                                    //自运算
                                case "update":
                                    struct = this.expUpdate(atom, expTemp);
                                    nextAtom = this.getSoonAtom();
                                    break;
                                    //左括号 块级表达式
                                case "bracketsLeft":

                                    switch (atom.value) {
                                        //小括号
                                        case '(':
                                            //记录表达式模式
                                            var expMode = this.expMode;

                                            this.expMode = 'brackets';
                                            this.addBlockEnd(')');
                                            this.expressionLex();

                                            this.expMode = expMode;

                                            //恢复当前参数
                                            this.arguments = this.levelArgs[this.levelArgs.length - 1];

                                            //检查后续语法是否运算表达式
                                            if (this.expStruct.exp) {
                                                this.expStruct.priority = 1;
                                            }
                                            brackets = 1;
                                            struct = this.expStruct;

                                            nextAtom = this.atomLex();
                                            if (nextAtom) {
                                                //检查是否方法
                                                if (nextAtom.value === '(') {
                                                    struct = this.expCall(nextAtom, expTemp);
                                                    nextAtom = this.getSoonAtom();
                                                    break;
                                                }
                                            }

                                            //中括号
                                        case '[':
                                            if (!struct) {
                                                brackets = 2;
                                                struct = this.expArray(atom, expTemp);
                                            }
                                            //大括号
                                        case '{':
                                            if (!struct) {
                                                brackets = 3;
                                                struct = this.expObject(atom, expTemp);
                                            }

                                            nextAtom = nextAtom || this.atomLex();
                                            //检查是否后续是点或中括号来判断成员表达式
                                            if (nextAtom && (nextAtom.value === '[' || nextAtom.value === '.')) {
                                                this.expressionLex(nextAtom, false);
                                                nextAtom = this.getSoonAtom();
                                            }
                                            break;
                                    }
                                    break;
                                    //右括号
                                case "bracketsRight":
                                    //检查是否能匹配语法块结束符号
                                    if (this.expBlockEnd.length && this.expBlockEnd.pop() === atom.value) {
                                        this.arguments = this.levelArgs.pop();
                                        brackets = atom.value;
                                        break;
                                    }
                                default:
                                    this.throwErr('语法表达式错误,未知表达式')
                            }
                            break;
                            //字面量
                        case atomType.Null:
                        case atomType.String:
                        case atomType.Numeric:
                        case atomType.Boolean:
                            struct = this.expStruct = atom;
                            expTemp.valueType = atom.type;
                            break;
                            //标识量
                        case atomType.Keyword:
                        case atomType.identifier:
                            struct = this.expStruct = atom;
                            expTemp.valueType = 'identifier';

                            nextAtom = this.atomLex();

                            if (nextAtom) {
                                switch (nextAtom.value) {
                                    case '[':
                                    case '.':
                                        this.expressionLex(nextAtom, false);
                                        nextAtom = this.getSoonAtom();
                                        break;
                                        //检查是否方法
                                    case '(':
                                        struct = this.expCall(nextAtom, expTemp);
                                        nextAtom = this.getSoonAtom();
                                }
                            }
                            break;
                        default:
                            this.throwErr('未知表达式!')
                    }
            }

            //检查当前的表达式是否属于括号表达式
            if (brackets) {
                expTemp.brackets = brackets;
            } else {
                delete expTemp.brackets;
            }

            if (isAdopt && struct) {
                struct = this.expressionLex(nextAtom);
            } else {
                this.soonAtom = nextAtom;
            }
            return struct;
        };

        /*
         * UnaryExpression 一元表达式
         * BinaryExpression 二元表达式
         * TernaryExpression 三元表达式
         * UpdateExpression 自运算
         * AssignmentExpression 分配运算
         * MemberExpression 成员表达式
         * ArrayExpression 数组表达式
         * ObjectExpression 对象表达式
         * CallExpression 方法执行表达式
         * FilterExpression 过滤器表达式
         * */

        //表达式规则
        (function(expression) {

            //一元表达式
            expression.expUnary = function(atom, expTemp) {
                var struct = {
                        argment: null,
                        operator: atom.value,
                        priority: 3,
                        exp: 'UnaryExpression'
                    },
                    nextAtom = this.atomLex();

                var tmpStruct = this.expConcat(struct);

                this.nextExpressionLex(nextAtom, false);

                if (!this.expStruct) return this.throwErr('一元运算表达式不完整！');

                //继续检查后续表达式 并 表达式连接
                this.expStruct = this.expConcat(tmpStruct);

                expTemp.valueType = 'literal';
                return struct;
            }

            //二元表达式
            expression.expBinary = function(atom, expTemp) {
                //保存当前的表达式
                var nowStruct = this.expStruct,
                    nextAtom = this.atomLex();

                //获取下一个语法表达式
                this.nextExpressionLex(nextAtom, false);

                var struct = {
                    left: null,
                    right: null,
                    operator: atom.value,
                    priority: atom.priority,
                    exp: 'BinaryExpression'
                };

                if (!nextAtom) return this.throwErr('二元运算语法错误，右侧表达式不存在！');

                //连接之前的表达式
                var tmpStruct = this.expConcat(nowStruct, struct);

                if (!expTemp.valueType) return this.throwErr('二元表达式，右侧语法错误！', atom);

                //继续检查后续表达式 并 表达式连接
                this.expStruct = this.expConcat(tmpStruct, this.expStruct);

                expTemp.valueType = 'literal';
                return struct;
            }

            //三元表达式
            expression.expTernary = function(atom, expTemp) {
                var struct = {
                    accord: null,
                    mismatch: null,
                    condition: this.expStruct,
                    operator: atom.value,
                    priority: atom.priority,
                    exp: 'TernaryExpression'
                };

                this.addBlockEnd(':');

                this.nextExpressionLex();
                struct.accord = this.expStruct;

                //继续检查后续表达式并连接
                this.nextExpressionLex();

                struct.mismatch = this.expStruct;

                expTemp.valueType = 'literal'

                return this.expStruct = struct;
            }

            //自运算
            expression.expUpdate = function(atom, expTemp) {
                var struct = {
                        argment: null,
                        prefix: true,
                        operator: atom.value,
                        priority: atom.priority,
                        exp: 'UpdateExpression'
                    },
                    nextAtom = this.atomLex();

                //继续检查后续表达式
                this.expressionLex(nextAtom, false);

                //检查之后的表达式值类型是否标识量
                if (expTemp.valueType === 'identifier') {
                    struct.argment = this.expStruct;
                    expTemp.valueType = 'literal';
                    return this.expStruct = struct;
                }

                return this.throwErr('自运算后面应该是标识量!', atom);
            }

            //后自运算
            expression.expUpdateAfter = function(atom, expTemp) {

                //检查语法是否符合后自运算
                function checkExpression(expStruct) {
                    switch (expStruct.exp) {
                        case 'BinaryExpression':
                            return checkExpression(expStruct.right);
                        case 'MemberExpression':
                            return expStruct;
                        case 'UnaryExpression':
                            return checkExpression(expStruct.argment);
                        default:
                            switch (expStruct.type) {
                                case atomType.Keyword:
                                case atomType.identifier:
                                    return expStruct.right;
                                default:
                                    return expTemp.valueType === 'identifier';
                            }
                    }
                    return false;
                }

                //检查当前语法
                if (!checkExpression(this.expStruct)) {
                    return this.throwErr('后自运算表达式有误!', atom);
                }

                var struct = {
                    argment: null,
                    prefix: false,
                    operator: atom.value,
                    priority: atom.priority,
                    exp: 'UpdateExpression'
                };

                this.expStruct = this.expConcat(struct);
                return struct;
            }

            //成员表达式
            expression.expMember = function(atom, expTemp) {
                var struct = {
                        object: null,
                        property: null,
                        priority: 1,
                        computed: false,
                        exp: 'MemberExpression'
                    },
                    nextAtom = this.atomLex(),
                    expStruct = this.expStruct;

                switch (atom.value) {
                    case '.':
                        switch (nextAtom.type) {
                            //标识量
                            case atomType.Keyword:
                            case atomType.identifier:
                                struct.property = nextAtom;
                                break;
                            default:
                                return this.throwErr('成员表达式语法错误')
                        }
                        break;
                    case '[':
                        struct.computed = true;

                        this.addBlockEnd(']');

                        this.nextExpressionLex(nextAtom);


                        //还原当前处理的arguments
                        this.arguments = this.levelArgs[this.levelArgs.length - 1];

                        struct.property = this.expStruct;
                        break;
                }

                expTemp.valueType = 'identifier'
                //表达式拼接
                this.expStruct = this.expConcat(expStruct, struct);

                if (nextAtom = this.atomLex()) {
                    //检查是否后续是点或中括号来判断成员表达式
                    if (nextAtom.value === '.' || nextAtom.value === '[') {
                        struct = this.expMember(nextAtom, expTemp);
                    } else {

                        //检查是否方法
                        if (nextAtom.value === '(') {
                            struct = this.expCall(nextAtom, expTemp);
                        } else {
                            this.soonAtom = nextAtom;
                        }
                    }
                }
                return struct;
            }

            //数组表达式
            expression.expArray = function(atom, expTemp) {
                var struct = {
                        arguments: null,
                        exp: 'ArrayExpression',
                        priority: 1
                    },
                    expMode = this.expMode;


                //连接之前的表达式
                var tmpStruct = this.expConcat(this.expStruct, struct);

                this.expMode = 'Array';

                this.addBlockEnd(']');
                this.nextExpressionLex();

                if (this.arguments.length) {
                    struct.arguments = this.arguments;
                    //防止最后一个元素是空表达式
                    var last = struct.arguments.pop();
                    if (last) {
                        struct.arguments.push(last);
                    }
                } else {
                    struct.arguments = this.expStruct ? [this.expStruct] : [];
                }

                //还原当前处理的arguments
                this.arguments = this.levelArgs[this.levelArgs.length - 1];

                expTemp.valueType = 'memory';
                this.expStruct = tmpStruct;
                this.expMode = expMode;

                return struct;
            }

            //对象表达式
            expression.expObject = function(atom, expTemp) {
                var struct = {
                    property: [],
                    exp: 'ObjectExpression',
                    priority: 1
                };

                //连接之前的表达式
                var tmpStruct = this.expConcat(this.expStruct, struct),
                    expMode = this.expMode;

                expTemp.valueType = null;
                this.expStruct = null;

                this.addBlockEnd('}');

                //进入对象表达式状态
                this.expMode = 'Object';

                this.nextExpressionLex();

                //进行属性拼接
                if (this.arguments) {
                    struct.property = this.arguments;
                    //防止对象中最后遗留逗号
                    if (this.expStruct) {
                        var argLen = this.arguments.length;
                        if (argLen !== 0) {
                            this.arguments[argLen - 1].value = this.expStruct
                        }
                    }
                }

                expTemp.valueType = 'memory';
                this.expStruct = tmpStruct;

                this.expMode = expMode;
                return struct;
            }

            //方法执行表达式
            expression.expCall = function(atom, expTemp) {

                //检查方法表达式
                if (expTemp.valueType !== 'identifier' && this.expStruct.exp !== 'CallExpression') return this.throwErr('表达式不是一个方法！');

                var errMsg,
                    brackets = expTemp.brackets,
                    errAtom = this.atoms[this.atoms.length - 3];

                switch (expTemp.valueType) {
                    case 'memory':
                        errMsg = this.expStruct.exp + ' ';
                    case atomType.Null:
                        errMsg = errMsg || '空: ' + errAtom.value;
                    case atomType.String:
                        errMsg = errMsg || '字符串: ' + errAtom.value;
                    case atomType.Numeric:
                        errMsg = errMsg || '数字: ' + errAtom.value;
                    case atomType.Boolean:
                        errMsg = errMsg || '布尔值: ' + errAtom.value;
                        return this.throwErr('语法错误，' + errMsg + ' 不是一个方法!', errAtom)
                }
                expTemp.brackets = 4;

                var struct = {
                        exp: 'CallExpression',
                        arguments: [],
                        priority: 1,
                        callee: null
                    },
                    expMode = this.expMode,
                    tmpStruct = this.expConcat(struct);

                this.expMode = 'Call';

                this.addBlockEnd(')');
                this.nextExpressionLex();

                if (this.arguments.length) {
                    struct.arguments = this.arguments;
                    //防止最后一个元素是空表达式
                    var last = struct.arguments.pop();
                    if (last) {
                        struct.arguments.push(last);
                    }
                } else {
                    struct.arguments = this.expStruct ? [this.expStruct] : [];
                }

                //还原当前处理的arguments
                this.arguments = this.levelArgs[this.levelArgs.length - 1];

                expTemp.valueType = 'literal';
                this.expStruct = tmpStruct;
                this.expMode = expMode;
                expTemp.brackets = brackets;

                var nextAtom = this.atomLex();

                if (nextAtom) {
                    if (nextAtom.value === '.' || nextAtom.value === '[') {
                        struct = this.expMember(nextAtom, expTemp);
                    } else {
                        this.soonAtom = nextAtom;
                    }
                }

                return struct;
            }

            //分配表达式
            expression.expAssignment = function(atom, expTemp) {
                var struct = {
                    exp: 'AssignmentExpression',
                    value: null,
                    identifier: this.expStruct,
                    operator: atom.value,
                    priority: atom.priority
                };

                this.nextExpressionLex();
                struct.value = this.expStruct;

                return this.expStruct = struct;
            }

            //过滤表达式
            expression.expFilter = function(atom, expTemp) {
                var struct = {
                        exp: 'FilterExpression',
                        arguments: [],
                        operator: atom.value,
                        priority: atom.priority,
                        callee: null,
                        lead: null
                    },
                    tmpStruct = this.expConcat(struct);

                this.nextExpressionLex(this.atomLex(), false);

                if (this.expStruct.exp) {
                    switch (this.expStruct.exp) {
                        case 'MemberExpression':
                            struct.callee = this.expStruct;
                            break;
                        case 'CallExpression':
                            struct.callee = this.expStruct.callee;
                            struct.arguments = this.expStruct.arguments;
                            break;
                        default:
                            return this.throwErr('过滤器表达式错误!')
                    }
                } else {
                    switch (this.expStruct.type) {
                        case atomType.Keyword:
                        case atomType.identifier:
                            struct.callee = this.expStruct;
                            break;
                        default:
                            return this.throwErr('过滤器数据类型错误!')
                    }
                }

                this.expStruct = tmpStruct;
                tmpStruct.valueType = 'literal';

                return struct;
            }


        })(syntaxParserClass.prototype);

        //原子扫描
        syntaxParserClass.prototype.atomLex = function() {
            if (this.eof()) return

            //语法原子
            var atom,
                //获取扫描位置的 Unicode 编码
                cp = this.source.charCodeAt(this.index);

            //检查是否标识符起始字符
            if (strGate.isidentifierStart(cp)) {
                atom = this.identifierLex();
                //检查是否小括号与分号
            } else if (cp === 0x28 || cp === 0x29 || cp === 0x3B) {
                //符号扫描
                atom = this.PunctuatorLex();
                // 字符串文字开始与单引号（U + 0027）或双引号（U + 0022）
            } else if (cp === 0x27 || cp === 0x22) {
                //字符串扫描
                atom = this.StringLiteralLex();
                //字符点可以作为浮点数，因此需要检查下一个字符
            } else if (cp === 0x2E) {
                //检查下一个字符是否数字
                if (strGate.isDecimalDigit(this.source.charCodeAt(this.index + 1))) {
                    //数字扫描
                    atom = this.NumericLiteralLex();
                } else {
                    //符号扫描
                    atom = this.PunctuatorLex();
                }
                //检查是否数字字符
            } else if (strGate.isDecimalDigit(cp)) {
                //数字扫描
                atom = this.NumericLiteralLex();
                //标识符起始字符范围 检查是否标识符起始字符
            } else if (cp >= 0xD800 && cp < 0xDFFF && strGate.isidentifierStart(strGate.codePointAt(cp))) {
                //标识符扫描
                atom = this.identifierLex();
                //检查是否空字符
            } else if (strGate.isWhiteSpace(cp)) {
                this.index++;
                return this.atomLex();
            } else {
                //符号扫描
                atom = this.PunctuatorLex();
            }

            //之前的元素
            this.preAtom = this.nowAtom;

            //当前元素
            this.nowAtom = atom;

            if (!atom) return;

            this.atoms.push(atom);
            return atom;
        };

        //原子类型扫描
        (function(scan) {

            // 标识符
            scan.identifierLex = function() {
                var ch,
                    type,
                    start = this.index++;

                while (!this.eof()) {
                    if (strGate.isidentifierPart(this.source.charCodeAt(this.index))) {
                        ++this.index;
                    } else {
                        break
                    }
                }

                var id = this.source.slice(start, this.index);

                //只有一个字符，因此它必定是标识符。
                if (id.length === 1) {
                    type = atomType.identifier;
                    //关键字
                } else if (strGate.isKeyword(id)) {
                    type = atomType.Keyword;
                    //空
                } else if (id === 'null') {
                    type = atomType.Null;
                    //布尔值
                } else if (id === 'true' || id === 'false') {
                    type = atomType.Boolean;
                    //标识符
                } else {
                    type = atomType.identifier;
                }

                return {
                    type: type,
                    value: id,
                    start: start,
                    end: this.index
                };
            };

            /*
             * dot 点号 1
             * unitary 一元运算符 3
             * single 加减运算 5
             * complex 乘除 乘方 运算 4
             * logical 逻辑运算 7
             * bitwise 位运算 6
             * ternary 三元运算 8
             * comma 逗号 1
             * semicolon 分号 1
             * colon 冒号 8
             * interrogation 问号 8
             * bracketsLeft 左括号 2
             * bracketsRight 右括号 2
             * keySymbol 关键符号 8
             * assignment 分配运算 8
             * update 自运算  2
             * filter 3 过滤运算
             * */

            //标点
            scan.PunctuatorLex = function() {
                var identity,
                    priority,
                    start = this.index;

                //获取当前字符
                var str = this.source[this.index++];

                switch (str) {
                    case '{':
                    case '[':
                    case '(':
                        priority = 2;
                        identity = 'bracketsLeft';
                        break;
                    case '}':
                    case ']':
                    case ')':
                        priority = 2;
                        identity = 'bracketsRight';
                        break;
                    case '.':
                        priority = 1;
                        identity = 'dot'
                        if (this.source[this.index] === '.' && this.source[this.index + 1] === '.') {
                            // ...符号
                            this.index += 2;
                            str = '...';
                            priority = 9;
                            identity = 'keySymbol'
                        }
                        break;
                    case ';':
                        priority = 1;
                        identity = 'semicolon';
                        break;
                    case ',':
                        priority = 1;
                        identity = 'comma';
                        break;
                    case ':':
                        priority = 8;
                        identity = 'colon';
                        break;
                    case '?':
                        priority = 8;
                        identity = 'interrogation';
                        break;
                    case '~':
                        priority = 3;
                        identity = 'unitary';
                        break;
                    default:
                        // 4个字符长度的符号
                        str = this.source.substr(--this.index, 4);
                        if (str === '>>>=') {
                            this.index += 4;
                            priority = 9;
                            identity = 'assignment';
                        } else {
                            // 3个字符长度的符号
                            str = str.substr(0, 3);
                            this.index += 3;

                            switch (str) {
                                case '===':
                                case '!==':
                                    priority = 7;
                                    identity = 'logical';
                                    break;
                                case '>>>':
                                    priority = 6;
                                    identity = 'bitwise';
                                    break;
                                case '<<=':
                                case '>>=':
                                case '**=':
                                    priority = 9;
                                    identity = 'assignment';
                                    break;
                                default:
                                    // 2个字符长度的符号
                                    str = str.substr(0, 2);
                                    this.index--;

                                    switch (str) {
                                        case '||':
                                        case '&&':
                                        case '==':
                                        case '!=':
                                        case '<=':
                                        case '>=':
                                            priority = 7;
                                            identity = 'logical';
                                            break;
                                        case '++':
                                        case '--':
                                            priority = 2;
                                            identity = 'update';
                                            break;
                                        case '<<':
                                        case '>>':
                                            priority = 6;
                                            identity = 'bitwise';
                                            break;
                                        case '/=':
                                        case '+=':
                                        case '-=':
                                        case '*=':
                                        case '&=':
                                        case '|=':
                                        case '^=':
                                        case '%=':
                                            priority = 9;
                                            identity = 'assignment';
                                            break;
                                        case '**':
                                            priority = 4;
                                            identity = 'complex';
                                            break;
                                        case '=>':
                                            priority = 9;
                                            identity = 'keySymbol';
                                            break;
                                            //过滤运算符号
                                        case '|:':
                                            priority = 3;
                                            identity = 'filter';
                                            break;
                                        default:
                                            this.index -= 2;
                                            // 1个字符长度的符号
                                            str = this.source[this.index++];

                                            switch (str) {
                                                case '<':
                                                case '>':
                                                    priority = 7;
                                                    identity = 'logical';
                                                    break;
                                                case '=':
                                                    priority = 9;
                                                    identity = 'assignment';
                                                    break;
                                                case '+':
                                                case '-':
                                                    priority = 5;
                                                    identity = 'single';
                                                    break;
                                                case '*':
                                                case '/':
                                                case '%':
                                                    priority = 4;
                                                    identity = 'complex';
                                                    break;
                                                case '&':
                                                case '|':
                                                case '^':
                                                    priority = 6;
                                                    identity = 'bitwise';
                                                    break;
                                                case '!':
                                                    priority = 3;
                                                    identity = 'unitary';
                                                    break;
                                                default:
                                                    this.index--
                                            }
                                    }
                            }
                        }
                }

                if (this.index === start) {
                    return this.throwErr('标点错误');
                }
                return {
                    type: atomType.Punctuator,
                    value: str,
                    start: start,
                    end: this.index,
                    identity: identity,
                    priority: priority
                };
            }

            //字符
            scan.StringLiteralLex = function() {
                var start = this.index;
                var quote = this.source[start];
                if (!(quote === '\'' || quote === '"')) {
                    return this.throwErr('String literal must starts with a quote');
                }

                ++this.index;
                var str = '';
                while (!this.eof()) {
                    var ch = this.source[this.index++];
                    //检查是否起始字符串引号
                    if (ch === quote) {
                        quote = '';
                        break;
                        //检查是否行结束字符
                    } else if (strGate.isLineTerminator(ch.charCodeAt(0))) {
                        break;
                    } else {
                        str += ch;
                    }
                }

                if (quote !== '') {
                    this.index = start;
                    return this.throwErr('字符语法错误，没有找到关闭的引号！');
                }

                return {
                    type: atomType.String,
                    value: str,
                    start: start,
                    end: this.index
                };
            }

            //数字
            scan.NumericLiteralLex = function() {
                var start = this.index;
                var ch = this.source[start];

                //检查是否数字或小数点开头
                if (!(strGate.isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'))) {
                    return this.throwErr('数字文字必须以十进制数字或小数点开始')
                }

                var num = '';

                //检查字符是否以小数点开头
                if (ch === '.') {
                    num += this.source[this.index++];
                    while (strGate.isDecimalDigit(this.source.charCodeAt(this.index))) {
                        num += this.source[this.index++];
                    }
                } else {
                    num = this.source[this.index++];
                    //遍历获取后续字符并判断是否数字
                    while (strGate.isDecimalDigit(this.source.charCodeAt(this.index))) {
                        num += this.source[this.index++];
                    }
                }

                //检查数字后续字符是否标识符开始
                if (strGate.isidentifierStart(this.source.charCodeAt(this.index))) {
                    this.throwErr('Number类型语法错误!');
                }
                return {
                    type: atomType.Numeric,
                    value: parseFloat(num),
                    start: start,
                    end: this.index
                };
            }

        })(syntaxParserClass.prototype);


        //检查扫描是否结束
        syntaxParserClass.prototype.eof = function() {
            return this.index >= this.length;
        };

        //错误抛出
        syntaxParserClass.prototype.throwErr = function(msg, atom) {
            this.errMsg = msg;
            atom = atom || this.preAtom;
            console.warn(msg + ' [ 第' + (atom.start + 1) + '个字符 ]');
        }

        //语法缓存
        var syntaxCache = {};

        module.exports = function syntaxParser(code) {
            //获取缓存
            var syntaxStruct = syntaxCache[code];
            if (!syntaxStruct) {
                //无缓存则解析，并放入缓存
                syntaxStruct = new syntaxParserClass(code);
                syntaxCache[code] = syntaxStruct.expStruct;

                //销毁对象
                Object.keys(syntaxStruct).forEach(function(key) {
                    delete syntaxStruct[key];
                })
                syntaxStruct = syntaxCache[code];
            }
            return syntaxStruct;
        }
    }, {}],
    21: [function(require, module, exports) {
        /**
         * 虚拟Dom
         * Created by xiyuan on 17-5-9.
         */
        "use strict";

        var cbs = {}

        //语法结构处理
        var syntaxHandle = require('./syntaxHandle');

        var observer = require('../../../inside/lib/observer');

        //钩子类型
        var hooks = ['init', 'create', 'update', 'remove', 'destroy', 'pre', 'post'];

        //空节点
        var emptyNode = vnode('', {}, [], undefined, undefined);

        var htmlDomApi = {
            createElement: function createElement(tagName) {
                return document.createElement(tagName);
            },
            createElementNS: function createElementNS(namespaceURI, qualifiedName) {
                return document.createElementNS(namespaceURI, qualifiedName);
            },
            createTextNode: function createTextNode(text) {
                return document.createTextNode(text);
            },
            createComment: function createComment(text) {
                return document.createComment(text);
            },
            insertBefore: function insertBefore(parentNode, newNode, referenceNode) {
                referenceNode = referenceNode instanceof Array ? referenceNode[0] : referenceNode;
                referenceNode = parentNode.contains(referenceNode) ? referenceNode : null;
                newNode instanceof Array ? newNode.forEach(function(child, key) {
                    parentNode.insertBefore(child, referenceNode);
                }) : parentNode.insertBefore(newNode, referenceNode);
            },
            removeChild: function removeChild(node, child) {
                if (!node) return
                child instanceof Array ? child.forEach(function(child) {
                    node.removeChild(child);
                }) : node.removeChild(child);
            },
            appendChild: function appendChild(node, child) {
                child instanceof Array ? child.forEach(function(child) {
                    node.appendChild(child);
                }) : node.appendChild(child);
            },
            parentNode: function parentNode(node) {
                return (node instanceof Array ? node[0] : node).parentNode;
            },
            replaceChild: function(parentNode, newNode, oldNode) {
                var Rm;
                if (newNode instanceof Array) {
                    var doc = document.createDocumentFragment();
                    newNode.forEach(function(elm) {
                        doc.appendChild(elm)
                    })
                    newNode = doc;
                }

                if (oldNode instanceof Array) {
                    Rm = oldNode;
                    oldNode = Rm.shift();
                    Rm.forEach(function(elm) {
                        parentNode.removeChild(elm);
                    })
                }
                parentNode.replaceChild(newNode, oldNode);
            },
            nextSibling: function nextSibling(node) {
                return node && node.nextSibling;
            },
            tagName: function tagName(elm) {
                return elm.tagName;
            },
            setTextContent: function setTextContent(node, text) {
                node.textContent = text;
            },
            getTextContent: function getTextContent(node) {
                return node.textContent;
            },
            isElement: function isElement(node) {
                return node.nodeType === 1;
            },
            isText: function isText(node) {
                return node.nodeType === 3;
            },
            isComment: function isComment(node) {
                return node.nodeType === 8;
            }
        };

        var patch = init([compAndDirectiveInspect(), attributesModule(), classModule(), propsModule(), styleModule(), eventListenersModule()])

        //虚拟节点对象
        function $vnode(conf) {
            var $this = this;

            //配置继承
            Object.keys(conf).forEach(function(key) {
                $this[key] = conf[key];
            })
        }

        //节点克隆
        $vnode.prototype.clone = function() {

            var conf = {},
                scope = {},
                children = [],
                innerVnode = [],
                $this = this;

            var pros = ['$scope', 'children', 'elm', 'isShow', 'key', 'sel', 'tag', 'text', 'rootScope', 'isReplace', 'isComponent', 'isDirective', 'cid'];

            //收集所有的属性
            pros.forEach(function(key) {
                if ($this.hasOwnProperty(key)) {
                    conf[key] = $this[key];
                }
            })

            if (this.innerVnode instanceof Array && this.innerVnode.length) {
                // if(this.isReplace)conf.isReplace=true;
                //遍历并克隆内部节点
                this.innerVnode.forEach(function(ch) {
                    innerVnode.push(ch.clone())
                })
                conf.innerVnode = innerVnode;
            } else if (conf.elm instanceof Array) {
                conf.elm = undefined;
            }

            conf.data = function(data) {
                var tmp = {},
                    attrsMap = {};
                Object.keys(data).forEach(function(key) {
                    switch (key) {
                        case 'attrsMap':
                            if (data[key] instanceof Object) {
                                Object.keys(data[key]).forEach(function(attrName) {
                                    attrsMap[attrName] = data[key][attrName]
                                })
                            }
                            tmp[key] = attrsMap;
                            break
                        default:
                            tmp[key] = data[key];
                    }

                })
                return tmp;
            }($this.data);


            //检查是否文本 并克隆文本表达式
            if (isUndef(this.sel) && this.data && this.data.exps) {
                conf.data.exps = [];
                Object.keys(this.data.exps).forEach(function(key) {
                    conf.data.exps[key] = $this.data.exps[key];
                })
            }

            //继承作用域
            Object.keys($this.$scope || {}).forEach(function(key) {
                scope[key] = $this.$scope[key];
            })
            conf.$scope = scope;

            //继承中间作用域
            conf.middleScope = this.middleScope.concat();

            if (this.children) {
                this.children.forEach(function(ch) {
                    children.push(ch.clone())
                })
            }

            conf.children = children;
            conf.isClone = true;

            return new $vnode(conf);
        }

        //节点作用域传递
        $vnode.prototype.scope = function(scope) {
            var $this = this;
            if (scope instanceof Object) {
                Object.keys(scope).forEach(function(key) {
                    $this.$scope[key] = scope[key];
                })
            }
        }

        //将观察的数据转换成作用域
        $vnode.prototype.observerToScope = function(watchData, watchKey, scopeKey) {
            var $this = this,
                ob = observer(watchData);
            ob.readWatch(watchKey, function(data) {
                $this.$scope[scopeKey] = data;
            });
            return ob;
        }

        //节点销毁
        $vnode.prototype.destroy = function(type) {
            var $this = this;

            //检查是否文本
            if (isUndef(this.sel) && this.data && this.data.exps) {
                switch (type) {
                    case 'elm':
                    case false:
                        break;
                    default:
                        Object.keys(this.data.exps).forEach(function(key) {
                            if ($this.data.exps[key] instanceof Object) {
                                $this.data.exps[key].destroy();
                            }
                            delete $this.data.exps[key];
                        });

                        //销毁文本表达式
                        (this.data.exps || []).forEach(function(exp, index) {
                            if (exp.structRes) {
                                exp.destroy();
                            }
                            delete $this.data.exps[index];
                        });
                };

            }

            if (this.elm) {
                if (this.elm instanceof Array) {
                    switch (type) {
                        case false:
                            break;
                        case 'elm':
                        default:
                            (this.innerVnode || []).forEach(function(vnode, index) {
                                if (type !== 'elm') $this.elm.splice(0, 1);
                                delete $this.innerVnode[index];
                                vnode.destroy(type);
                            })
                    }

                } else if (this.elm.parentNode) {
                    switch (type) {
                        case false:
                            break;
                        case 'elm':
                        default:
                            //销毁子节点
                            if (this.children) {
                                this.children.forEach(function(ch, index) {
                                    delete $this.children[index];
                                    ch.destroy(type);
                                })
                            }
                    }
                }

                if (type !== 'elm') {
                    htmlDomApi.removeChild(this.elm.parentNode, this.elm);
                }
            }

            Object.keys(this.$scope || {}).forEach(function(key) {
                delete $this.$scope[key];
            })

            Object.keys(this.data || {}).forEach(function(key) {
                delete $this.data[key];
            })

            Object.keys(this).forEach(function(key) {
                delete $this[key];
            })
        }


        //虚拟节点构造
        function vnode(sel, data, children, text, elm) {

            var key = data === undefined ? undefined : data.key;
            var conf = {
                sel: sel,
                data: data || {},
                $scope: {},
                middleScope: [],
                rootScope: {},
                children: children,
                text: text,
                elm: elm,
                isShow: true,
                isComponent: false,
                isDirective: false,
                key: key
            };

            return new $vnode(conf);
        }

        //是否未定义
        function isUndef(s) {
            return s === undefined;
        }

        //是否定义
        function isDef(s) {
            return s !== undefined;
        }

        //是否元素
        function isElement(node) {
            return node.nodeType;
        }

        //检查是否原始类型数据
        function primitive(s) {
            return typeof s === 'string' || typeof s === 'number';
        }

        //检查是否数组
        function isArray(arr) {
            return Array.isArray(arr);
        }

        //检查两个虚拟节点是否相同
        function sameVnode(vnode1, vnode2) {
            return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
        }

        //检查是否虚拟节点
        function isVnode(vnode) {
            return vnode.hasOwnProperty('sel');
        }

        //创建key对索引的map
        function createKeyToOldIdx(children, beginIdx, endIdx) {
            var i, map = {},
                key, ch;
            //转换key对索引 map
            for (i = beginIdx; i <= endIdx; ++i) {
                ch = children[i];
                if (ch instanceof Object) {
                    key = ch.key;
                    if (key !== undefined) map[key] = i;
                }
            }
            return map;
        }

        //转换dom元素为虚拟节点
        function emptyNodeAt(elm) {
            var id = elm.id ? '#' + elm.id : '';
            var c = elm.className ? '.' + elm.className.split(' ').join('.') : '';
            return vnode(htmlDomApi.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
        }

        /**
         * 重新补丁
         * @param newVnode
         * @param oldVnode
         * @param parentElm
         */
        function rearrangePatch(newVnode, oldVnode, parentElm) {
            htmlDomApi.insertBefore(parentElm, newVnode.elm, oldVnode.elm);
            oldVnode.destroy();
        }

        //重新摆放列表元素
        function rearrangeElm(vnodeList) {
            var parentNode,
                nowEle,
                elmContainer = document.createDocumentFragment();

            vnodeList.forEach(function(vnode) {
                //检查是否需要重新摆放当前元素
                if (vnode.isShow) {
                    if (parentNode) {
                        htmlDomApi.insertBefore(parentNode, vnode.elm, nowEle.nextSibling);
                        nowEle = vnode.elm;
                    } else {
                        if (parentNode = vnode.elm.parentNode) {
                            htmlDomApi.insertBefore(parentNode, elmContainer, nowEle = vnode.elm)
                        } else {
                            elmContainer.appendChild(vnode.elm);
                        }
                    }
                } else {
                    vnode.destroy()
                }
            });

            return elmContainer.childNodes;
        }

        //连接字符表达式
        function concatTextExp(exps) {
            var texts = [];
            exps.forEach(function(exp, index) {
                if (exp instanceof Object) {
                    if (exp.structRes.resData !== undefined) texts.push(exp.structRes.resData);
                } else {
                    texts.push(exp);
                }
            })
            return texts.join('');
        }

        function init(modules) {
            var i, j;
            var api = htmlDomApi;

            //收集自定义模块中的钩子
            hooks.forEach(function(hookName) {
                cbs[hookName] = [];
                modules.forEach(function(module) {
                    var hook = module[hookName];
                    if (isDef(hook)) {
                        cbs[hookName].push(hook);
                    }
                })
            })

            //创建删除的钩子
            function createRmCb(ch, listeners, containerElm) {
                return function rmCb() {
                    if (--listeners === 0) {
                        ch.destroy();

                        //检查是否是innerVnode容器
                        if (containerElm) {
                            containerElm.elm = []
                            containerElm.innerVnode.forEach(function(vnode) {
                                containerElm.elm = containerElm.elm.concat(vnode.elm);
                            })
                        }
                    }
                };
            }

            //根据虚拟节点创建真实dom节点
            function createElm(vnode, insertedVnodeQueue, callback, extraParameters, parentNode) {
                var i,
                    isRearrange,
                    oldVnode,
                    rootScope,
                    innerFilter,
                    data = vnode.data || {},
                    initCount = cbs.init.length,
                    children = vnode.children,
                    sel = vnode.sel;

                if (innerFilter = vnode.innerFilter) {
                    Object.keys(extraParameters.filter).forEach(function(key) {
                        innerFilter[key] = extraParameters.filter[key];
                    })
                    extraParameters.filter = innerFilter;
                } else {
                    innerFilter = extraParameters.filter;
                }

                //检查并传递作用域
                if (parentNode) {
                    if (innerFilter = parentNode.innerFilter) {
                        Object.keys(extraParameters.filter).forEach(function(key) {
                            innerFilter[key] = extraParameters.filter[key];
                        })
                    } else {
                        innerFilter = extraParameters.filter;
                    }

                    //检查是否独立作用域
                    if (parentNode.innerScope) {
                        rootScope = parentNode.innerScope;
                        extraParameters = {
                            scope: rootScope,
                            filter: innerFilter
                        }

                    } else {
                        rootScope = parentNode.rootScope;
                        //由父节点传递作用域给子级
                        if (parentNode instanceof Object) {
                            Object.keys(parentNode.$scope || {}).length && vnode.middleScope.push(parentNode.$scope)
                        }
                    }
                } else {
                    rootScope = extraParameters.scope;
                }

                vnode.rootScope = rootScope;

                if (isDef(sel)) {
                    // 解析选择器

                    //获取ID起始位置
                    var hashIdx = sel.indexOf('#');

                    //获取Class起始位置
                    var dotIdx = sel.indexOf('.', hashIdx);

                    var hash = hashIdx > 0 ? hashIdx : sel.length;
                    var dot = dotIdx > 0 ? dotIdx : sel.length;

                    //获取标签
                    vnode.tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;

                    //获取元素ID
                    if (hash < dot)
                        vnode.id = sel.slice(hash + 1, dot);

                    //获取元素Class
                    if (dotIdx > 0)
                        vnode.className = sel.slice(dot + 1).replace(/\./g, ' ');
                }

                //初始化创建
                function initCreate() {
                    var isElm = undefined;
                    if (initCount && --initCount) return
                    //检查当前元素是否替换成innerVnode
                    if (vnode.isReplace) {
                        switch (true) {
                            case vnode.innerVnode instanceof Element:
                                vnode.elm = vnode.innerVnode;
                                vnode.innerVnode = [];
                                break;
                            case typeof vnode.innerVnode === 'string':
                                vnode.innerVnode = module.exports.html2vdom(vnode.innerVnode);
                            case vnode.innerVnode instanceof Array:
                            case vnode.innerVnode instanceof Object:

                                if (!(vnode.innerVnode instanceof Array)) {
                                    vnode.innerVnode = [vnode.innerVnode];
                                }

                                //检查节点是否被渲染，此处需要做元素对比
                                if (vnode.elm && vnode.elm.length) {
                                    patch(oldVnode, vnode, rootScope, extraParameters.filter, parentNode);

                                    //销毁对象但不销毁元素
                                    oldVnode.destroy('elm');
                                    oldVnode = vnode.clone();
                                    return;
                                } else {

                                    vnode.elm = [];
                                    vnode.innerVnode.forEach(function(ch) {

                                        //重新定位内部作用域
                                        if (!ch.innerScope && !vnode.innerScope && vnode.isComponent) {
                                            ch.innerScope = ch.$scope
                                        }

                                        createElm(ch, insertedVnodeQueue, function(ch, isRearrange) {

                                            if (isRearrange) {
                                                //重新排列元素
                                                var childNodes = rearrangeElm(vnode.innerVnode);
                                                //检查是否插入节点
                                                if (childNodes.length) {
                                                    vnode.elm = [].slice.call(childNodes);
                                                    //返回当前节点数据
                                                    callback(vnode, isRearrange);
                                                }
                                            } else {
                                                vnode.elm = vnode.elm.concat(ch.elm)
                                            }
                                        }, extraParameters, vnode);

                                    })
                                }
                        }

                    } else {
                        //检查是否是注释
                        if (sel === '!') {
                            if (isUndef(vnode.text)) {
                                vnode.text = '';
                            }
                            vnode.elm = api.createComment(vnode.text);

                        } else if (isDef(sel)) {


                            if (oldVnode && vnode.elm === oldVnode.elm) return;

                            //创建实体Dom元素
                            var elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, vnode.tag) :
                                api.createElement(vnode.tag);

                            if (vnode.id) elm.id = vnode.id;
                            if (vnode.className) elm.className = vnode.className;

                            //触发model中的create 钩子
                            cbs.create.forEach(function(createHook) {
                                createHook(emptyNode, vnode)
                            })

                            //检查子元素 并递归创建子元素真实Dom
                            if (isArray(children)) {
                                children.forEach(function(ch) {
                                    if (ch instanceof Object) {

                                        //收集作用域
                                        vnode.middleScope.length && (ch.middleScope = ch.middleScope.concat(vnode.middleScope));
                                        Object.keys(vnode.$scope).length && ch.middleScope.push(vnode.$scope);

                                        var oldVnode;
                                        createElm(ch, insertedVnodeQueue, function(ch, isRearrange) {

                                            if (isRearrange) {
                                                rearrangePatch(ch, oldVnode, vnode.elm);
                                            } else {
                                                api.appendChild(elm, ch.elm);
                                            }
                                            //销毁旧节点
                                            oldVnode && oldVnode.destroy();
                                            oldVnode = ch.clone();
                                        }, extraParameters, vnode);
                                    } else {
                                        api.appendChild(elm, api.createTextNode(ch));
                                    }
                                })
                            } else if (primitive(vnode.text)) {
                                api.appendChild(elm, api.createTextNode(vnode.text));
                            }
                        } else {
                            //字符串内容表达式检查
                            if (vnode.data && vnode.data.exps) {
                                var text,
                                    exps = vnode.data.exps;

                                exps.forEach(function(exp, index) {
                                    if (exp instanceof Object) {
                                        //收集作用域
                                        var scopes = [vnode.rootScope].concat(vnode.middleScope);
                                        scopes.push(vnode.$scope);

                                        //表达式监听
                                        (exps[index] = syntaxHandle(exp, scopes, extraParameters.filter, true)).readWatch(function(data) {
                                            // console.log('this is text ', data, vnode.$scope);
                                            //检查文本是否以存在 则重新合并文本内容
                                            if (text) {
                                                text = concatTextExp(exps);
                                                if (vnode.text !== text) {
                                                    api.setTextContent(vnode.elm, vnode.text = text);
                                                }
                                            }
                                        });

                                    } else {

                                    }
                                });
                                text = vnode.text = concatTextExp(exps);
                            }
                            //文本节点
                            vnode.elm = api.createTextNode(vnode.text);
                        }
                    }

                    i = data.hook;
                    if (isDef(i)) {
                        //检查并触发create类型钩子
                        if (i.create)
                            i.create(emptyNode, vnode);

                        //收集并存储插入类型钩子
                        if (i.insert)
                            insertedVnodeQueue.push(vnode);
                    }

                    //返回当前节点数据
                    callback(vnode, isRearrange);

                    //销毁旧节点
                    oldVnode && oldVnode.destroy();

                    //节点备份
                    oldVnode = vnode.clone();

                    //标识父元素重新排列子元素
                    isRearrange = true;
                }

                //获取并执行 虚拟节点中的初始化钩子
                if (isDef(data) && isDef(i = data.hook) && isDef(i = i.init)) {
                    initCount++;
                    i(vnode, initCreate, extraParameters);
                } else if (!initCount) {
                    initCreate()
                }

                //触发model中的create 钩子
                cbs.init.forEach(function(initHook) {
                    initHook(vnode, initCreate, extraParameters, parentNode)
                })
            }

            //创建新的虚拟节点
            function addVnodes(parentVnode, before, vnodes, startIdx, endIdx, insertedVnodeQueue, extraParameters, containerElm) {
                var parentElm = parentVnode.elm;

                //遍历并创建节点
                vnodes.slice(startIdx, endIdx + 1).forEach(function(ch) {
                    if (ch instanceof Object) {
                        var oldVnode;
                        createElm(ch, insertedVnodeQueue, function(ch, isRearrange) {
                            if (isRearrange) {
                                rearrangePatch(ch, oldVnode, parentElm);
                            } else {
                                api.appendChild(parentElm, ch.elm, before);
                            }
                            oldVnode = ch.clone();

                            //检查是否是innerVnode容器
                            if (containerElm) {
                                containerElm.elm = []
                                containerElm.innerVnode.forEach(function(vnode) {
                                    if (vnode.elm) {
                                        containerElm.elm = containerElm.elm.concat(vnode.elm);
                                    }
                                })
                            }

                        }, extraParameters, parentVnode);
                    } else {
                        api.appendChild(parentElm, api.createTextNode(vnode.text), before);
                    }
                })

                if (containerElm) {
                    containerElm.elm = []
                    containerElm.innerVnode.forEach(function(vnode) {
                        containerElm.elm = containerElm.elm.concat(vnode.elm);
                    })
                }
            }

            //调用销毁钩子
            function invokeDestroyHook(vnode) {
                var i, j, data = vnode.data;

                if (isDef(data)) {

                    //触发虚拟节点中的销毁钩子
                    if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode);

                    //触发model中的销毁钩子
                    cbs.destroy.forEach(function(destroyHook) {
                        destroyHook(vnode);
                    })

                    if (isDef(vnode.children)) {
                        //触发子元素的销毁钩子
                        vnode.children.forEach(function(children) {
                            if (children instanceof Object) {
                                invokeDestroyHook(children);
                            }
                        })
                    }

                }
            }

            //删除虚拟节点
            function removeVnodes(parentElm, vnodes, startIdx, endIdx, containerElm) {

                for (; startIdx <= endIdx; ++startIdx) {
                    var i_1 = void 0,
                        listeners = void 0,
                        rm = void 0,
                        ch = vnodes[startIdx];

                    if (ch instanceof Object) {
                        if (isDef(ch.sel)) {
                            //调用销毁钩子
                            invokeDestroyHook(ch);

                            //监听并删除元素
                            listeners = cbs.remove.length + 1;
                            rm = createRmCb(ch, listeners, containerElm);

                            //遍历并触发model中的remove钩子
                            cbs.remove.forEach(function(removeHook) {
                                removeHook(ch, rm);
                            })

                            //调用删除的钩子
                            if (isDef(i_1 = ch.data) && isDef(i_1 = i_1.hook) && isDef(i_1 = i_1.remove)) {
                                i_1(ch, rm);
                            } else {
                                rm();
                            }
                        } else {
                            ch.destroy();
                        }
                    } else {
                        ch.destroy();
                    }
                }

                //检查是否是innerVnode容器
                if (containerElm) {
                    containerElm.elm = []
                    containerElm.innerVnode.forEach(function(vnode) {
                        containerElm.elm = containerElm.elm.concat(vnode.elm);
                    })
                }
            }

            //更新子元素
            function updateChildren(parentVnode, oldCh, newCh, insertedVnodeQueue, extraParameters) {

                if (oldCh.isReplace) {
                    var containerElm = newCh;
                    newCh = newCh.innerVnode;
                    oldCh = oldCh.innerVnode;
                }

                var parentElm = parentVnode.elm;
                var oldStartIdx = 0,
                    newStartIdx = 0;
                var oldEndIdx = oldCh.length - 1;
                var oldStartVnode = oldCh[0];
                var oldEndVnode = oldCh[oldEndIdx];
                var newEndIdx = newCh.length - 1;
                var newStartVnode = newCh[0];
                var newEndVnode = newCh[newEndIdx];
                var oldKeyToIdx;
                var idxInOld;
                var elmToMove;
                var before;

                //元素对比
                while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
                    if (!oldStartVnode) {
                        oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
                    } else if (!oldEndVnode) {
                        oldEndVnode = oldCh[--oldEndIdx];
                    } else if (!newStartVnode) {
                        newStartVnode = newCh[++newStartIdx];
                    } else if (!newEndVnode) {
                        newEndVnode = newCh[--newEndIdx];
                    } else if (sameVnode(oldStartVnode, newStartVnode)) {
                        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, extraParameters, parentVnode);
                        oldStartVnode = oldCh[++oldStartIdx];
                        newStartVnode = newCh[++newStartIdx];
                    } else if (sameVnode(oldEndVnode, newEndVnode)) {
                        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, extraParameters, parentVnode);
                        oldEndVnode = oldCh[--oldEndIdx];
                        newEndVnode = newCh[--newEndIdx];
                    } else if (sameVnode(oldStartVnode, newEndVnode)) {
                        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, extraParameters, parentVnode);
                        api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
                        oldStartVnode = oldCh[++oldStartIdx];
                        newEndVnode = newCh[--newEndIdx];
                    } else if (sameVnode(oldEndVnode, newStartVnode)) {
                        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, extraParameters, parentVnode);
                        api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                        oldEndVnode = oldCh[--oldEndIdx];
                        newStartVnode = newCh[++newStartIdx];
                    } else {
                        if (oldKeyToIdx === undefined) {
                            oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                        }
                        idxInOld = oldKeyToIdx[newStartVnode.key];
                        if (isUndef(idxInOld)) {
                            (function(newStartVnode) {
                                var oldVnode;
                                createElm(newStartVnode, insertedVnodeQueue, function(ch, isRearrange) {
                                    if (isRearrange) {
                                        rearrangePatch(ch, oldVnode, parentElm);
                                    } else {
                                        api.insertBefore(parentElm, ch.elm, oldStartVnode.elm);
                                    }
                                    oldVnode = ch.clone();
                                }, extraParameters, parentVnode);
                            })(newStartVnode);

                            newStartVnode = newCh[++newStartIdx];
                        } else {
                            elmToMove = oldCh[idxInOld];
                            if (elmToMove.sel !== newStartVnode.sel) {
                                (function(newStartVnode) {
                                    var oldVnode;
                                    createElm(newStartVnode, insertedVnodeQueue, function(ch, isRearrange) {
                                        if (isRearrange) {
                                            rearrangePatch(ch, oldVnode, parentElm);
                                        } else {
                                            api.insertBefore(parentElm, ch.elm, oldStartVnode.elm);
                                        }
                                        oldVnode = ch.clone();
                                    }, extraParameters, parentVnode)
                                })(newStartVnode);

                            } else {
                                patchVnode(elmToMove, newStartVnode, insertedVnodeQueue, extraParameters, parentVnode);
                                oldCh[idxInOld] = undefined;
                                api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                            }
                            newStartVnode = newCh[++newStartIdx];
                        }
                    }
                }
                if (oldEndIdx === newEndIdx) return;

                //处理需要新增或移除的节点
                if (oldStartIdx > oldEndIdx) {
                    before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
                    addVnodes(parentVnode, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue, extraParameters, containerElm);
                } else if (newStartIdx > newEndIdx) {
                    removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx, containerElm);
                }
            }

            //虚拟节点补丁
            function patchVnode(oldVnode, vnode, insertedVnodeQueue, extraParameters, parentVnode) {
                var i, hook;

                //修补前 触发节点中的prepatch 钩子
                if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
                    i(oldVnode, vnode);
                }
                var elm = vnode.elm = oldVnode.elm;
                var oldCh = oldVnode.children;
                var ch = vnode.children;

                //检查前后两个节点是否同一个节点
                if (oldVnode === vnode) return;

                if (isDef(vnode.data)) {
                    //触发model中的update钩子
                    cbs.update.forEach(function(updateHook) {
                        updateHook(oldVnode, vnode);
                    })
                    i = vnode.data.hook;

                    //触发节点中的update钩子
                    if (isDef(i) && isDef(i = i.update)) i(oldVnode, vnode);
                }

                //检查节点中的文本
                if (isUndef(vnode.text)) {

                    //检查元素节点是否组件 则重新渲染元素
                    if (vnode.isComponent && vnode.isClone) {
                        //清空元素
                        vnode.elm = undefined;
                        createElm(vnode, insertedVnodeQueue, function(ch, isRearrange) {
                            api.replaceChild(api.parentNode(oldVnode.elm), ch.elm, oldVnode.elm);
                            //销毁旧节点数据
                            oldVnode.destroy();
                        }, extraParameters);
                    } else if (isDef(oldCh) && isDef(ch)) {
                        if (oldCh !== ch) updateChildren(vnode, oldCh, ch, insertedVnodeQueue, extraParameters);
                    } else if (isDef(ch)) {
                        if (isDef(oldVnode.text))
                            api.setTextContent(elm, '');
                        addVnodes(vnode, null, ch, 0, ch.length - 1, insertedVnodeQueue, extraParameters);
                    } else if (isDef(oldCh)) {
                        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
                    } else if (isDef(oldVnode.text)) {
                        api.setTextContent(elm, '');
                    }

                } else {

                    //字符串内容表达式检查
                    if (vnode.data && vnode.data.exps) {

                        var text,
                            exps = vnode.data.exps;

                        vnode.rootScope = oldVnode.rootScope;

                        //继承作用域
                        if (parentVnode) {
                            Object.keys(parentVnode.$scope || {}).length && vnode.middleScope.push(parentVnode.$scope)
                        }

                        //语法解析监听
                        exps.forEach(function(exp, index) {
                            if (exp instanceof Object) {
                                //收集作用域
                                var scopes = [vnode.rootScope].concat(vnode.middleScope);
                                scopes.push(vnode.$scope);
                                //表达式监听
                                (exps[index] = syntaxHandle(exp, scopes, extraParameters.filter, true)).readWatch(function(data) {
                                    // console.log('this is text ', data, vnode.$scope);
                                    //检查文本是否以存在 则重新合并文本内容
                                    if (text) {
                                        text = concatTextExp(exps);
                                        if (elm.textContent !== text) {
                                            api.setTextContent(vnode.elm, vnode.text = text);
                                        }
                                    }
                                });
                            }
                        });

                        text = concatTextExp(exps);
                        if (elm.textContent !== text) {
                            api.setTextContent(vnode.elm, vnode.text = text);
                        }

                    } else if (oldVnode.text !== vnode.text) {
                        api.setTextContent(elm, vnode.text)
                    }
                    //销毁旧虚拟节点
                    oldVnode.destroy('elm');
                }

                //修补后 的钩子  触发节点中的 postpatch 钩子
                if (isDef(hook) && isDef(i = hook.postpatch)) {
                    i(oldVnode, vnode);
                }
            }

            //对比节点并修补
            return function patch(oldVnode, Vnode, option, parentVnode, callback) {
                option = option || {};

                var i, elm, parent, nextElm;
                var insertedVnodeQueue = [];

                var extraParameters = {
                    scope: option.scope || {},
                    filter: option.filter || {},
                    //layout 视图
                    layoutInfo: option.layoutInfo,
                    //presenter 视图
                    nowLayoutInfo: option.nowLayoutInfo
                }

                //检查是否有旧节点
                if (oldVnode) {
                    //检查并转换dom元素为虚拟Dom
                    if (!isVnode(oldVnode)) {
                        oldVnode = emptyNodeAt(oldVnode);
                    }
                    elm = oldVnode.elm;
                    parent = api.parentNode(elm);
                    nextElm = api.nextSibling(elm);
                } else {
                    nextElm = null;
                    parent = document.createDocumentFragment();
                }

                if (typeof Vnode === 'string') {
                    Vnode = vnode(undefined, {}, undefined, Vnode);
                }

                //检查是否innerVnode内部节点替换
                if (Vnode.isReplace) {
                    //检查旧节点是否也是内部节点
                    if (oldVnode.innerVnode && oldVnode.innerVnode.length) {
                        elm = oldVnode.innerVnode[0].elm;
                    } else {
                        elm = oldVnode.elm
                    }

                    //获取父节点
                    if (elm) {
                        if (elm instanceof Array) {
                            parent = api.parentNode(elm[0])
                        } else {
                            parent = api.parentNode(elm)
                        }
                    }

                    //检查是否有父节点
                    if (parentVnode || parent) {
                        if (parentVnode) {
                            if (!parentVnode.elm) parentVnode.elm = parent;
                        }
                        parentVnode = parentVnode || {
                            elm: parent
                        };
                        //更新子节点
                        updateChildren(parentVnode, oldVnode, Vnode, insertedVnodeQueue, extraParameters);
                        //移除旧元素
                        // removeVnodes(parent, [oldVnode], 0, 0);
                    } else {
                        Vnode.elm = [];
                        Vnode.innerVnode.forEach(function(ch) {
                            createElm(ch, insertedVnodeQueue, function(ch, isRearrange) {
                                Vnode.elm = Vnode.elm.concat(ch.elm)
                            }, extraParameters, Vnode)

                        })
                    }

                    //常规情况
                } else {

                    if (Vnode instanceof Array) {

                        var containerVnode = Vnode,
                            tmpNode,
                            tmpParent = parent;
                        //创建新节点
                        Vnode.forEach(function(Vnode) {

                            var oldVnode,
                                nowParentNode;
                            //创建新节点
                            createElm(Vnode, insertedVnodeQueue, function(ch, isRearrange) {
                                if (isRearrange) {
                                    rearrangePatch(ch, oldVnode, oldVnode.elm.parentNode);
                                } else {
                                    //新增节点到父元素容器中
                                    var location = containerVnode.indexOf(ch);
                                    if (tmpNode) {
                                        if (tmpNode instanceof Array) {
                                            tmpParent = tmpNode[0].parentNode;
                                        } else {
                                            tmpParent = tmpNode.parentNode;
                                        }
                                    } else {
                                        tmpParent = parent;
                                    }
                                    api.insertBefore(nowParentNode = tmpParent, ch.elm, containerVnode[location + 1] ? containerVnode[location + 1].elm : null);
                                }
                                oldVnode = ch.clone();
                                tmpNode = ch.elm;
                            }, extraParameters);
                        })

                        if (oldVnode && parent !== null) {
                            //移除旧元素
                            removeVnodes(parent, [oldVnode], 0, 0);
                        }

                    } else {
                        if (!(Vnode instanceof Object)) return oldVnode;

                        //检查并转换dom元素为虚拟Dom
                        if (!isVnode(Vnode)) {
                            Vnode = emptyNodeAt(Vnode);
                        }

                        //触发model中pre钩子
                        for (i = 0; i < cbs.pre.length; ++i)
                            cbs.pre[i]();

                        //检查是否有旧节点 并 检查两个虚拟节点是否相同
                        if (oldVnode && sameVnode(oldVnode, Vnode)) {
                            //检查并传递作用域
                            if (Object.keys(Vnode.rootScope).length) {
                                Object.keys(scope).forEach(function(key) {
                                    Vnode.$scope[key] = scope[key];
                                })
                            } else {
                                Vnode.rootScope = scope;
                            }
                            //节点修补
                            patchVnode(oldVnode, Vnode, insertedVnodeQueue, extraParameters);
                        } else {

                            //创建新节点
                            createElm(Vnode, insertedVnodeQueue, function(ch, isRearrange) {
                                var _oldVnode;
                                if (parent !== null) {
                                    if (isRearrange) {
                                        rearrangePatch(ch, _oldVnode, parent);
                                    } else {
                                        //新增节点到父元素容器中
                                        api.insertBefore(parent, Vnode.elm, api.nextSibling(elm));
                                        //移除旧元素
                                        if (oldVnode) removeVnodes(parent, [oldVnode], 0, 0);
                                    }
                                    _oldVnode = ch.clone();
                                }
                            }, extraParameters);
                        }
                    }
                }

                //触发model中的post钩子
                cbs.post.forEach(function(postHook) {
                    postHook();
                });

                //触发队列中的insert钩子
                insertedVnodeQueue.forEach(function(ivq) {
                    ivq.data.hook.insert(ivq);
                });

                //检查是否有回调
                if (callback instanceof Function) callback(parent, function(newParent) {
                    parent = newParent
                })

                return Vnode;
            };
        }

        /**
         * 属性插件
         * @returns {{create: updateAttrs, update: updateAttrs}}
         */
        function attributesModule() {
            var NamespaceURIs = {
                "xlink": "http://www.w3.org/1999/xlink"
            };
            var booleanAttrs = ["allowfullscreen", "async", "autofocus", "autoplay", "checked", "compact", "controls", "declare",
                "default", "defaultchecked", "defaultmuted", "defaultselected", "defer", "disabled", "draggable",
                "enabled", "formnovalidate", "hidden", "indeterminate", "inert", "ismap", "itemscope", "loop", "multiple",
                "muted", "nohref", "noresize", "noshade", "novalidate", "nowrap", "open", "pauseonexit", "readonly",
                "required", "reversed", "scoped", "seamless", "selected", "sortable", "spellcheck", "translate",
                "truespeed", "typemustmatch", "visible"
            ];
            var booleanAttrsDict = Object.create(null);
            for (var i = 0, len = booleanAttrs.length; i < len; i++) {
                booleanAttrsDict[booleanAttrs[i]] = true;
            }

            function updateAttrs(oldVnode, vnode) {
                var key, cur, old, elm = vnode.elm,
                    oldAttrs = oldVnode.data.attrs,
                    attrs = vnode.data.attrs,
                    namespaceSplit;
                if (!oldAttrs && !attrs)
                    return;
                if (oldAttrs === attrs)
                    return;
                oldAttrs = oldAttrs || {};
                attrs = attrs || {};
                // update modified attributes, add new attributes
                for (key in attrs) {
                    cur = attrs[key];
                    old = oldAttrs[key];
                    if (old !== cur) {
                        if (!cur && booleanAttrsDict[key])
                            elm.removeAttribute(key);
                        else {
                            namespaceSplit = key.split(":");
                            if (namespaceSplit.length > 1 && NamespaceURIs.hasOwnProperty(namespaceSplit[0]))
                                elm.setAttributeNS(NamespaceURIs[namespaceSplit[0]], key, cur);
                            else
                                elm.setAttribute(key, cur);
                        }
                    }
                }
                //remove removed attributes
                // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
                // the other option is to remove all attributes with value == undefined
                for (key in oldAttrs) {
                    if (!(key in attrs)) {
                        elm.removeAttribute(key);
                    }
                }
            }

            return {
                create: updateAttrs,
                update: updateAttrs
            };
        }

        /**
         * class插件
         * @returns {{create: updateClass, update: updateClass}}
         */
        function classModule() {
            function updateClass(oldVnode, vnode) {
                var cur, name, elm = vnode.elm,
                    oldClass = oldVnode.data["class"],
                    klass = vnode.data["class"];
                if (!oldClass && !klass)
                    return;
                if (oldClass === klass)
                    return;
                oldClass = oldClass || {};
                klass = klass || {};
                for (name in oldClass) {
                    if (!klass[name]) {
                        elm.classList.remove(name);
                    }
                }
                for (name in klass) {
                    cur = klass[name];
                    if (cur !== oldClass[name]) {
                        elm.classList[cur ? 'add' : 'remove'](name);
                    }
                }
            }

            return {
                create: updateClass,
                update: updateClass
            };
        }


        /**
         * 附加属性插件
         * @returns {{create: updateProps, update: updateProps}}
         */
        function propsModule() {
            function updateProps(oldVnode, vnode) {
                var key, cur, old, elm = vnode.elm,
                    oldProps = oldVnode.data.props,
                    props = vnode.data.props;
                if (!oldProps && !props)
                    return;
                if (oldProps === props)
                    return;
                oldProps = oldProps || {};
                props = props || {};
                for (key in oldProps) {
                    if (!props[key]) {
                        delete elm[key];
                    }
                }
                for (key in props) {
                    cur = props[key];
                    old = oldProps[key];
                    if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
                        elm[key] = cur;
                    }
                }
            }

            return {
                create: updateProps,
                update: updateProps
            };
        }

        /**
         * 样式插件
         * @returns {{create: updateStyle, update: updateStyle, destroy: applyDestroyStyle, remove: applyRemoveStyle}}
         */
        function styleModule() {
            var raf = (typeof window !== 'undefined' && window.requestAnimationFrame) || setTimeout;
            var nextFrame = function(fn) {
                raf(function() {
                    raf(fn);
                });
            };

            function setNextFrame(obj, prop, val) {
                nextFrame(function() {
                    obj[prop] = val;
                });
            }

            function updateStyle(oldVnode, vnode) {
                var cur, name, elm = vnode.elm,
                    oldStyle = oldVnode.data.style,
                    style = vnode.data.style;
                if (!oldStyle && !style)
                    return;
                if (oldStyle === style)
                    return;
                oldStyle = oldStyle || {};
                style = style || {};
                var oldHasDel = 'delayed' in oldStyle;
                for (name in oldStyle) {
                    if (!style[name]) {
                        if (name[0] === '-' && name[1] === '-') {
                            elm.style.removeProperty(name);
                        } else {
                            elm.style[name] = '';
                        }
                    }
                }
                for (name in style) {
                    cur = style[name];
                    if (name === 'delayed') {
                        for (name in style.delayed) {
                            cur = style.delayed[name];
                            if (!oldHasDel || cur !== oldStyle.delayed[name]) {
                                setNextFrame(elm.style, name, cur);
                            }
                        }
                    } else if (name !== 'remove' && cur !== oldStyle[name]) {
                        if (name[0] === '-' && name[1] === '-') {
                            elm.style.setProperty(name, cur);
                        } else {
                            elm.style[name] = cur;
                        }
                    }
                }
            }

            function applyDestroyStyle(vnode) {
                var style, name, elm = vnode.elm,
                    s = vnode.data.style;
                if (!s || !(style = s.destroy))
                    return;
                for (name in style) {
                    elm.style[name] = style[name];
                }
            }

            function applyRemoveStyle(vnode, rm) {
                var s = vnode.data.style;
                if (!s || !s.remove) {
                    rm();
                    return;
                }
                var name, elm = vnode.elm,
                    i = 0,
                    compStyle, style = s.remove,
                    amount = 0,
                    applied = [];
                for (name in style) {
                    applied.push(name);
                    elm.style[name] = style[name];
                }
                compStyle = getComputedStyle(elm);
                var props = compStyle['transition-property'].split(', ');
                for (; i < props.length; ++i) {
                    if (applied.indexOf(props[i]) !== -1)
                        amount++;
                }
                elm.addEventListener('transitionend', function(ev) {
                    if (ev.target === elm)
                        --amount;
                    if (amount === 0)
                        rm();
                });
            }

            return {
                create: updateStyle,
                update: updateStyle,
                destroy: applyDestroyStyle,
                remove: applyRemoveStyle
            };
        }

        /**
         * 事件监听插件
         * @returns {{create: updateEventListeners, update: updateEventListeners, destroy: updateEventListeners}}
         */
        function eventListenersModule() {

            function updateEventListeners(oldVnode, vnode) {
                var oldOn = oldVnode.data.on,
                    newListener = {},
                    oldListener = oldVnode.listener,
                    oldElm = oldVnode.elm,
                    on = vnode && vnode.data.on,
                    elm = (vnode && vnode.elm),
                    name;

                if (vnode && oldVnode.listener === vnode.listener && oldOn === on && !on === !oldVnode.listener) {
                    return;
                }

                if (on === oldOn) return;

                oldListener = oldListener || {};

                if (!oldOn) {
                    //遍历所有事件类型
                    Object.keys(on).forEach(function(eventName) {
                        (newListener[eventName] = [].concat(on[eventName])).forEach(function(fn) {
                            elm.addEventListener(eventName, fn, false);
                        })
                    });
                } else {
                    Object.keys(on).forEach(function(eventName) {
                        if (!oldListener[eventName]) {
                            (newListener[eventName] = [].concat(on[eventName])).forEach(function(fn) {
                                elm.addEventListener(eventName, fn, false);
                            })
                        } else {
                            var oldOnEvents = [].concat(oldListener[eventName]);
                            (newListener[eventName] = [].concat(on[eventName])).forEach(function(fn) {
                                var location = oldOnEvents.indexOf(fn)
                                if (location === -1) {
                                    elm.addEventListener(eventName, fn, false);
                                } else {
                                    //移除已存在的
                                    oldOnEvents.splice(location, 1);
                                }
                            })
                            oldOnEvents.forEach(function(fn) {
                                oldElm.removeEventListener(eventName, fn, false);
                            })
                        }

                    });
                }

                vnode.newListener = newListener;
            }

            return {
                create: updateEventListeners,
                update: updateEventListeners,
                destroy: updateEventListeners
            };
        }

        var compManage = require('./componentManage');
        var directorieManage = require('./directiveManage');

        //组件检查
        function compAndDirectiveInspect() {

            function inspectInit(vnode, initCall, extraParameters, parentNode) {

                var compExample,
                    isInitCall,
                    isLayoutElm,
                    layoutElmInfo,
                    layoutStroage,
                    data = vnode.data,
                    attrsMap = data.attrsMap || {},
                    attrs = data.attrs = data.attrs || {},
                    handleExampleQueue = [],
                    compClass = compManage.get(vnode.tag);

                function exapmpleQueueHandle() {
                    var compExample = handleExampleQueue.pop();
                    if (compExample) {

                        //检查是否指令 并销毁当前指令属性记录
                        if (compExample instanceof directorieManage.directiveClass) {
                            delete attrsMap[compExample.name];
                            delete compExample.$api.templateVnode.data.attrsMap[compExample.name];
                        }

                        //是否停止当前节点后续指令与组件渲染
                        if (compExample.conf.stopRender) {
                            isInitCall = true;
                            compExample.init();
                            handleExampleQueue = undefined;
                            //是否需要等待当前指令或组件加载后渲染后续指令与组件
                        } else if (compExample.conf.loadRender) {
                            compExample.watchCreate(function() {
                                exapmpleQueueHandle();
                            })
                            compExample.init();
                        } else {
                            compExample.init();
                            //检查是替换
                            if (handleExampleQueue.length || compExample.conf.isReplace) {
                                exapmpleQueueHandle();
                            } else {
                                initCall();
                            }
                        }
                    }
                }

                //检查并提取 layout-block layout-main
                if (extraParameters.layoutInfo) {
                    layoutStroage = extraParameters.layoutInfo;
                    //收集layout元素
                    switch (vnode.tag) {
                        case 'layout-block':
                            isLayoutElm = true;
                            var blockName = attrsMap.loaction ? attrsMap.loaction.value : vnode.data.attrsMap.location.value
                            layoutStroage.blockMap[blockName] = {
                                vnode: vnode,
                                parentNode: parentNode
                            };
                            break;
                        case 'layout-main':
                            isLayoutElm = true;
                            layoutStroage.main = {
                                vnode: vnode,
                                parentNode: parentNode
                            };
                            break;
                    }

                    //重新格式化当前layout节点
                    if (isLayoutElm) {
                        vnode.isReplace = true;
                        vnode.innerVnode = vnode.children;
                    }
                }

                //组件检查
                if (compClass) {
                    compExample = compClass(vnode, extraParameters, module.exports);
                    //存入实例队列
                    handleExampleQueue.push(compExample);
                    //观察组件渲染
                    compExample.watchRender(function() {
                        initCall();
                        isInitCall = true;
                    })
                } else {
                    isInitCall = true;
                }

                //指令检查
                Object.keys(attrsMap).forEach(function(attrName) {
                    var directorieExample,
                        directorieClass = directorieManage.get(attrName);

                    //检查是否是指令
                    if (directorieClass) {
                        directorieExample = directorieClass(vnode, extraParameters, module.exports);
                        //存入实例队列
                        handleExampleQueue.push(directorieExample);
                        //观察指令渲染
                        directorieExample.watchRender(function() {
                            if (isInitCall) initCall();
                        })
                    } else {
                        if (attrName.match(/^\w+$/)) {
                            //如果不是指令则写入属性
                            attrs[attrName] = attrsMap[attrName].value;
                        }
                    }
                });

                if (handleExampleQueue.length) {
                    //根据优先级摆放处理队列
                    handleExampleQueue = handleExampleQueue.sort(function(before, after) {
                        return before.priority - after.priority;
                    });

                    //实例队列处理
                    exapmpleQueueHandle();
                } else {
                    initCall();
                }
            }

            return {
                init: inspectInit
            }
        }

        module.exports = {
            patch: patch,
            vnode: vnode,
            cbs: cbs,
            isVnode: isVnode,
            domApi: htmlDomApi,
            node2vnode: emptyNodeAt
        };

    }, {
        "../../../inside/lib/observer": 55,
        "./componentManage": 16,
        "./directiveManage": 17,
        "./syntaxHandle": 19
    }],
    22: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-6-2.
         */

        var getSource = require('../../../inside/source/getSource');
        var sourcePathNormal = require('../../../inside/source/sourcePathNormal');

        function viewSourc(viewInfo, originInfo, callback) {

            var viewPathInfo = sourcePathNormal(viewInfo.view, originInfo, 'view');

            getSource(viewPathInfo, {
                mode: 'view',
                suffix: viewInfo.tplSuffix,
                isAjax: viewInfo.requireType === 'ajax'
            }, function(source) {
                if (source === false) {
                    log.error('视图文件 [' + this.responseURL + ']缺失！');
                    return;
                }
                //资源回调
                callback(source);
            })
        }

        module.exports = viewSourc;
    }, {
        "../../../inside/source/getSource": 62,
        "../../../inside/source/sourcePathNormal": 63
    }],
    23: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-30.
         */

        'use strict';

        //路由管理器
        var routeManage = require('./route/index');

        var exec = require('./route/exec');

        var routeData = require('./route/routeData');

        var URL = require('../../inside/lib/url');

        var PATH = require('../../inside/lib/path');

        var pathConvert = require('./route/pathConvert');

        var appConf = require('../../inside/config/lib/commData').appConf;

        var getPathNormalize = pathConvert.getNowPath;

        var getRoutePathInfo = pathConvert.getRoutePathInfo;

        function start() {
            var routePathInfo;

            //启动路由监控
            routeManage.watch();

            //系统初始化页面跳转定位 [已有的路径与默认的路由路径]
            if (appConf.route.mode === 'html5' || !window.location.hash.match(/^#!\/[^\s]+/)) {

                if (!appConf.route.defaultUrl) return;

                routePathInfo = exec(appConf.route.defaultUrl);

                //获取默认路径
                var href = routePathInfo.url;

                if (appConf.route.mode === 'html5') {
                    var pageUrl = PATH.resolve(href);
                    //添加新的历史记录
                    window.history.pushState({
                        "target": href
                    }, null, pageUrl);

                } else {
                    //通知hash监听器当前跳转不需要做处理
                    routeData.hashListener = false;
                    URL.hash('!/' + href);
                }
            } else {
                exec(getPathNormalize(appConf.route.mode), function(routeInfo) {

                    //并检查是否和上一次路径重复
                    if (!routeInfo && !refresh) return;

                    var requestUrl = routeInfo.url;

                    //检查当前模式
                    if (appConf.route.mode === 'html5') {
                        var pageUrl = PATH.resolve(requestUrl, insideConf.rootPath);
                        //添加新的历史记录
                        window.history.pushState({
                            "target": requestUrl
                        }, null, pageUrl);
                    } else {
                        URL.hash('!/' + requestUrl);
                    }

                });
            }
        }


        module.exports = {
            start: start
        };
    }, {
        "../../inside/config/lib/commData": 33,
        "../../inside/lib/path": 56,
        "../../inside/lib/url": 60,
        "./route/exec": 24,
        "./route/index": 26,
        "./route/pathConvert": 27,
        "./route/routeData": 29
    }],
    24: [function(require, module, exports) {
        /**
         * 路由执行
         * Created by xiyuan on 17-5-30.
         */
        'use strict';
        var routeData = require('./routeData');
        var getRouteInfo = require('./getRouteInfo');
        var getRoutePathInfo = require('./pathConvert').getRoutePathInfo;

        var engine = require('../../../engine/index');

        var log = require('../../../inside/log/log');
        var PATH = require('../../../inside/lib/path');
        var frameConf = require('../../../inside/config/index');
        var insideEvent = require('../../../inside/event/insideEvent');

        var nowInfo = routeData.nowInfo;
        var prevInfo = routeData.prevInfo;
        var appConf = frameConf.appConf;

        var errorMsgs = {
            notPage: '404 Not Found【找不到对应的页面】',
            errTmpl: '错误页面错误【缺失对应的视图或presenter】',
            notOption: '没有找到对应的[错误]视图或presenter'
        };

        function exec(requestUrl, successCallback, refresh) {

            var pathInfo = getRoutePathInfo(requestUrl);

            //提取GET类型参数
            var urlGetParameter = pathInfo.parameter,
                urlGetString = pathInfo.parameterUrl,
                nowInfoUrl = nowInfo.url,
                href = pathInfo.path,
                routeErrorFlag = false,
                //标识路由是否停止
                isStop = false;

            //路由开始事件触发
            insideEvent.emit('route:start', {
                //请求的无参数url
                url: href,
                //请求的url
                requestUrl: requestUrl,
                //请求的参数
                parameter: urlGetParameter,
                parameterUrl: urlGetString,
                //当前的url
                nowUrl: nowInfoUrl,
                //路由停止,提供路由拦截
                stop: function() {
                    isStop = true;
                }
            });

            //检查路由停止标识
            if (isStop) return;

            //页面地址
            nowInfo.url = requestUrl;
            //路径
            nowInfo.path = href;
            //真实地址
            nowInfo.realPath = requestUrl;
            //路径中的参数
            nowInfo.parameter = urlGetParameter;
            nowInfo.parameterUrl = urlGetString;

            //查询路由是否存在
            var routeInfo = getRouteInfo(nowInfo),
                autoRouteData;

            //检查路由是否存在
            if (!routeInfo) {
                routeErrorFlag = true;

                //路由错误事件触发
                insideEvent.emit('route:error', {
                    requestUrl: requestUrl
                });

                //记录错误状态
                routeData.routeState = 'error';

                href = 'error/msg:' + errorMsgs.notPage;
                nowInfo.path = href;
                nowInfo.url = href;
                //页面后缀
                nowInfo.suffix = appConf.route.suffix;

                //调用错误页面路由
                if (!(routeInfo = getRouteInfo(nowInfo))) {
                    log.error(errorMsgs.errTmpl);
                    routeInfo = {
                        path: nowInfo.path,
                        suffix: nowInfo.suffix,
                        routeConfig: {}
                    }
                } else {
                    log.warn(errorMsgs.notOption);
                }
            }


            //检查是匹配的资源是否自动路由
            if (routeInfo.isAutoRoute) {

                var suffix,
                    viewUrl,
                    presenterUrl;

                autoRouteData = routeInfo.data;

                if (typeof autoRouteData === 'string') {

                    //检查是否网络绝对地址
                    if (!/^(\w+:)?\/\/(\w[\w\.]*)/.test(autoRouteData)) {
                        //检查是否指定模块,否则直接设置当前路径为模块地址
                        if (autoRouteData.indexOf('@') === -1) {
                            autoRouteData = autoRouteData + '@';
                        }
                    };
                    viewUrl = presenterUrl = PATH.normalize(autoRouteData + '/' + routeInfo.path);
                } else {
                    presenterUrl = autoRouteData.presenter;

                    //检查是否网络绝对地址
                    if (!/^(\w+:)?\/\/(\w[\w\.]*)/.test(presenterUrl)) {
                        //检查是否指定模块,否则直接设置当前路径为模块地址
                        if (presenterUrl.indexOf('@') === -1) {
                            presenterUrl = presenterUrl + '@';
                        }
                    }

                    if (autoRouteData.view) {
                        viewUrl = autoRouteData.view;

                        //检查是否网络绝对地址
                        if (!/^(\w+:)?\/\/(\w[\w\.]*)/.test(presenterUrl)) {
                            if (viewUrl.indexOf('@') === -1) {
                                viewUrl = viewUrl + '@';
                            }
                        }
                    } else {
                        viewUrl = presenterUrl
                    }
                    suffix = autoRouteData.suffix;
                }

                //去掉路径后缀 并重写切片路径
                routeInfo.path = routeInfo.path.replace(RegExp('\.?' + (suffix || routeInfo.suffix) + '$'), '').replace(/\/([\w-]+)$/, ':$1');

                routeInfo = {
                    presenter: PATH.normalize(presenterUrl + '/' + routeInfo.path),
                    view: PATH.normalize(viewUrl + '/' + routeInfo.path),
                    suffix: suffix || routeInfo.suffix
                }

            }

            if (!routeInfo.presenter) {
                log.error('路由必须指定presenter!')
            }

            nowInfo.path = nowInfo.path.replace(RegExp('\.?' + routeInfo.suffix + '$'), '');

            //生成最终URL路径
            href = nowInfo.path + ('.' + routeInfo.suffix.replace(/^\./, '')) + urlGetString

            nowInfo.url = href;

            //页面后缀
            nowInfo.suffix = routeInfo.suffix;
            //检查当前跳转路径和上页面是否同一个路径
            if (nowInfoUrl === href && !refresh) return false;

            //路由开始事件触发
            insideEvent.emit('route:change', {
                //请求的无参数url
                url: href,
                //请求的url
                requestUrl: requestUrl,
                //请求的参数
                parameter: urlGetParameter,
                //当前的url
                nowUrl: nowInfoUrl,
                //路由停止
                stop: function() {
                    isStop = true;
                }
            });

            //检查路由停止标识
            if (isStop) return;

            //检测是否返回
            routeData.history.isBack = routeData.history.isBack ? href === prevInfo.url : routeData.history.isBack;

            //路径历史更新
            nowInfo.url = href;
            prevInfo.url = nowInfoUrl;

            //回调处理
            typeof successCallback === 'function' && successCallback(nowInfo);

            //路由成功事件触发
            if (!routeErrorFlag) {

                insideEvent.emit('route:success', {
                    requestUrl: requestUrl,
                    routeInfo: nowInfo
                });
                routeData.routeState = 'success';

                //赋值页面参数到全局get参数容器中
                window.$_GET = urlGetParameter;
            }

            //页面渲染引擎执行
            engine.exec(routeInfo, nowInfo);

            return nowInfo;
        }


        module.exports = exec;
    }, {
        "../../../engine/index": 3,
        "../../../inside/config/index": 32,
        "../../../inside/event/insideEvent": 39,
        "../../../inside/lib/path": 56,
        "../../../inside/log/log": 61,
        "./getRouteInfo": 25,
        "./pathConvert": 27,
        "./routeData": 29
    }],
    25: [function(require, module, exports) {
        /**
         * 路由信息获取
         * Created by xiyuan on 17-5-30.
         */

        'use strict';

        var frameConf = require('../../../inside/config/index');

        function getRouteInfo(nowInfo) {
            return queryRoute(nowInfo.path, frameConf.insideConf.routeMaps);
        }

        //路由查询
        function queryRoute(url, routeMaps) {
            var i = ~0,
                realInfo,
                afterUrl,
                matchInfo,
                routeInfo,
                autoRoute,
                patchsLen = routeMaps.paths.length;

            //检查常规路径规则
            while (++i < patchsLen) {
                routeInfo = routeMaps.paths[i];
                //匹配路径
                if (matchInfo = url.match(routeInfo.rule)) {
                    //检查匹配位置是否首字符
                    if (matchInfo.index === 0) {
                        afterUrl = url.slice(routeInfo.rule.length);
                        //检查是否匹配到路径末尾
                        if (/^\/?$/.test(afterUrl) || routeInfo.conf.suffix === afterUrl) {
                            if (routeInfo.conf) return routeInfo.conf;
                        }

                        //检查是否在子级匹配到路径
                        if (realInfo = queryRoute(afterUrl, routeInfo.childrenRoute)) {
                            if (realInfo.isAutoRoute) {
                                if (!autoRoute) autoRoute = realInfo;
                            } else {
                                return realInfo;
                            }
                        } else {
                            //检查当前层级的自动路由
                            if (!autoRoute && routeInfo.autoRoute) {
                                autoRoute = {
                                    isAutoRoute: true,
                                    suffix: routeInfo.suffix,
                                    path: afterUrl.replace(/^[\/\\]*/, ''),
                                    data: routeInfo.autoRoute
                                };
                            }
                        }
                    }
                }
            };
            return autoRoute;
        }


        module.exports = getRouteInfo;

    }, {
        "../../../inside/config/index": 32
    }],
    26: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-30.
         */
        'use strict';

        var watch = require('./watch');

        var redirect = require('./redirect')

        module.exports = {
            watch: watch
        };
    }, {
        "./redirect": 28,
        "./watch": 30
    }],
    27: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-6-3.
         */

        var URL = require('../../../inside/lib/url');

        /**
         * 获取路由路径信息
         * @param requestUrl
         * @returns {{url: *, path: (string|XML), realPath: *, parameter: *, parameterUrl: string}}
         */
        function getRoutePathInfo(requestUrl) {

            //提取GET类型参数
            var urlGetParameter = URL.toObject(requestUrl),
                urlGetString = '',
                //提取GET参数字符
                href = requestUrl.replace(/\?[\w\W]*/, function(str) {
                    urlGetString = str;
                    return '';
                }).replace(/[\/\\]*$/, '');

            return {
                //页面地址
                url: requestUrl,
                //路径
                path: href,
                //真实地址
                realPath: requestUrl,
                //路径中的参数
                parameter: urlGetParameter,
                parameterUrl: urlGetString
            }
        }

        /*路径处理*/
        function getNowPath(type) {
            var href;
            switch (type) {
                case 'html5':
                    href = decodeURI(window.location.href.replace(routeData.rootPath, ''));
                    break;
                case 'hash':
                    href = decodeURI(window.location.hash.replace(/\#\!\/*/, ''));
                    break;
            }
            return href;
        };

        module.exports = {
            getRoutePathInfo: getRoutePathInfo,
            getNowPath: getNowPath
        };
    }, {
        "../../../inside/lib/url": 60
    }],
    28: [function(require, module, exports) {
        /**
         * 页面重定向
         * Created by xiyuan on 17-5-30.
         */

        'use strict';

        var exec = require('./exec');
        var URL = require('../../../inside/lib/url');
        var PATH = require('../../../inside/lib/path');
        var routeData = require('./routeData');
        var frameConf = require('../../../inside/config/index');

        var appConf = frameConf.appConf;
        var insideConf = frameConf.insideConf;

        /**
         * 页面重定向
         * @param requestUrl
         * @param arg
         * @param isBack
         * @param refresh
         */
        function redirect(requestUrl, arg, isBack, refresh) {
            requestUrl = requestUrl.replace(/^\//, '');
            var routeInfo,
                argIndex = 0,
                postArg,
                argValue,
                argLen = arguments.length;

            while (++argIndex < argLen && argIndex < 3) {
                argValue = arguments[argIndex];
                switch (typeof argValue) {
                    case 'object':
                        postArg = argValue;
                        break;
                    default:
                        isBack = !!argValue;
                        break;
                }
            }

            routeData.history.isBack = isBack;

            //根据请求的地址执行对应的presenter
            exec(requestUrl, function(routeInfo) {
                //并检查是否和上一次路径重复
                if (!routeInfo && !refresh) return;

                requestUrl = routeInfo.url;

                //检查当前模式
                if (appConf.route.mode === 'html5') {
                    var pageUrl = PATH.resolve(requestUrl, insideConf.rootPath);
                    //添加新的历史记录
                    window.history.pushState({
                        "target": requestUrl
                    }, null, pageUrl);
                } else {
                    //通知hash监听器当前跳转不需要做处理
                    routeData.hashListener = false;
                    URL.hash('!/' + requestUrl);
                }

            }, refresh)
        }


        module.exports = redirect;
    }, {
        "../../../inside/config/index": 32,
        "../../../inside/lib/path": 56,
        "../../../inside/lib/url": 60,
        "./exec": 24,
        "./routeData": 29
    }],
    29: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-30.
         */
        var PATH = require('../../../inside/lib/path');

        module.exports = {
            history: {

            },
            nowInfo: {},
            prevInfo: {},
            hashListener: true,
            rootPath: PATH.cwd,

        }

    }, {
        "../../../inside/lib/path": 56
    }],
    30: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-30.
         */
        'use strict';

        var exec = require('./exec');

        var routeData = require('./routeData');

        var redirect = require('./redirect');

        var PATH = require('../../../inside/lib/path');

        var getPathNormalize = require('./pathConvert').getNowPath;

        var appConf = require('../../../inside/config/index').appConf;

        var routeMode = appConf.route.mode;


        /*监听点击事件（主要用来监控当前点击的节点是否a标签 页面跳转）*/
        window.document.addEventListener('click', function(event) {
            var element = event.target;

            //检查当前点击是否在a标签范围内(主要作用获取a元素)
            while (element.nodeName !== 'A') {
                if (element === this || !(element = element.parentNode) || !element) return;
            }

            //检查是否需要进行外部跳转
            if (element.getAttribute('target') !== null) return;

            var href = element.getAttribute('href');

            if (!href) return;

            //检查是否返回
            if (element.getAttribute('isBack') !== null) {
                window.history.back();
                routeData.history.isBack = true;
                return;
            }

            //标识是否回退
            routeData.history.isBack = false;

            //检查是否网络绝对地址
            if (/^(\w+:)?\/\/(\w[\w\.]*)/.test(href)) return;

            //阻止默认的a标签跳转事件
            event.preventDefault();

            //获取跳转的地址
            href = decodeURI(PATH.normalize(href.replace(/^\.?[\/\\]/, '')));

            //页面重定向
            redirect(href, {}, routeData.history.isBack);

        }, false);

        function watch() {

            //检查当前路由模式
            switch (routeMode) {
                case 'html5':
                    /*监听当窗口历史记录改变。（html5模式的地址）*/
                    window.addEventListener('popstate', function(event) {
                        //此处做了兼容,避免项目路径与根路径不一样
                        exec(getPathNormalize(routeMode).replace(routeData.rootIntervalPath, ''));
                    }, false);
                    break;
                default:
                    routeMode = appConf.route.mode = 'hash';
                    /*监听当前文档hash改变。（当前hash模式的地址）*/
                    window.addEventListener('hashchange', function(e) {
                        //检查是否是点击跳转页面的
                        if (routeData.hashListener) {
                            exec(getPathNormalize(routeMode));
                        } else {
                            routeData.hashListener = true;
                        }
                    }, false);

            }
        };


        module.exports = watch;
    }, {
        "../../../inside/config/index": 32,
        "../../../inside/lib/path": 56,
        "./exec": 24,
        "./pathConvert": 27,
        "./redirect": 28,
        "./routeData": 29
    }],
    31: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-29.
         */

        'use strict';

        //内部事件
        var insideEvent = require('../inside/event/insideEvent');

        //框架应用配置
        var frameConf = require('../inside/config/index');

        //框架引导程序
        var boot = require('./boot/index');

        module.exports = {
            exec: function() {
                //触发配置初始化
                insideEvent.emit('config:init', this);

                //加载url路径配置
                frameConf.loadUrlConf(function(state) {
                    //引导启动
                    if (state) boot.start();
                });
            }
        }
    }, {
        "../inside/config/index": 32,
        "../inside/event/insideEvent": 39,
        "./boot/index": 23
    }],
    32: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-29.
         */
        var loadUrlConf = require('./lib/loadUrlConf');

        var commData = require('./lib/commData');

        var object = require('../../inside/lib/object');


        module.exports = {
            loadUrlConf: loadUrlConf,
            appConf: commData.appConf,
            insideConf: commData.insideConf,
            getCoustomConf: function(key) {
                return object.get(commData.customUseConf, key)
            }
        }
    }, {
        "../../inside/lib/object": 54,
        "./lib/commData": 33,
        "./lib/loadUrlConf": 36
    }],
    33: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-29.
         */


        //状态数据
        var stateData = {
            isConf: false,
            nowUrl: '',
            fileLength: 0
        };

        //框架内部配置
        var insideConf = {
            routeList: []
        }

        //自定义配置
        var customConf = {
            comm: {

            }
        }

        //自定义使用的配置
        var customUseConf = {};

        //配置
        var appConf = {
            //框架系统配置
            system: {
                //文件回调
                fileCallback: {
                    model: 'model',
                    view: 'view',
                    extend: 'extend',
                    presenter: 'presenter'
                },
                //模块目录名称
                moduleDirName: {
                    view: 'view',
                    extend: 'extend',
                    presenter: 'presenter',
                    model: 'model'
                },
                //文件后缀标识
                fileSuffix: {
                    view: '.view',
                    extend: '.extend',
                    presenter: '.presenter',
                    model: '.model'
                },
                //默认的视图或调度器器及模型 /切片
                moduleDefault: {
                    view: 'index',
                    model: 'index',
                    extend: 'index',
                    presenter: 'index',
                    viewSlice: 'index',
                    modelSlice: 'index',
                    extendSlice: 'index',
                    presenterSlice: 'index'
                }
            },
            route: {
                //路由模式
                mode: 'hash',
                //路由后缀
                suffix: '',
                //默认路由
                defaultUrl: null
            },
            pathList: [],
            //视图模板后缀
            tplSuffix: '.html',
            //默认视图请求方式
            viewRequire: 'ajax',
            //加载配置模式
            loadConfMode: []
        };

        //内部配置
        function innerConf(arg1, agr2) {
            if (arguments.length === 1) {
                if (arg1 instanceof Object) {
                    Object.keys(arg1).forEach(function(key) {
                        innerConf[key] = arg1[key];
                    })
                } else {
                    return innerConf[key];
                }
            } else if (arguments.length === 2) {
                if (typeof arg1 === 'string') {
                    innerConf[arg1] = agr2;
                }
            }
        }

        module.exports = {
            appConf: appConf,
            stateData: stateData,
            insideConf: insideConf,
            innerConf: innerConf,
            customConf: customConf,
            customUseConf: customUseConf
        }
    }, {}],
    34: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-31.
         */

        'use strict';
        var string = require('../../../inside/lib/string');
        var commData = require('../../../inside/config/lib/commData');

        //内部配置
        var insideConf = commData.insideConf;

        function configEndHandle() {

            //格式化后的路由存储
            var routeMaps = {
                    paths: [],
                    regExpPaths: [],
                    parameterPaths: []
                },
                suffix = commData.appConf.route.suffix;

            //格式化route路由数据
            insideConf.routeList.forEach(function(route) {
                routeFormat(route, {
                    childrenRoute: routeMaps,
                    suffix: suffix.charAt(0) === '.' ? suffix : '.' + suffix
                })
            });

            delete insideConf.routeList;

            //路由字典
            insideConf.routeMaps = routeMaps;

            //启动合并自定义配置 开启可用配置
            var customConf = commData.customConf,
                useConf = commData.customUseConf,
                commConf = customConf.comm;

            Object.keys(commConf).forEach(function(key) {
                useConf[key] = commConf[key];
            });

            commData.appConf.loadConfMode.forEach(function(mode) {
                if (customConf[mode] instanceof Object) {
                    Object.keys(customConf[mode]).forEach(function(key) {
                        useConf[key] = customConf[mode][key];
                    })
                }
            })
        }

        //路由格式化
        function routeFormat(route, parentInfo) {

            var nowInfo,
                suffix,
                routeInfo = route.routeInfo;

            //检查当前是否配置规则
            if (parentInfo && !routeInfo.routeType) {
                nowInfo = parentInfo
            } else {
                suffix = routeInfo.conf.suffix = routeInfo.conf.suffix || parentInfo.suffix;
                nowInfo = {
                    paths: [],
                    regExpPaths: [],
                    parameterPaths: [],
                    childrenRoute: {
                        paths: [],
                        regExpPaths: [],
                        parameterPaths: [],
                    },
                    routeType: routeInfo.routeType,
                    //检查路由后缀
                    suffix: routeInfo.conf.suffix = suffix.charAt(0) === '.' ? suffix : '.' + suffix
                }
            }

            //检查是否拥有配置规则
            if (routeInfo.routeType) {

                //对常规路由进行长度排序
                nowInfo.paths = (nowInfo.paths.concat(routeInfo.paths).sort(function(berfor, after) {
                    return berfor.length - after.length;
                })).reduce(function(res, rule) {
                    res.push({
                        rule: rule,
                        conf: routeInfo.conf,
                        autoRoute: routeInfo.autoRoute,
                        childrenRoute: nowInfo.childrenRoute
                    });
                    return res;
                }, []);

                //参数路由规则
                nowInfo.parameterPaths = nowInfo.parameterPaths.concat(routeInfo.parameterPaths).reduce(function(res, rule) {
                    var pathStr = rule[0],
                        parameter = rule[1],
                        regExpStr = '',
                        _regExpStr,
                        parKey,
                        parVal,
                        parameterMap = {},
                        stringMatch;

                    //分解参数路由中的参数标识
                    while (stringMatch = pathStr.match(/\{\s*([\w$-]+)\s*\}/)) {
                        _regExpStr = pathStr;

                        pathStr = pathStr.slice(stringMatch.index + stringMatch[0].length);
                        parKey = stringMatch[1];

                        //检查参数标识是否存在回调中
                        parVal = parameter[parKey]
                        if (parVal) {
                            //检查参数匹配类型
                            if (typeof parVal === 'string') {
                                regExpStr += _regExpStr.slice(0, stringMatch.index) + parVal;
                            } else if (parVal instanceof RegExp) {
                                regExpStr += _regExpStr.slice(0, stringMatch.index) + parVal.source;
                            }
                            parameterMap[parKey] = {
                                index: stringMatch.index,
                                rule: parVal
                            }
                        }
                    }

                    res.push({
                        rule: new RegExp('^' + regExpStr + pathStr + '$'),
                        parameter: parameterMap,
                        conf: routeInfo.conf,
                        autoRoute: routeInfo.autoRoute,
                        childrenRoute: nowInfo.childrenRoute
                    });
                    return res;
                }, []);

                //正则路由规则
                nowInfo.regExpPaths = nowInfo.regExpPaths.concat(routeInfo.regExpPaths).reduce(function(res, rule) {
                    res.push({
                        rule: new RegExp('^' + rule.source.replace(/^\^/, '').replace(/\$$/, '') + '$'),
                        conf: routeInfo.conf,
                        autoRoute: routeInfo.autoRoute,
                        childrenRoute: nowInfo.childrenRoute
                    });
                    return res;
                }, []);
            }

            //遍历子路由
            routeInfo.childrenRoute.forEach(function(childRoute) {
                routeFormat(childRoute, nowInfo);
            });

            //添加到父路由中
            if (parentInfo && routeInfo.routeType) {
                var childrenRoute = parentInfo.childrenRoute;
                childrenRoute.paths = childrenRoute.paths.concat(nowInfo.paths);
                childrenRoute.regExpPaths = childrenRoute.regExpPaths.concat(nowInfo.regExpPaths);
                childrenRoute.parameterPaths = childrenRoute.parameterPaths.concat(nowInfo.parameterPaths);
            }

            nowInfo.forEach(function(key) {
                delete nowInfo[key];
            });

            routeInfo.forEach(function(key) {
                delete routeInfo[key];
            });

        }


        module.exports = configEndHandle;
    }, {
        "../../../inside/config/lib/commData": 33,
        "../../../inside/lib/string": 58
    }],
    35: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-29.
         */
        'use strict';
        var log = require('../../log/log');
        var path = require('../../lib/path');
        var jsonp = require('../../lib/net/jsonp');
        var commData = require('./commData');
        var routeConf = require('./routeConf');
        var componentMange = require('./../../../engine/view/lib/componentManage');
        var directiveManage = require('./../../../engine/view/lib/directiveManage');
        var serverEngine = require('./../../../engine/server/index');


        //空方法
        var noop = function() {

            },
            appConf = commData.appConf,
            stateData = commData.stateData;

        /*配置对象接口*/
        function configIniterface() {

        };

        /*系统配置*/
        configIniterface.prototype.system = function(config) {
            var systemConfig = appConf.system,
                fileCallback = systemConfig.fileCallback,
                fileSuffix = systemConfig.fileSuffix,
                moduleDirName = systemConfig.moduleDirName,
                moduleDefault = systemConfig.moduleDefault,
                tmpData;

            //检查配置
            if (typeof config === 'object') {

                //检查回调函数名称
                if (typeof(tmpData = config.fileCallback) === 'object') {
                    typeof tmpData.model === 'string' && (fileCallback.model = tmpData.model);
                    typeof tmpData.view === 'string' && (fileCallback.view = tmpData.view);
                    typeof tmpData.presenter === 'string' && (fileCallback.presenter = tmpData.presenter);
                }

                //检查文件后缀
                if (typeof(tmpData = config.fileSuffix) === 'object') {
                    typeof tmpData.model === 'string' && (fileSuffix.model = '.' + tmpData.model.replace(/^\./, ''));
                    typeof tmpData.view === 'string' && (fileSuffix.view = '.' + tmpData.view.replace(/^\./, ''));
                    typeof tmpData.presenter === 'string' && (fileSuffix.presenter = '.' + tmpData.presenter.replace(/^\./, ''));
                }

                //模块目录名称
                if (typeof(tmpData = config.moduleDirName) === 'object') {
                    typeof tmpData.model === 'string' && (moduleDirName.model = tmpData.model);
                    typeof tmpData.view === 'string' && (moduleDirName.view = tmpData.view);
                    typeof tmpData.presenter === 'string' && (moduleDirName.presenter = tmpData.presenter);
                }

                //默认的视图或调度器器及模型 /切片
                if (typeof(tmpData = config.moduleDefault) === 'object') {
                    typeof tmpData.model === 'string' && (moduleDefault.model = tmpData.model);
                    typeof tmpData.view === 'string' && (moduleDefault.view = tmpData.view);
                    typeof tmpData.presenter === 'string' && (moduleDefault.presenter = tmpData.presenter);
                    typeof tmpData.modelSlice === 'string' && (moduleDefault.modelSlice = tmpData.modelSlice);
                    typeof tmpData.viewSlice === 'string' && (moduleDefault.viewSlice = tmpData.viewSlice);
                    typeof tmpData.presenterSlice === 'string' && (moduleDefault.presenterSlice = tmpData.presenterSlice);
                }

            } else {
                log.warn('系统配置参类型应该是Object!');
            }

        };


        /*路由模式 【 # hash 与 / html5 】默认hash */
        configIniterface.prototype.routeMode = function(config) {
            appConf.route.mode = config;
        };

        /*默认的路由*/
        configIniterface.prototype.defaultUrl = function(config) {
            appConf.route.defaultUrl = config;
        };

        /*路由后缀 默认空*/
        configIniterface.prototype.routeSuffix = function(config) {
            appConf.route.suffix = '.' + config.replace(/^\./, '');
        };

        /*视图模板后缀 默认html*/
        configIniterface.prototype.tplSuffix = function(config) {
            appConf.tplSuffix = config.replace(/^\.+/, '');
        };

        /*视图请求方式 【 ajax 与 jsonp 】 默认ajax*/
        configIniterface.prototype.viewRequire = function(config) {
            appConf.viewRequire = config;
        };

        /*路由配置*/
        configIniterface.prototype.route = routeConf;

        /*应用模块*/
        configIniterface.prototype.module = function(config) {

        };

        /**
         * 自定义配置
         * @param key
         * @param conf
         * @param mode
         */
        configIniterface.prototype.custom = function(conf, mode) {
            var customConf = commData.customConf;

            //检查是否设置模式
            if (typeof mode !== 'string') mode = 'comm';

            customConf[mode] = commData.customConf[mode] || {};

            //配置收集
            Object.keys(conf).forEach(function(key) {
                customConf[mode][key] = conf[key];
            })
        };

        //加载配置模式
        configIniterface.prototype.loadConfMode = function(mode) {
            [].slice.call(arguments).forEach(function(mode) {
                commData.appConf.loadConfMode.push(mode)
            });
        };

        /*应用路径配置*/
        configIniterface.prototype.path = function(config) {
            Object.keys(config).forEach(function(key) {
                appConf.pathList.push({
                    regExp: RegExp('^' + key + '([/@:]([\\S]*))?$'),
                    path: config[key],
                    len: key.length
                });
            });

            //根据路径长度来排序
            appConf.pathList = appConf.pathList.sort(function(pev, next) {
                return next.len - pev.len;
            });
        };

        //组件注册
        configIniterface.prototype.component = componentMange.register;

        //指令注册
        configIniterface.prototype.directive = directiveManage.register;

        //服务注册
        configIniterface.prototype.server = serverEngine.serverRegister;

        /*应用配置扩展*/
        configIniterface.prototype.include = function(config) {
            var This = this,
                fileLength = 0,
                //保存当前层级的路径
                nowUrl = stateData.nowUrl;

            function callback() {
                if (--fileLength === 0) {
                    //加载完毕后恢复当前资源URL
                    stateData.nowUrl = nowUrl;
                    stateData.callback();
                }
            }

            //检查配置包含类型
            if (config instanceof Array) {
                config.forEach(function(confUrl) {
                    fileLength++;
                    getConfig(confUrl, This, 'config', callback);
                });
            } else if (config instanceof Object) {
                Object.keys(config).forEach(function(key) {
                    fileLength++;
                    getConfig(config[key], This, key, callback);
                })
            }
        };

        /**
         * 配置读取
         * @param confArgs
         * @param callback
         * @param url
         * @param parentInterface
         */
        function configRead(confArgs, callback, url, parentInterface) {
            var confKey,
                confFn,
                fileLen = stateData.fileLength,
                nowCallbck = stateData.callback;

            //当前资源URL
            stateData.nowUrl = url;

            if (!parentInterface) {
                parentInterface = new configIniterface();
                stateData.interface = parentInterface;
            }

            switch (confArgs.length) {
                case 1:
                    confFn = confArgs[0];
                    break;
                case 2:
                    confKey = confArgs[0];
                    confFn = confArgs[1];
                    break;
            }

            //避免配置错误导致无限循环
            try {
                //配置回调执行
                confFn(parentInterface, commData.innerConf);
            } catch (e) {
                callback();
                return log.warn(e)
            }

            //检查是否有新文件需要加载
            if (fileLen !== stateData.fileLength) {
                stateData.callback = function() {
                    stateData.callback = nowCallbck;
                    callback();
                };
            } else {
                callback();
            }
            //后续支持设置配置Key
        }

        function getConfig(configUrl, Interface, jsonpCallback, callback) {

            //记录加载文件数
            stateData.fileLength++;

            //获取当前文件的绝对地址
            configUrl = path.resolve(configUrl, stateData.nowUrl);

            //获取配置数据
            jsonp({
                url: configUrl,
                jsonpCallback: jsonpCallback,
                complete: function(data) {
                    //检查返回的状态
                    if (this.state) {
                        //返回的数据处理(检查是否有多个回调)
                        var count = 0;

                        //检查是否多个jsonp切片
                        (this.many ? [].slice.call(arguments) : [
                            [].slice.call(arguments)
                        ]).forEach(function(confArgs) {
                            count++;
                            //请求完毕后处理配置解析
                            configRead(confArgs, function() {
                                if (--count === 0) {
                                    stateData.fileLength--
                                        callback(true);
                                }
                            }, configUrl, Interface);
                        });
                    } else {
                        log.warn('应用引导配置出错，请检查！ (' + this.option.url + ')');
                    }
                }
            });

        }


        module.exports = {
            configRead: configRead,
            configIniterface: configIniterface
        };
    }, {
        "../../lib/net/jsonp": 53,
        "../../lib/path": 56,
        "../../log/log": 61,
        "./../../../engine/server/index": 10,
        "./../../../engine/view/lib/componentManage": 16,
        "./../../../engine/view/lib/directiveManage": 17,
        "./commData": 33,
        "./routeConf": 37
    }],
    36: [function(require, module, exports) {
        'use strict';
        var log = require('../../log/log');
        var jsonp = require('../../lib/net/jsonp');
        var confAPI = require('./initerface');
        var commData = require('./commData');
        var configEndHandle = require('./configEndHandle');

        //加载url路径中配置
        function loadUrlConf(callback) {
            var configUrl,
                configScript = document.querySelector('script[app-config]');

            //检查是否设置脚本配置
            if (configScript) {
                //获取应用配置路径
                configUrl = configScript.getAttribute('app-config');

                //获取配置数据
                jsonp({
                    url: configUrl,
                    jsonpCallback: 'config',
                    complete: function(data) {
                        //检查返回的状态
                        if (this.state) {
                            var agrs = (this.many ? [].slice.call(arguments) : [
                                [].slice.call(arguments)
                            ]);
                            var count = agrs.length;

                            //返回的数据处理(检查是否有多个回调)
                            agrs.forEach(function(confArgs) {
                                //请求完毕后处理配置解析
                                confAPI.configRead(confArgs, function() {
                                    if (--count === 0 && typeof callback === "function") {
                                        //调用配置处理
                                        configEndHandle();
                                        callback(true);
                                    }
                                }, configUrl);
                            });

                        } else {
                            log.warn('应用引导配置出错，请检查！ (' + this.option.url + ')');
                        }
                    }
                });
            } else if (callback instanceof Function) {
                callback(false);
            }
        }


        module.exports = loadUrlConf
    }, {
        "../../lib/net/jsonp": 53,
        "../../log/log": 61,
        "./commData": 33,
        "./configEndHandle": 34,
        "./initerface": 35
    }],
    37: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-31.
         */
        'use strict';

        var commData = require('./commData');

        /**
         * 路由配置
         */
        function routeConf() {
            var conf,
                routeFn,
                routeInfo,
                //常规路径
                paths = [],
                //正则路径
                regExpPaths = [],
                //参数路径
                parameterPaths = [],
                //路由path类型(默认常规路由 n, 参数 p, 正则 r)
                routeType = [],
                //父级路由
                routeRoot = this,
                //当前路由解析器
                selfRouteParse = new routeParse();

            //参数归类
            [].slice.call(arguments).forEach(function(arg) {
                if (arg instanceof Array) {
                    parameterPaths.push(arg);
                    if (routeType.indexOf('p') === -1) routeType.push('p');
                } else if (arg instanceof Function) {
                    routeFn = arg;
                } else if (arg instanceof RegExp) {
                    regExpPaths.push(arg);
                    if (routeType.indexOf('r') === -1) routeType.push('r');
                } else if (typeof arg === 'string') {
                    paths.push(arg);
                    if (routeType.indexOf('n') === -1) routeType.push('n');
                } else if (arg instanceof Object) {
                    conf = arg;
                }
            });

            //路由器信息存储
            selfRouteParse.routeInfo = {
                paths: paths,
                conf: conf,
                regExpPaths: regExpPaths,
                parameterPaths: parameterPaths,
                routeType: routeType.join(''),
                childrenRoute: []
            };

            //添加并合并子路由信息
            if (routeRoot instanceof routeParse) {
                routeRoot.routeInfo.childrenRoute.push(selfRouteParse)
            } else {
                //添加到内部配置中
                commData.insideConf.routeList.push(selfRouteParse);
            }
            //执行路由处理器（子路由回调）
            if (routeFn) routeFn(selfRouteParse);

            return routeRoot instanceof routeParse ? routeRoot : selfRouteParse;
        };

        /**
         * 路由解析
         * @param routeRoot
         */
        function routeParse() {
            //路由器信息存储
            this.routeInfo = {};
        }

        //路由规则配置
        routeParse.prototype.when = routeConf;

        //当找不到路由,重定向
        routeParse.prototype.other = function() {
            return this;
        };

        //自动路由
        routeParse.prototype.autoRoute = function(option) {
            this.routeInfo.autoRoute = option;
            return this;
        };

        //路由拦截器
        routeParse.prototype.interceptor = function() {
            return this;
        };

        //路由路径后缀
        routeParse.prototype.suffix = function(suffix) {
            if (typeof suffix === 'string') this.routeInfo.suffix = suffix;
            return this;
        };


        module.exports = routeConf;
    }, {
        "./commData": 33
    }],
    38: [function(require, module, exports) {
        /**
         * Created by xiyuan on 15-12-2.
         */
        'use strict';
        var eventInterface = function() {
            this.eventStroage = {};
        };

        //监听
        eventInterface.prototype.watch = function(eventName, callback) {
            if (typeof callback !== "function") {
                return false
            }
            var eventStroage = this.eventStroage[eventName];
            this.eventStroage[eventName] = eventStroage ? eventStroage.push(callback) && eventStroage : [callback];
        };

        //触发 @eventName : 事件名称  @target : 事件对象
        eventInterface.prototype.emit = function(eventName, target) {
            (this.eventStroage[eventName] || []).forEach(function(fn) {
                fn(target, eventName);
            });
        };

        //销毁
        eventInterface.prototype.destroy = function(eventName, callback) {
            var eventStroage = this.eventStroage[eventName] || [];
            if (callback) {
                var local = eventStroage.indexOf(callback);
                if (local !== -1) eventStroage.splice(local, 1);
            } else {
                delete this.eventStroage[eventName];
            }
        };

        module.exports = eventInterface;
    }, {}],
    39: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-29.
         */

        'use strict';
        var eventInterface = require('./eventInterface');

        var insideEvent = new eventInterface();

        /*监听配置初始化开始*/
        insideEvent.watch('config:init', function() {
            // console.log('yes')
        });

        /*监听配置加载*/
        insideEvent.watch('config:load', function(event) {

        });

        /*监听配置初始化完毕*/
        insideEvent.watch('config:end', function(event) {

        });

        /*监听框架是否开始运行*/
        insideEvent.watch('boot:start', function(event) {

        });

        /*监听路由开始*/
        insideEvent.watch('route:start', function(event) {
            // console.log(this,event)
        });

        /*页面渲染事件*/
        insideEvent.watch('page:render', function(event) {
            //代理框架外部页面渲染事件
        });


        module.exports = insideEvent;
    }, {
        "./eventInterface": 38
    }],
    40: [function(require, module, exports) {
        /**
         * Created by xiyuan on 15-11-30.
         */

        "use strict";

        function uint8ArrayToBase64(bytes) {
            var binary = '';
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        };

        function arrayBufferToBase64(buffer) {
            return uint8ArrayToBase64(new Uint8Array(buffer))
        };

        function uint8ArrayToImage(bytes, fileName) {
            return 'data:image/' + (fileName || 'png').match(/[^\.\s\\\/]+$/) +
                ';base64,' +
                uint8ArrayToBase64(bytes);
        };

        function arrayBufferToImage(buffer, fileName) {
            return uint8ArrayToImage(new Uint8Array(buffer), fileName);
        };

        module.exports = {
            uint8ArrayToBase64: uint8ArrayToBase64,
            arrayBufferToBase64: arrayBufferToBase64,
            uint8ArrayToImage: uint8ArrayToImage,
            arrayBufferToImage: arrayBufferToImage
        }


    }, {}],
    41: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-3-7.
         */
        "use strict";

        /**
         * 时间转换
         * @param date
         * @param layout
         * @returns {*}
         */
        function convert(date, layout) {

            if (typeof date === 'number' || typeof date === 'string') {
                date = new Date(Number(date));
            }

            if (!(date instanceof Date)) {
                date = new Date();
            }

            if (typeof layout === "string") {
                date = format(date, layout)
            }
            return date;
        };

        //获取时间戳
        function timestamp(date) {
            return convert(date).getTime();
        };

        //获取年份
        function getFullYear(data) {
            return convert(data).getFullYear();
        };

        //获取月份
        function getMonth(data) {
            return convert(data).getMonth() + 1
        };

        //获取日
        function getDate(data) {
            return convert(data).getDate();
        };

        //获取时
        function getHours(data) {
            return convert(data).getHours();
        };

        //获取分
        function getMinutes(data) {
            return convert(data).getMinutes();
        };

        //获取秒
        function getSeconds(data) {
            return convert(data).getSeconds();
        };

        /*java时间戳转换*/
        function format(data, layout) {
            var time = convert(data);
            var year = time.getFullYear()
            var month = time.getMonth() + 1
            var date = time.getDate()
            var hours = time.getHours()
            var minutes = time.getMinutes() >= 10 ? time.getMinutes() : time.getMinutes();
            var seconds = time.getSeconds()
            if (typeof layout !== "string") {
                layout = year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
            } else {
                layout = layout.replace(/yy/i, year)
                layout = layout.replace(/y/i, String(year).slice(-2))
                layout = layout.replace(/mm/i, month > 9 ? month : '0' + month)
                layout = layout.replace(/m/i, month)
                layout = layout.replace(/dd/i, date > 9 ? date : '0' + date)
                layout = layout.replace(/d/i, date)
                layout = layout.replace(/hh/i, hours > 9 ? hours : '0' + hours)
                layout = layout.replace(/h/i, hours)
                layout = layout.replace(/ii/i, minutes > 9 ? minutes : '0' + minutes)
                layout = layout.replace(/i/i, minutes)
                layout = layout.replace(/ss/i, seconds > 9 ? seconds : '0' + seconds)
                layout = layout.replace(/s/i, seconds)
            }
            return layout;
        };

        /*添加秒*/
        function addMinutes(date, minutes) {
            date = convert(date);
            date.setMinutes(date.getMinutes() + minutes);
            return date;
        };

        /*获取当前月份有多少天*/
        function getMonthCountDate(date) {
            date = convert(date);
            date = new Date(date.getTime());
            date.setMonth(date.getMonth() + 1);
            date.setDate(0);
            return date.getDate();
        };

        /*获取第几周*/
        function getNowWeek(nowDate) {
            nowDate = convert(nowDate);
            var startDate = new Date(nowDate.getTime());
            startDate.setMonth(0);
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);

            var countDay = (nowDate.getTime() - startDate.getTime()) / 1000 / 60 / 60 / 24 + 1,
                tmpDay = countDay - (8 - startDate.getDay());

            return (tmpDay > 0 ? Math.ceil(tmpDay / 7) : 0) + 1;
        };

        module.exports = {
            convert: convert,
            timestamp: timestamp,
            getFullYear: getFullYear,
            getMonth: getMonth,
            getDate: getDate,
            getHours: getHours,
            getMinutes: getMinutes,
            getSeconds: getSeconds,
            format: format,
            addMinutes: addMinutes,
            getMonthCountDate: getMonthCountDate,
            getNowWeek: getNowWeek
        }

    }, {}],
    42: [function(require, module, exports) {
        /**
         * Created by xiyuan on 15-11-30.
         */
        "use strict";

        exports.encode = function(str) {
            var c1, c2, c3;
            var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            var i = 0,
                len = str.length,
                string = '';

            while (i < len) {
                c1 = str.charCodeAt(i++) & 0xff;
                if (i === len) {
                    string += base64EncodeChars.charAt(c1 >> 2);
                    string += base64EncodeChars.charAt((c1 & 0x3) << 4);
                    string += "==";
                    break;
                }
                c2 = str.charCodeAt(i++);
                if (i === len) {
                    string += base64EncodeChars.charAt(c1 >> 2);
                    string += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                    string += base64EncodeChars.charAt((c2 & 0xF) << 2);
                    string += "=";
                    break;
                }
                c3 = str.charCodeAt(i++);
                string += base64EncodeChars.charAt(c1 >> 2);
                string += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                string += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
                string += base64EncodeChars.charAt(c3 & 0x3F)
            }
            return string
        };

        exports.decode = function(str) {
            var c1, c2, c3, c4;
            var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57,
                58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6,
                7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
                25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
                37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
            );
            var i = 0,
                len = str.length,
                string = '';

            while (i < len) {
                do {
                    c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff]
                } while (
                    i < len && c1 === -1
                );

                if (c1 === -1) break;

                do {
                    c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff]
                } while (
                    i < len && c2 === -1
                );

                if (c2 === -1) break;

                string += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

                do {
                    c3 = str.charCodeAt(i++) & 0xff;
                    if (c3 === 61)
                        return string;

                    c3 = base64DecodeChars[c3]
                } while (
                    i < len && c3 === -1
                );

                if (c3 === -1) break;

                string += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

                do {
                    c4 = str.charCodeAt(i++) & 0xff;
                    if (c4 === 61) return string;
                    c4 = base64DecodeChars[c4]
                } while (
                    i < len && c4 === -1
                );

                if (c4 === -1) break;

                string += String.fromCharCode(((c3 & 0x03) << 6) | c4)
            }
            return string;
        }



    }, {}],
    43: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-27.
         */
        "use strict";

        var hexcase = 0;
        var base64 = require('./base64');

        /**
         * 将原始字符串转换为十六进制字符串
         * @param input
         * @returns {string}
         */
        function rstr2hex(input) {
            try {
                hexcase
            } catch (e) {
                hexcase = 0;
            }
            var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
            var output = "";
            var x;
            for (var i = 0; i < input.length; i++) {
                x = input.charCodeAt(i);
                output += hex_tab.charAt((x >>> 4) & 0x0F) +
                    hex_tab.charAt(x & 0x0F);
            }
            return output;
        }

        /**
         * Convert an array of big-endian words to a string
         * @param input
         * @returns {string}
         */
        function binb2rstr(input) {
            var output = "";
            for (var i = 0; i < input.length * 32; i += 8)
                output += String.fromCharCode((input[i >> 5] >>> (24 - i % 32)) & 0xFF);
            return output;
        }

        /**
         * Add integers, wrapping at 2^32. This uses 16-bit operations internally
         * to work around bugs in some JS interpreters.
         * @param x
         * @param y
         * @returns {number}
         */
        function safe_add(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }

        /**
         *
         * Bitwise rotate a 32-bit number to the left.
         * @param num
         * @param cnt
         * @returns {number}
         */
        function bit_rol(num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
        }

        /*
         * Perform the appropriate triplet combination var for=function the current
         * iteration
         */
        function sha1_ft(t, b, c, d) {
            if (t < 20) return (b & c) | ((~b) & d);
            if (t < 40) return b ^ c ^ d;
            if (t < 60) return (b & c) | (b & d) | (c & d);
            return b ^ c ^ d;
        }

        /*
         * Determine the appropriate additive constant for the current iteration
         */
        function sha1_kt(t) {
            return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 :
                (t < 60) ? -1894007588 : -899497514;
        }

        /*
         * Calculate the SHA-1 of an array of big-endian words, and a bit length
         */
        function binbexports(x, len) {
            /* append padding */
            x[len >> 5] |= 0x80 << (24 - len % 32);
            x[((len + 64 >> 9) << 4) + 15] = len;

            var w = Array(80);
            var a = 1732584193;
            var b = -271733879;
            var c = -1732584194;
            var d = 271733878;
            var e = -1009589776;

            for (var i = 0; i < x.length; i += 16) {
                var olda = a;
                var oldb = b;
                var oldc = c;
                var oldd = d;
                var olde = e;

                for (var j = 0; j < 80; j++) {
                    if (j < 16) w[j] = x[i + j];
                    else w[j] = bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                    var t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)),
                        safe_add(safe_add(e, w[j]), sha1_kt(j)));
                    e = d;
                    d = c;
                    c = bit_rol(b, 30);
                    b = a;
                    a = t;
                }

                a = safe_add(a, olda);
                b = safe_add(b, oldb);
                c = safe_add(c, oldc);
                d = safe_add(d, oldd);
                e = safe_add(e, olde);
            }
            return Array(a, b, c, d, e);
        }


        /*
         * Convert a raw string to an array of big-endian words
         * Characters >255 have their high-byte silently ignored.
         */
        function rstr2binb(input) {
            var output = Array(input.length >> 2);
            for (var i = 0; i < output.length; i++)
                output[i] = 0;
            for (var i = 0; i < input.length * 8; i += 8)
                output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
            return output;
        }

        /**
         * Calculate the SHA1 of a raw string
         * @param s
         * @returns {string}
         */
        function rstrexports(s) {
            return binb2rstr(binbexports(rstr2binb(s), s.length * 8));
        }

        module.exports = {
            safe_add: safe_add,
            rstr2hex: rstr2hex,
            rstr2binb: rstr2binb,
            binb2rstr: binb2rstr,
            rstrexports: rstrexports
        }

        /**
         * Convert a raw string to an array of little-endian words
         * Characters >255 have their high-byte silently ignored.
         * @param input
         * @returns {*}
         */
        function rstr2binl(input) {
            var output = Array(input.length >> 2);
            for (var i = 0; i < output.length; i++)
                output[i] = 0;
            for (var i = 0; i < input.length * 8; i += 8)
                output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
            return output;
        }

        /**
         * 将原始字符串转换为任意字符串编码
         * @param input
         * @param encoding
         * @returns {string}
         */
        function rstr2any(input, encoding) {
            var divisor = encoding.length;
            var i, j, q, x, quotient;

            /* Convert to an array of 16-bit big-endian values, forming the dividend */
            var dividend = Array(Math.ceil(input.length / 2));
            for (i = 0; i < dividend.length; i++) {
                dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
            }
            var full_length = Math.ceil(input.length * 8 /
                (Math.log(encoding.length) / Math.log(2)));
            var remainders = Array(full_length);
            for (j = 0; j < full_length; j++) {
                quotient = Array();
                x = 0;
                for (i = 0; i < dividend.length; i++) {
                    x = (x << 16) + dividend[i];
                    q = Math.floor(x / divisor);
                    x -= q * divisor;
                    if (quotient.length > 0 || q > 0)
                        quotient[quotient.length] = q;
                }
                remainders[j] = x;
                dividend = quotient;
            }

            /* Convert the remainders to the output string */
            var output = "";
            for (i = remainders.length - 1; i >= 0; i--)
                output += encoding.charAt(remainders[i]);

            return output;
        }

        /**
         * 对HMAC MD5计算，和一些关键日期（原始的字符串）
         * @param key
         * @param data
         */
        function rstr_hmacexports(key, data) {
            var bkey = rstr2binl(key);
            if (bkey.length > 16) bkey = binlexports(bkey, key.length * 8);

            var ipad = Array(16),
                opad = Array(16);
            for (var i = 0; i < 16; i++) {
                ipad[i] = bkey[i] ^ 0x36363636;
                opad[i] = bkey[i] ^ 0x5C5C5C5C;
            }

            var hash = binlexports(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
            return binl2rstr(binlexports(opad.concat(hash), 512 + 128));
        };

        /**
         * UTF-16编码字符串
         * @param input
         * @returns {string}
         */
        function str2rstr_utf16be(input) {
            var output = "";
            for (var i = 0; i < input.length; i++)
                output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
                    input.charCodeAt(i) & 0xFF);
            return output;
        }

        /**
         * Encode a string as utf-16
         * @param input
         * @returns {string}
         */
        function str2rstr_utf16le(input) {
            var output = "";
            for (var i = 0; i < input.length; i++)
                output += String.fromCharCode(input.charCodeAt(i) & 0xFF,
                    (input.charCodeAt(i) >>> 8) & 0xFF);
            return output;
        }

        /**
         * Convert an array of little-endian words to a string
         * @param input
         * @returns {string}
         */
        function binl2rstr(input) {
            var output = "";
            for (var i = 0; i < input.length * 32; i += 8)
                output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
            return output;
        }

        /**
         * HMAC-SHA1 计算的一些关键日期（原始的字符串）
         * @param key
         * @param data
         * @returns {*}
         */
        function rstr_hmacexports(key, data) {
            var bkey = rstr2binb(key);
            if (bkey.length > 16) bkey = binbexports(bkey, key.length * 8);

            var ipad = Array(16),
                opad = Array(16);
            for (var i = 0; i < 16; i++) {
                ipad[i] = bkey[i] ^ 0x36363636;
                opad[i] = bkey[i] ^ 0x5C5C5C5C;
            }

            var hash = binbexports(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
            return binb2rstr(binbexports(opad.concat(hash), 512 + 160));
        }



    }, {
        "./base64": 42
    }],
    44: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-27.
         */
        'use strict';
        module.exports = {
            uid: require('./uid'),
            base64: require('./base64'),
            md5: require('./md5'),
            utf8: require('./utf8'),
            sha256: require('./sha256'),
        }
    }, {
        "./base64": 42,
        "./md5": 45,
        "./sha256": 46,
        "./uid": 47,
        "./utf8": 48
    }],
    45: [function(require, module, exports) {

        "use strict";

        var utf8 = require('./utf8');

        var commLib = require('./commLib');

        var str2rstr_utf8 = utf8.encode;

        module.exports = function md5(s) {
            return commLib.rstr2hex(commLib.rstrexports(str2rstr_utf8(s)));
        };
    }, {
        "./commLib": 43,
        "./utf8": 48
    }],
    46: [function(require, module, exports) {


        var b64pad = "=";

        var commLib = require('./commLib');

        var safe_add = commLib.safe_add;

        function rstr_sha256(s) {
            return commLib.binb2rstr(binb_sha256(commLib.rstr2binb(s), s.length * 8));
        }

        /*
         * Convert a raw string to a base-64 string
         */
        function rstr2b64(input) {
            try {
                b64pad
            } catch (e) {
                b64pad = '';
            }
            var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            var output = "";
            var len = input.length;
            for (var i = 0; i < len; i += 3) {
                var triplet = (input.charCodeAt(i) << 16) |
                    (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) |
                    (i + 2 < len ? input.charCodeAt(i + 2) : 0);
                for (var j = 0; j < 4; j++) {
                    if (i * 8 + j * 6 > input.length * 8) output += b64pad;
                    else output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
                }
            }
            return output;
        }


        /*
         * Encode a string as utf-8.
         * For efficiency, this assumes the input is valid utf-16.
         */
        function str2rstr_utf8(input) {
            var output = "";
            var i = -1;
            var x, y;

            while (++i < input.length) {
                /* Decode utf-16 surrogate pairs */
                x = input.charCodeAt(i);
                y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
                if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
                    x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                    i++;
                }

                /* Encode output as utf-8 */
                if (x <= 0x7F)
                    output += String.fromCharCode(x);
                else if (x <= 0x7FF)
                    output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
                        0x80 | (x & 0x3F));
                else if (x <= 0xFFFF)
                    output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                        0x80 | ((x >>> 6) & 0x3F),
                        0x80 | (x & 0x3F));
                else if (x <= 0x1FFFFF)
                    output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                        0x80 | ((x >>> 12) & 0x3F),
                        0x80 | ((x >>> 6) & 0x3F),
                        0x80 | (x & 0x3F));
            }
            return output;
        }

        /*
         * Main sha256 function, with its support functions
         */
        var sha256_S = function(X, n) {
            return (X >>> n) | (X << (32 - n));
        }

        var sha256_R = function(X, n) {
            return (X >>> n);
        }

        var sha256_Ch = function(x, y, z) {
            return ((x & y) ^ ((~x) & z));
        }

        var sha256_Maj = function(x, y, z) {
            return ((x & y) ^ (x & z) ^ (y & z));
        }

        var sha256_Sigma0256 = function(x) {
            return (sha256_S(x, 2) ^ sha256_S(x, 13) ^ sha256_S(x, 22));
        }

        var sha256_Sigma1256 = function(x) {
            return (sha256_S(x, 6) ^ sha256_S(x, 11) ^ sha256_S(x, 25));
        }

        var sha256_Gamma0256 = function(x) {
            return (sha256_S(x, 7) ^ sha256_S(x, 18) ^ sha256_R(x, 3));
        }

        var sha256_Gamma1256 = function(x) {
            return (sha256_S(x, 17) ^ sha256_S(x, 19) ^ sha256_R(x, 10));
        }

        var sha256_Sigma0512 = function(x) {
            return (sha256_S(x, 28) ^ sha256_S(x, 34) ^ sha256_S(x, 39));
        }

        var sha256_Sigma1512 = function(x) {
            return (sha256_S(x, 14) ^ sha256_S(x, 18) ^ sha256_S(x, 41));
        }

        var sha256_Gamma0512 = function(x) {
            return (sha256_S(x, 1) ^ sha256_S(x, 8) ^ sha256_R(x, 7));
        }

        var sha256_Gamma1512 = function(x) {
            return (sha256_S(x, 19) ^ sha256_S(x, 61) ^ sha256_R(x, 6));
        }

        var sha256_K = new Array(
            1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993, -1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987,
            1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522,
            264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585,
            113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
            1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885, -1035236496, -949202525, -778901479, -694614492, -200395387, 275423344,
            430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
            1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872, -1866530822, -1538233109, -1090935817, -965641998
        );

        function binb_sha256(m, l) {
            var HASH = new Array(1779033703, -1150833019, 1013904242, -1521486534,
                1359893119, -1694144372, 528734635, 1541459225);
            var W = new Array(64);
            var a, b, c, d, e, f, g, h;
            var i, j, T1, T2;

            /* append padding */
            m[l >> 5] |= 0x80 << (24 - l % 32);
            m[((l + 64 >> 9) << 4) + 15] = l;

            for (i = 0; i < m.length; i += 16) {
                a = HASH[0];
                b = HASH[1];
                c = HASH[2];
                d = HASH[3];
                e = HASH[4];
                f = HASH[5];
                g = HASH[6];
                h = HASH[7];

                for (j = 0; j < 64; j++) {
                    if (j < 16) W[j] = m[j + i];
                    else W[j] = safe_add(safe_add(safe_add(sha256_Gamma1256(W[j - 2]), W[j - 7]),
                        sha256_Gamma0256(W[j - 15])), W[j - 16]);

                    T1 = safe_add(safe_add(safe_add(safe_add(h, sha256_Sigma1256(e)), sha256_Ch(e, f, g)),
                        sha256_K[j]), W[j]);
                    T2 = safe_add(sha256_Sigma0256(a), sha256_Maj(a, b, c));
                    h = g;
                    g = f;
                    f = e;
                    e = safe_add(d, T1);
                    d = c;
                    c = b;
                    b = a;
                    a = safe_add(T1, T2);
                }

                HASH[0] = safe_add(a, HASH[0]);
                HASH[1] = safe_add(b, HASH[1]);
                HASH[2] = safe_add(c, HASH[2]);
                HASH[3] = safe_add(d, HASH[3]);
                HASH[4] = safe_add(e, HASH[4]);
                HASH[5] = safe_add(f, HASH[5]);
                HASH[6] = safe_add(g, HASH[6]);
                HASH[7] = safe_add(h, HASH[7]);
            }
            return HASH;
        }

        function sha256(s) {
            return commLib.rstr2hex(rstr_sha256(str2rstr_utf8(s)));
        }

        sha256.base64 = function(s) {
            return rstr2b64(rstr_sha256(str2rstr_utf8(s)));
        }

        module.exports = sha256
    }, {
        "./commLib": 43
    }],
    47: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-26.
         */
        //全局唯一id生成
        module.exports = function uid() {
            function n() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }

            return n() + n() + n() + n() + n() + n() + n() + n();
        }

    }, {}],
    48: [function(require, module, exports) {
        /**
         * Created by xiyuan on 15-11-30.
         */
        exports.encode = function(input) {
            var output = "";
            var i = -1;
            var x, y;

            while (++i < input.length) {
                /* Decode utf-16 surrogate pairs */
                x = input.charCodeAt(i);
                y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
                if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
                    x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                    i++;
                }

                /* Encode output as utf-8 */
                if (x <= 0x7F)
                    output += String.fromCharCode(x);
                else if (x <= 0x7FF)
                    output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
                        0x80 | (x & 0x3F));
                else if (x <= 0xFFFF)
                    output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                        0x80 | ((x >>> 6) & 0x3F),
                        0x80 | (x & 0x3F));
                else if (x <= 0x1FFFFF)
                    output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                        0x80 | ((x >>> 12) & 0x3F),
                        0x80 | ((x >>> 6) & 0x3F),
                        0x80 | (x & 0x3F));
            }
            return output;
        }

    }, {}],
    49: [function(require, module, exports) {
        /**
         * 内部处理库
         * Created by xiyuan on 17-5-9.
         */
        "use strict";

        module.exports = {
            observer: require('./observer'),
            buffer: require('./buffer'),
            date: require('./date'),
            encrypt: require('./encrypt/exports'),
            json: require('./json'),
            path: require('./path'),
            url: require('./url'),
            object: require('./object'),
            string: require('./string'),
            type: require('./type'),
            net: require('./net/exports'),
            platform: require('./platform')
        }
    }, {
        "./buffer": 40,
        "./date": 41,
        "./encrypt/exports": 44,
        "./json": 50,
        "./net/exports": 52,
        "./object": 54,
        "./observer": 55,
        "./path": 56,
        "./platform": 57,
        "./string": 58,
        "./type": 59,
        "./url": 60
    }],
    50: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-3-7.
         */
        "use strict";

        //把对象转换成json字符串
        exports.stringify = function(obj) {
            var TmpArray = [];
            for (var i in obj) {
                obj[i] = typeof obj[i] === 'string' ? '"' + (obj[i].replace(/"/g, '\\"')) + '"' : (typeof obj[i] === 'object' ? stringify(obj[i]) : obj[i]);
                TmpArray.push(i + ':' + obj[i]);
            }
            return '{' + TmpArray.join(',') + '}';
        };

        //把字符串解析成对象
        exports.parse = function(str) {
            if (typeof(str) === 'object') {
                return str;
            } else {
                try {
                    var json = new Function("return " + str)();
                } catch (e) {
                    return str;
                }
                return json;
            }
        };

    }, {}],
    51: [function(require, module, exports) {
        /**
         * Created by xiyuan on 16-12-5.
         */

        var URL = require('../url');

        var JSON = require('../json');

        function ajax(option) {
            //是否同步请求
            option.async = option.async === undefined ? true : option.async ? true : false;

            //请求类型
            option.type = (new RegExp(option.type, 'ig').exec('GET,DELETE,POST,PUT,HEAD,FORM').toString() || 'GET');

            var xhr = {
                    responseType: 'text'
                },
                url = option.url,
                sendData = option.data;

            //检查请求协议  避免在本地请求出错
            if (URL.protocol(option.url) === 'file:') {

                //检查是否cordova环境
                if (window.cordova && cordova.file) {

                    //预设
                    typeof option.preset === "function" && option.preset(xhr);

                    //html5文件系统
                    window.resolveLocalFileSystemURL(cordova.file.applicationDirectory, function(f) {}, function() {});

                    //本地文件系统
                    window.resolveLocalFileSystemURL(option.url, function(fileEntry) {

                        //文件资源开启
                        fileEntry.file(function(file) {
                            var reader = new FileReader();
                            xhr.status = 200;

                            //文件资源监听
                            reader.onloadend = function(e) {
                                typeof option.success === "function" && option.success.call(xhr, this.result);
                                typeof option.complete === 'function' && option.complete.call(xhr, this.result, true);
                            };

                            //资源读取 ArrayBuffer / text
                            xhr.responseType === "arraybuffer" ? reader.readAsArrayBuffer(file) : reader.readAsText(file);
                        });

                    }, function() {

                        xhr.status = 500;
                        typeof option.error === "function" && option.error.call(xhr, null);
                        typeof option.complete === 'function' && option.complete.call(xhr, null);
                    });

                    return;
                }
            }

            xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function() {

                //前置请求
                if (typeof option.beforeSend === 'function') {
                    option.beforeSend.call(xhr, option);
                }

                //请求状态判断
                if (xhr.readyState === 4) {

                    var res;
                    if (xhr.status === 200) {
                        switch (option.dataType || 'json') {
                            case 'html':
                                res = xhr.responseText;
                                break;
                            case 'xml':
                                res = xhr.responseXML;
                                break;
                            case 'json':
                                res = JSON.parse(xhr.responseText);
                                break;
                            default:
                                res = xhr.response || xhr.responseText;
                        }

                        typeof option.success === 'function' && option.success.call(xhr, res);

                    } else {
                        if (typeof option.error === 'function') {
                            option.error.call(xhr, xhr);
                        }
                    }

                    typeof option.complete === 'function' && option.complete.call(xhr, res || xhr, typeof res !== "undefined");
                }

            };

            switch (option.type) {
                case 'POST':

                    break;
                case 'GET':
                    url = URL.computedUrl(url, option.data);
                    break;
                case 'DELETE':

                    break;
                case 'PUT':

                    break;
                case 'HEAD':

                    break;
            }

            xhr.open(option.type, url, option.async);

            //上传进度后回调
            var uploadprogress = option.uploadprogress || option.uploadProgress;
            typeof uploadprogress === "function" && (xhr.upload.onprogress = uploadprogress);

            //资源返回进度回调
            typeof option.progress === "function" && (xhr.onprogress = option.progress);

            switch (option.type) {
                case 'POST':

                    break;
                case 'FORM':
                    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=utf-8');
                    break;
                case 'GET':
                    //判断请求是否需要设置content-type(主要处理zip压缩)
                    //(typeof option.preset === "function" && option.preset.type) || xhr.setRequestHeader('Content-type','application/text/html;charset=utf-8');
                    break;
                case 'DELETE':

                    break;
                case 'PUT':

                    break;
                case 'HEAD':

                    break;
            }

            typeof option.preset === "function" && option.preset(xhr);


            //ajax请求缓存
            if (option.cache !== undefined && !option.cache) {
                xhr.setRequestHeader('Cache-Control', 'no-cache');
                xhr.setRequestHeader('If-Modified-Since', '0');
            }

            //设置请求头
            Object.keys(option.header || {}).forEach(function(key) {
                xhr.setRequestHeader(key, option.header[key]);
            });

            xhr.send(sendData);
        };

        module.exports = ajax;
    }, {
        "../json": 50,
        "../url": 60
    }],
    52: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-27.
         */
        "use strict";

        module.exports = {
            ajax: require('./ajax'),
            jsonp: require('./jsonp')
        }
    }, {
        "./ajax": 51,
        "./jsonp": 53
    }],
    53: [function(require, module, exports) {
        'use strict';

        var url = require('../url');

        var path = require('../path');

        //空方法
        var noop = function() {},
            //存储jsonp处理中的数据
            recordJsonpStroage = {},
            //标识是否是多回调
            many = false,
            //jsonp数据缓存对象 (哪个请求先回调也就哪个请求先加载完毕 ,也就是哪个先写入缓存哪个就先得到缓存)
            jsonpStorage = null,
            cssElement = window.document.createElement('link'),
            jsElement = window.document.createElement('script'),
            headElement = window.document.getElementsByTagName('head')[0] || window.document.documentElement;

        cssElement.rel = 'stylesheet';
        cssElement.type = "text/css";

        jsElement.type = "text/javascript";

        //延迟执行
        // jsElement.defer = 'defer';

        //异步执行
        jsElement.async = 'async';
        jsElement.charset = "utf-8";

        /* js脚本获取 */
        function getJs(option) {
            var callback = option.jsonpCallback,
                done = false,
                js = jsElement.cloneNode(),
                complete = function() {
                    --recordJsonpStroage[callback].sum;
                    //方法调用完毕后还原备份方法
                    if (recordJsonpStroage[callback].sum < 1) {
                        typeof recordJsonpStroage[callback].windowCallback === "undefined" ? delete window[callback] : (window[callback] = recordJsonpStroage[callback].windowCallback);
                        delete recordJsonpStroage[callback];
                    }
                    option.element || headElement.removeChild(js);
                    var object = {
                        dom: this,
                        option: option,
                        many: many
                    };
                    object.state = jsonpStorage ? true : false;
                    option.complete.apply(object, jsonpStorage);
                };

            js.src = option.url;

            //作为之前已存在的方法作为一个备份
            if (recordJsonpStroage[callback]) {
                ++recordJsonpStroage[callback].sum;
            } else {
                recordJsonpStroage[callback] = {
                    windowCallback: window[callback],
                    sum: 1
                };
            }

            //文件加载完毕后调用jsonpCallback方法
            window[callback] = function() {
                //用来处理一个请求里有多个回调
                if (jsonpStorage) {
                    !many && (jsonpStorage = [jsonpStorage], many = true)
                    jsonpStorage.push([].slice.call(arguments));
                } else {
                    jsonpStorage = [].slice.call(arguments);
                }
            };

            //初始化回调(用于包处理 define.amd 赋值)
            option.init.call(js, window[callback]);

            //js获取成功后处理
            js.onload = js.onreadystatechange = function() {
                if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                    complete();
                    done = true;
                    this.onload = this.onreadystatechange = null;
                    option.success.apply({
                        dom: this,
                        option: option,
                        many: many
                    }, jsonpStorage);
                    //清空jsonp数据容器
                    jsonpStorage = null;
                    many = false;
                }
            };

            //js获取失败后处理
            js.onerror = function() {
                complete();
                option.error.apply({
                    dom: this,
                    option: option
                });
            };

            //想文档中添加js节点，使其开始加载文件
            headElement.appendChild(js);
        };


        //默认的jsonp配置
        var defaulteOption = {
            data: {}, //需要传递的参数
            url: '', //请求的url
            type: 'js', //请求的类型　「js | css」
            init: noop, //初始化回调
            error: noop, //错误回调
            success: noop, //成功回调
            complete: noop, //不管成功还是失败都回调
            callbackName: 'callback', //jsonp发送的参数名称
            jsonpCallback: 'callback', //jsonp回调成功执行的方法名
            element: true, //是否保留创建的javascript或link标签
            jsonpParameter: true //是否保留url中的jsonp参数
        };


        //配置合并
        function merge(now, def) {
            Object.keys(def).forEach(function(key) {
                typeof now[key] === "undefined" && (now[key] = def[key])
            })
            return now;
        };

        function jsonp(option) {

            //参数规范化处理
            merge(option, defaulteOption);

            //url处理(参数、url)
            option.url = url.computedUrl(path.resolve(option.url), option.data);

            //处理请求的类型
            switch (option.type) {
                case 'js':
                    var callbackUrlData = {};
                    option.jsonpParameter && (callbackUrlData[option.callbackName] = option.jsonpCallback, option.url = url.computedUrl(option.url, callbackUrlData));
                    getJs(option);
                    break;
                case 'css':

                    break
            }

        };

        module.exports = jsonp;



    }, {
        "../path": 56,
        "../url": 60
    }],
    54: [function(require, module, exports) {
        'use strict';

        /**
         * 数据属性设置
         * @param obj
         * @param key
         */
        function def(obj, key) {
            Object.defineProperty(obj, key, {
                writable: true,
                enumerable: false,
                configurable: true
            });
        }

        //对象遍历
        Object.prototype.forEach = function(fn) {
            var This = this;
            fn = typeof fn === 'function' ? fn : new Function;
            Object.keys(this).forEach(function(key) {
                fn(This[key], key);
            })
            fn = null;
        };

        //对象深度克隆
        Object.prototype.deepClone = function() {
            return deepClone(this);
        };

        //对象深度继承
        Object.prototype.deepExtend = function() {
            return deepExtend(arguments);
        };

        //对象深度继承
        Object.prototype.extend = function() {
            extend.apply(this, [this].concat([].slice.call(arguments)));
            return this;
        };

        //对象属性写入
        Object.prototype.setAttr = function(key, data) {
            return write(this, key, data)
        };

        //对象属性读取
        Object.prototype.getAttr = function(key) {
            return get(this, key);
        };

        //设置原型中的forEach clone 不可遍历
        def(Object.prototype, 'forEach');
        def(Object.prototype, 'extend');
        def(Object.prototype, 'deepClone');
        def(Object.prototype, 'deepExtend');
        def(Object.prototype, 'setAttr');
        def(Object.prototype, 'getAttr');

        //浅继承
        function extend() {
            var i = ~0,
                args = arguments,
                argLen = args.length;
            if (argLen < 2) return args[0];

            while (++i < argLen) {
                if (i === 0 || !arguments[i]) continue;
                Object.keys(args[i]).forEach(function(j) {
                    args[0][j] = args[i][j];
                });
            }
            return args[0];
        };

        //深度克隆
        function deepClone(obj, recordKey) {
            var result = obj,
                level,
                _toString = {}.toString;

            if (!recordKey) {
                recordKey = {};
                level = 1;
            }

            // null, undefined, non-object, function
            if (!obj || typeof obj !== 'object') {
                return obj;
            }

            // DOM Node
            if (obj.nodeType && 'cloneNode' in obj) {
                return obj.cloneNode(true);
            }

            // Date
            if (_toString.call(obj) === '[object Date]') {
                return new Date(obj.getTime());
            }

            // RegExp
            if (_toString.call(obj) === '[object RegExp]') {
                var flags = [];
                if (obj.global) {
                    flags.push('g');
                }
                if (obj.multiline) {
                    flags.push('m');
                }
                if (obj.ignoreCase) {
                    flags.push('i');
                }

                return new RegExp(obj.source, flags.join(''));
            }


            if (typeof obj === 'object' && obj !== null) {

                result = obj instanceof Array ? [] : {};

                var keys = Object.keys(obj);

                keys.forEach(function(val) {

                    //为防止数据绑定中的特殊数据导致无限循环
                    if (recordKey[val] && recordKey[val].in(obj[val]) !== -1 && typeof obj[val] === 'object' && obj[val] !== null) {
                        return;
                    }

                    //记录值
                    (recordKey[val] = recordKey[val] || []).push(obj[val]);

                    result[val] = _clone(obj[val], recordKey);
                });
            }

            //清除记录
            if (level) {
                recordKey = null;
            }
            return result;
        };

        //深度继承
        function deepExtend() {
            if (arguments.length < 2) {
                return false;
            }
            var i = ~0,
                s = 0,
                arg = arguments,
                l = arg.length,
                argi;
            while (++i < l) {
                if (i === 0) {
                    continue;
                }
                s = 0, argi = arg[i];
                Object.keys(argi).forEach(function(j) {
                    //原型
                    if (!argi.hasOwnProperty(j)) return;

                    var oldValue = arguments[0][j];
                    var newValue = argi[j];

                    if ((oldValue instanceof Array || oldValue instanceof Object) && (newValue instanceof Array || newValue instanceof Object)) {
                        deepExtend.call(this, arguments[0][j], argi[j]);
                    } else {
                        arguments[0][j] = argi[j];
                    }
                })
            }
            return arguments[0];
        };

        //对象合并克隆
        function concatClone() {
            var res = {},
                args = [].slice.call(arguments);

            args.forEach(function(arg) {
                Object.keys(arg).forEach(function(val) {
                    res[val] = deepClone(arg[val]);
                });
            });

            return res;
        };

        //配置合并
        function merge(now, def) {
            Object.keys(def).forEach(function(key) {
                typeof now[key] === "undefined" && (now[key] = def[key])
            })
            return now;
        };

        //arguments参数转为数组
        function toArray(arg) {
            return [].slice.call(arg);
        };

        /**
         * 检查属性是否原型属性
         * @param obj
         * @param key
         * @returns {boolean}
         */
        function hasPrototypeProperty(obj, key) {
            return !obj.hasOwnProperty(key) && key in obj;
        };

        /*数据配置解析*/
        function parseStringData(keyString, data) {
            if (arguments.length < 2) {
                return arguments[0];
            }
            keyString = keyString.match(/^[\w+\.]+$/g);
            if (keyString) {
                keyString = keyString[0].replace(/\[([\S]+)\]/g, function(reg, $1) {
                    return '.' + $1;
                });
                var attrs = keyString.split('.'),
                    i = ~0,
                    l = attrs.length;
                while (++i < l) {
                    data = data[attrs[i]];
                    if (typeof data === "undefined") {
                        console.log(attrs[i] + '属性不存在！');
                        return null;
                    }
                }
                return data;
            } else {
                console.log('取值方法有误！');
                return false;
            }
        };

        /*数据配置设置*/
        function setStringData(keyString, data, values) {
            if (arguments.length < 2) {
                return arguments[0];
            }

            keyString = keyString.match(/^[\w+\.]+$/g);
            if (keyString) {
                keyString = keyString[0].replace(/\[([\S]+)\]/g, function(reg, $1) {
                    return '.' + $1;
                });

                var attrs = keyString.split('.'),
                    i = ~0,
                    l = attrs.length;
                while (++i < l) {
                    if (i + 1 === l) {
                        data[attrs[i]] = values;
                        return values;
                    }
                    data = data[attrs[i]];
                    if (typeof data === "undefined") {
                        console.log(attrs[i] + '属性不存在！');
                        return null;
                    }
                }

            } else {
                console.log('取值方法有误！');
                return false;
            }
        };

        /**
         * model数据写入
         * @param obj
         * @param key
         * @param data
         */
        function write(obj, key, data) {

            (function getLevel(model, modelKey, writeKey) {

                if (!writeKey) {
                    if (!modelKey) {
                        return data;
                    }
                    model[modelKey] = data;
                    return true;
                }

                var property;
                //提取key字符中对象所属的第一个属性
                writeKey = writeKey.replace(/^\[([^.\]]+)\]|^\.?([^.\[\]]+)/, function(str, arrKey, objKey) {
                    //匹配提取[key]或.key 这两种形式的key 并去除key外部的单引号或双引号
                    property = (arrKey || objKey).match(/^(['"]?)([\s\S]+)\1$/).pop();
                    return '';
                });
                //检查对象
                if (typeof model[modelKey] !== 'object' || model[modelKey] === null) {
                    modelKey && (model[modelKey] = {});
                }
                getLevel(modelKey ? model[modelKey] : model, property, writeKey);
            })(obj, '', key)

            return obj;
        };

        /**
         * 数据获取
         * @param obj
         * @param key
         */
        function get(obj, key) {
            return function getLevel(model, writeKey) {
                if (!writeKey) {
                    return model;
                }

                var property;
                //提取key字符中对象所属的第一个属性
                writeKey = writeKey.replace(/^\[([^.\]]+)\]|^\.?([^.\[\]]+)/, function(str, arrKey, objKey) {
                    //匹配提取[key]或.key 这两种形式的key 并去除key外部的单引号或双引号
                    property = (arrKey || objKey).match(/^(['"]?)([\s\S]+)\1$/).pop();
                    return '';
                });

                //检查对象
                if (!model) {
                    model = {};
                }

                return getLevel(model[property], writeKey);
            }(obj, key);

        };

        module.exports = {
            extend: extend,
            deepClone: deepClone,
            deepExtend: deepExtend,
            concatClone: concatClone,
            merge: merge,
            toArray: toArray,
            hasPrototypeProperty: hasPrototypeProperty,
            parseStringData: parseStringData,
            setStringData: setStringData,
            write: write,
            get: get
        }
    }, {}],
    55: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-3-7.
         */
        (function(observer, exports) {
            if (typeof module === "object" && typeof module.exports === "object") {
                module.exports = observer;
            } else if (typeof define === "function" && define.amd) {
                define(function(require, exports, module) {
                    module.exports = observer;
                });
            } else {
                exports.observer = observer;
            }

        })(function() {
            "use strict";

            //全局唯一id生成
            function uid() {
                function n() {
                    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                }

                return n() + n() + n() + n() + n() + n() + n() + n();
            }

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
             * 递归key
             * @param key
             * @param callback
             * @returns {*|string}
             */
            function recursionKey(key, callback) {
                var nowKey;
                //提取key字符中对象所属的第一个属性
                key = (String(key) || '').replace(/^\[([^.\]]+)\]|^\.?([^.\[\]]+)/, function(str, arrKey, objKey) {
                    //匹配提取[key]或.key 这两种形式的key 并去除key外部的单引号或双引号
                    nowKey = (arrKey || objKey).match(/^(['"]?)([\s\S]+)\1$/).pop();
                    return '';
                });
                //递归查找
                return callback(nowKey, key) && (key || nowKey) && recursionKey(key, callback);
            }

            /**
             * 根据层级key递归获取值与赋值
             * @param sourceObj
             * @param key
             * @param [val]
             * @returns {*}
             */
            function levelKey(sourceObj, key) {
                //检查资源对象
                if (typeof sourceObj !== 'object' || sourceObj === null) {
                    return undefined;
                }
                var res = arguments,
                    isVal = arguments.length === 3;

                recursionKey(key, function(nowKey, key) {
                    if (key) return sourceObj = sourceObj[nowKey];
                    res = isVal ? sourceObj[nowKey] = res[2] : (nowKey ? sourceObj[nowKey] : sourceObj);
                });
                return res;
            }

            /**
             * 数据类型获取
             * @param data
             * @returns {*}
             */
            function getType(data) {
                return {}.toString.call(data).match(/object\s+(\w*)/)[1]
            }


            /**
             * 实例对比
             * @param L 表示左表达式
             * @param R 表示右表达式
             * @returns {boolean}
             */
            function isInstance(L, R) {
                // var R = R.prototype;// 取 R 的显示原型
                // 取 R 的显示原型
                R = R.__proto__;
                // 取 L 的隐式原型
                L = L.__proto__;
                while (true) {
                    if (L === null)
                        return false;
                    // 这里重点：当 R 严格等于 L 时，返回 true
                    if (R === L)
                        return true;
                    L = L.__proto__;
                }
            }

            /**
             * 数据对比
             * @param newData
             * @param oldData
             * @returns {boolean}
             */
            function diff(newData, oldData) {
                if (getType(newData) !== getType(oldData)) {
                    return false;
                }
                switch (getType(newData)) {
                    case 'Object':
                        //检查对象实例是否一致
                        if (!isInstance(newData, oldData)) return false;
                    case 'Array':
                        return Object.keys(newData).sort().toString() === Object.keys(oldData).sort().toString();
                        break;
                    case 'Date':
                        return String(newData) === String(oldData);
                    default:
                        return newData === oldData;
                }
            }


            /**
             * 检查子节点是否有监听
             * @param listen
             * @returns {boolean}
             */
            function checkChildListen(listen) {

                var i = ~0,
                    key,
                    isUse,
                    nowListen,
                    childKeys = Object.keys(listen.child),
                    len = childKeys.length;

                //检查当前节点是否有监听
                isUse = listen.listens.length || listen.listensRead.length;

                if (isUse) return true;

                while (++i < len) {
                    key = childKeys[i];
                    nowListen = listen.child[key];
                    if (isUse = checkChildListen(nowListen)) return true;
                }
                return false;
            }

            /**
             * 获取需要销毁的监听节点
             * @param listen
             * @returns {*}
             */
            function destroyListen(listen) {
                //检查当前节点是否存在监听
                if (!listen.listens.length && !listen.listensRead.length) {
                    if (listen.parent) return destroyListen(listen.parent);
                    return listen;
                }
                return false;
            }

            /**
             * 数据监听结构
             * @param parentListen
             */
            function listenStruct(parentListen, nowKey) {

                this.count = 1;
                //子级数据
                this.child = {};
                //监听的回调集合
                this.listens = [];
                //监听数据读取的回调集合
                this.listensRead = [];
                //检查传递数据类型
                if (parentListen instanceof listenStruct) {
                    //父级监听数据
                    this.parent = parentListen;
                    if (nowKey) {
                        //当前节点key
                        this.nowKey = nowKey;
                        this.parentData = parentListen.targetData;
                        //当前节点目标数据
                        this.targetData = (this.parentData || {})[nowKey];
                        //标识有数据
                        this.isData = this.targetData !== undefined;
                    }
                } else {
                    this.targetData = parentListen;
                    //标识有数据
                    this.isData = parentListen !== undefined;
                }
                this.listen();
            }

            //数据对比
            listenStruct.prototype.diff = function(parentData) {
                var oldData = this.targetData,
                    oldParentData = this.parentData,
                    newData = parentData && typeof parentData === 'object' ? parentData[this.nowKey] : undefined,
                    isEqual = diff(oldData, newData);

                if (!this.parent) return

                //获取父级数据
                this.parentData = this.parent.targetData;

                //更改目标数据
                this.targetData = newData;

                //检查当前数据属性 后面是否修改
                if (this.topListen && oldParentData !== this.parentData && Object.getOwnPropertyDescriptor(oldParentData, this.nowKey) && Object.getOwnPropertyDescriptor(oldParentData, this.nowKey).set !== this.prevDefineProperty.set) {
                    this.topListen.berforDefineProperty = this.berforDefineProperty;
                } else if (oldParentData !== this.parentData) {
                    //还原数据之前的状态 还原旧数据的属性
                    if (oldParentData) this.berforDefineProperty && Object.defineProperty(oldParentData, this.nowKey, this.berforDefineProperty);
                }

                //检查是否变化
                if (!isEqual) {

                    //触发上一个级监听数据
                    if (this.berforDefineProperty && this.berforDefineProperty.hasOwnProperty('set')) {
                        this.berforDefineProperty.set(newData, this);
                    }

                    //标识有数据
                    this.isData = true;

                    //触发监听
                    this.listens.forEach(function(fn) {
                        fn(newData, oldData);
                    });

                    //触发数据读取监听
                    this.listensRead.forEach(function(fn) {
                        fn(newData, oldData);
                    });

                    this.listensRead = [];
                }

                if (oldParentData !== this.parentData) {
                    //数据监听
                    this.listen(!(parentData && parentData.hasOwnProperty(this.nowKey)));
                }

                //触发子级节点数据对比
                Object.keys(this.child).forEach(function(key) {
                    var childListen = this.child[key];
                    childListen.diff(newData);
                }.bind(this));

            };

            //节点数据监听
            listenStruct.prototype.listen = function(isDelete) {
                var This = this;

                if (this.parentData && typeof this.parentData === 'object') {
                    //检查当前数据是否需要完全移除
                    if (isDelete) {
                        this.isDelete = false;
                        if (isDelete === true) {
                            this.isDelete = true;
                            if (this.parentData instanceof Array) {
                                this.parentData.slice(this.nowKey, 1);
                            } else {
                                delete this.parentData[this.nowKey]
                            }
                        }
                        return
                    }

                    this.prevDefineProperty = Object.getOwnPropertyDescriptor(this.parentData, this.nowKey) || {
                        configurable: true,
                        enumerable: true,
                        value: undefined,
                        writable: true
                    };

                    //记录第一次 Property（数据属性）
                    this.berforDefineProperty || (this.berforDefineProperty = this.prevDefineProperty);

                    //数据传递给前一个listen
                    this.berforDefineProperty && this.berforDefineProperty.hasOwnProperty('set') && this.berforDefineProperty.get(this);

                    //监听数据变更
                    Object.defineProperty(this.parentData, this.nowKey, this.nowDefineProperty = {
                        enumerable: true,
                        configurable: true,
                        set: function(newData, transfer) {
                            var tmp = {};
                            tmp[This.nowKey] = newData;
                            This.diff(tmp);
                            //数据监听转移
                            transfer && (This.topListen = transfer);
                        },
                        get: function(transfer) {
                            switch (true) {
                                case transfer instanceof listenStruct:
                                    //数据监听转移
                                    transfer && (This.topListen = transfer);
                                    transfer.count = This.count + 1;
                                    break;
                                case transfer === 'this':
                                    return This;
                                default:
                            }
                            return This.targetData;
                        }
                    });
                }

            };

            //设置监听节点数据
            listenStruct.prototype.set = function(data) {
                this.targetData = data;
            };

            //获取监听节点数据
            listenStruct.prototype.get = function() {
                return this.targetData;
            };

            //添加监听
            listenStruct.prototype.add = function(fn) {
                /*this.listens.indexOf(fn) !== -1 || */
                this.listens.push(fn);
            };

            //添加监听
            listenStruct.prototype.addRead = function(fn) {
                /*this.listensRead.indexOf(fn) !== -1 ||*/
                this.listensRead.push(fn);
            };

            //删除监听
            listenStruct.prototype.remove = function(fn) {
                var listen = this;
                if (typeof fn === "function") {
                    var index = this.listens.indexOf(fn);
                    return index === -1 ? false : this.listens.splice(this.listens.indexOf(fn), 1)[0];
                } else {
                    this.listens = [];
                }

                //所有监听移除后还原数据原有属性
                if (!this.listens.length && !Object.keys(this.child).length) {

                    //此处主要销毁监听节点
                    if (checkChildListen(listen)) {
                        return this;
                    } else {
                        this.destroy();
                    }

                    if (listen.parent) {
                        var i = ~0,
                            key,
                            isUse,
                            nowListen,
                            childKeys = Object.keys(listen.parent.child),
                            len = childKeys.length;

                        //检查同级元素中是否有监听
                        while (++i < len) {
                            key = childKeys[i];
                            if (listen.nowKey === key) continue;
                            nowListen = listen.parent.child[key];
                            if (isUse = checkChildListen(nowListen)) break;
                        }

                        if (isUse) return this;

                        //检查父节点上的上层是否有监听
                        if (isUse = destroyListen(listen.parent)) return isUse.destroy();

                    }
                }
                return this;
            };

            //删除read监听
            listenStruct.prototype.removeRead = function(fn) {
                if (typeof fn === "function") {
                    var index = this.listensRead.indexOf(fn);
                    return index === -1 ? false : this.listensRead.splice(this.listens.indexOf(fn), 1)[0];
                } else {
                    this.listensRead = [];
                }
            };

            //添加子节点
            listenStruct.prototype.addChild = function(key, listenStruct) {
                return this.child[key] = listenStruct;
            };

            //根据key获取子节点
            listenStruct.prototype.getChild = function(key) {
                return key ? this.child[key] : this.child;
            };

            //删除子节点
            listenStruct.prototype.removeChild = function(key) {
                var child = this.child[key];
                return delete this.child[key] && child;
            };

            //节点销毁
            listenStruct.prototype.destroy = function() {
                var $this = this;
                //数据重置
                if (this.parentData && typeof this.parentData === 'object') {
                    if (this.berforDefineProperty.hasOwnProperty('value')) {
                        this.berforDefineProperty.value = this.targetData;
                    }
                    //检查当前节点是否顶级监听，并重新转移数据属性 property
                    (this.topListen && this.topListen.listens) || this.isDelete || Object.defineProperty(this.parentData, this.nowKey, this.berforDefineProperty);
                }

                //销毁并转移Property
                this.topListen && (this.topListen.berforDefineProperty = this.berforDefineProperty);
                //数据传递给前一个listen
                this.berforDefineProperty && this.berforDefineProperty.hasOwnProperty('set') && this.berforDefineProperty.get(this);

                //检查数据 是否需要归原
                if (!this.isData && this.parentData) {
                    delete this.parentData[this.nowKey];
                }

                //销毁子节点
                this.child && Object.keys(this.child).forEach(function(key) {
                    $this.child[key].destroy();
                });

                //删除当前对象所有属性
                Object.keys(this).forEach(function(key) {
                    delete $this[key];
                })
            };

            /**
             * 观察代理
             * @param obj
             */
            function observerProxy(obj) {
                this.listen = new listenStruct(obj);
            }

            /**
             * 资源设置
             * @param key
             * @param data
             */
            observerProxy.prototype.set = function(key, data) {
                return levelKey(this.listen.targetData, key, data);
            };

            /**
             * 资源获取
             * @param key
             * @returns {*}
             */
            observerProxy.prototype.get = function(key) {
                return levelKey(this.listen.targetData, key);
            };

            /**
             * 数据读取
             * @param key
             * @param fn
             */
            observerProxy.prototype.read = function(key, fn) {

                var resData,
                    parentListen = this.listen,
                    sourceObj = parentListen.targetData;
                if (typeof fn !== "function") {
                    fn = key;
                    key = ''
                }
                //遍历监听的Key
                recursionKey(key, function(nowKey, nextKey) {
                    if (nowKey) {
                        var nextData = (sourceObj || {})[nowKey];
                        //获取层级节点
                        parentListen = parentListen.getChild(nowKey) || parentListen.addChild(nowKey, new listenStruct(parentListen, nowKey));
                        sourceObj = nextData;
                    }
                    if (!(nowKey && nextKey)) {
                        resData = parentListen.targetData;
                        //检查是否有数据 并触发回调
                        if (parentListen.isData) {
                            fn(resData);
                        } else {
                            parentListen.addRead(fn);
                        }
                    }
                    return nextKey;
                });

                return resData;
            }

            //新增数据监听
            observerProxy.prototype.addListen = function(key, fn) {
                var parentListen = this.listen,
                    sourceObj = parentListen.targetData;
                if (typeof fn !== "function") {
                    fn = key;
                    key = ''
                }
                //遍历监听的Key
                recursionKey(key, function(nowKey, nextKey) {
                    if (nowKey) {
                        var nextData = (sourceObj || {})[nowKey];
                        //获取层级节点
                        parentListen = parentListen.getChild(nowKey) || parentListen.addChild(nowKey, new listenStruct(parentListen, nowKey));
                        sourceObj = nextData;
                    }
                    if (!(nowKey && nextKey)) {
                        parentListen.add(fn);
                    }
                    return nextKey;
                });
            };

            /**
             * 读取并监听数据
             * @param key
             * @param fn
             */
            observerProxy.prototype.readWatch = function(key, fn) {
                var resData,
                    parentListen = this.listen,
                    sourceObj = parentListen.targetData;
                if (typeof fn !== "function") {
                    fn = key;
                    key = ''
                }

                //遍历监听的Key
                recursionKey(key, function(nowKey, nextKey) {
                    if (nowKey) {
                        var nextData = (sourceObj || {})[nowKey];
                        //获取层级节点
                        parentListen = parentListen.getChild(nowKey) || parentListen.addChild(nowKey, new listenStruct(parentListen, nowKey));
                        sourceObj = nextData;
                    }
                    if (!(nowKey && nextKey)) {
                        parentListen.add(fn);
                        // parentListen.addRead(fn);
                        resData = parentListen.targetData;
                        //检查是否有数据 并触发回调
                        if (parentListen.isData) fn(resData);
                    }
                    return nextKey;
                });

                return resData;
            }

            //删除数据监听
            observerProxy.prototype.removeListen = function(key, fn) {
                var parentListen = this.listen;
                recursionKey(key, function(nowKey, nextKey) {
                    if (nowKey) {
                        parentListen = parentListen.getChild(nowKey)
                    }
                    if (!(nowKey && nextKey)) {
                        parentListen && parentListen.remove(fn);
                    }
                    return nextKey;
                })
            };

            //删除数据读取监听
            observerProxy.prototype.removeRead = function(key, fn) {
                var parentListen = this.listen;
                recursionKey(key, function(nowKey, nextKey) {
                    if (nowKey) {
                        parentListen = parentListen.getChild(nowKey)
                    }
                    if (!(nowKey && nextKey)) {
                        parentListen && parentListen.removeRead(fn);
                    }
                    return nextKey;
                })
            }

            //监听销毁
            observerProxy.prototype.destroy = function() {
                this.listen.destroy();
                Object.keys(this).forEach(function(key) {
                    delete this[key];
                }.bind(this))
            };

            //数据观察资源
            var observerProxyStroage = {};

            /**
             * 数据观察对象
             * @param obj
             */
            function observer(obj) {
                if (obj instanceof observer) return obj;
                observerProxyStroage[this.sourceId = uid()] = new observerProxy(obj);
            }

            /**
             * 根据key读取数据
             * @param key
             * @param fn
             */
            observer.prototype.read = function(key, fn) {
                return observerProxyStroage[this.sourceId].read(key, fn);
            }

            /**
             * 数据监听
             * @param watchKey
             * @param watchFn
             */
            observer.prototype.watch = function(watchKey, watchFn) {
                if (typeof watchFn !== "function") {
                    watchFn = watchKey;
                    watchKey = '';
                }
                observerProxyStroage[this.sourceId].addListen(watchKey, watchFn);
            };

            /**
             * 读取并监听数据
             * @param watchKey
             * @param watchFn
             */
            observer.prototype.readWatch = function(watchKey, watchFn) {
                return observerProxyStroage[this.sourceId].readWatch(watchKey, watchFn);
            }

            /**
             * 移除监听
             * @param watchKey
             * @param watchFn
             */
            observer.prototype.unWatch = function(watchKey, watchFn) {
                if (typeof watchFn !== "function" && typeof watchKey === "function") {
                    watchFn = watchKey;
                    watchKey = '';
                }
                observerProxyStroage[this.sourceId].removeListen(watchKey, watchFn);
            };

            /**
             * 移除数据读取监听
             * @param key
             * @param fn
             */
            observer.prototype.unRead = function(key, fn) {
                observerProxyStroage[this.sourceId].removeRead(key, fn);
            }

            /**
             * 获取对应的数据
             * @param key
             */
            observer.prototype.get = function(key) {
                key = typeof key === "string" ? key : '';
                return observerProxyStroage[this.sourceId].get(key);
            };

            /**
             * 设置对应的数据
             * @param key
             * @param data
             */
            observer.prototype.write = function(key, data) {
                if (arguments.length === 1) {
                    data = key;
                    key = '';
                }
                return observerProxyStroage[this.sourceId].set(key, data);
            };

            /**
             * 销毁数据监听
             */
            observer.prototype.destroy = function() {
                observerProxyStroage[this.sourceId].destroy();
                delete observerProxyStroage[this.sourceId];
                //销毁所有私有属性
                Object.keys(this).forEach(function(key) {
                    delete this[key];
                }.bind(this))
            };

            /**
             * 检查是否是观察数据
             * @type {boolean}
             */
            observer.prototype.isObserver = true;
            Object.defineProperty(observer.prototype, 'isObserver', {
                writable: false,
                configurable: false,
                enumerable: false
            });


            //多数据监听
            function multipleOb(objs) {
                //检查是否监听对象
                if (objs instanceof multipleOb || objs instanceof observer) return objs;
                objs = objs.reverse();

                //存放资源数据
                observerProxyStroage[this.sourceId = uid()] = {
                    resource: objs,
                    ob: objs.reduce(function(arr, val) {
                        arr.push(new observer(val));
                        return arr;
                    }, [])
                };
            }

            //数据读取
            multipleOb.prototype.read = function(key, fn) {
                var resData,
                    objs = observerProxyStroage[this.sourceId];

                function remove() {
                    objs.ob.forEach(function(ob) {
                        ob.unRead(key)
                    })
                }

                objs.ob.forEach(function(ob) {
                    ob.read(key, function(res) {
                        resData = res;
                        remove();
                        fn.call(this, res)
                    })
                })
            };

            //数据监听
            multipleOb.prototype.watch = function(watchKey, watchFn) {
                var objs = observerProxyStroage[this.sourceId];
                objs.ob.forEach(function(ob) {
                    ob.watch(watchKey, watchFn);
                });
            };

            //数据监听并读取
            multipleOb.prototype.readWatch = function(watchKey, watchFn) {
                var isRead,
                    watchQueue = [],
                    objs = observerProxyStroage[this.sourceId];

                function remove(index) {
                    var ob;
                    //移除监听队列
                    while (watchQueue.length > index) {
                        ob = watchQueue[index];
                        //移除队列
                        watchQueue.pop();
                        ob.unRead(watchKey);
                        ob.unWatch(watchKey);
                    }
                }

                objs.ob.forEach(function(ob, index) {
                    if (isRead) return;

                    watchQueue.push(ob);
                    //监听数据
                    ob.readWatch(watchKey, function(resData) {
                        watchFn.call(this, resData);
                        if (isRead) return;
                        remove(index + 1);
                        isRead = true;
                    });
                });

            };

            //移除监听
            multipleOb.prototype.unWatch = function(watchKey, watchFn) {
                var objs = observerProxyStroage[this.sourceId];
                objs.ob.forEach(function(ob) {
                    ob.unWatch(watchKey, watchFn);
                });
            };

            //获取对应的数据
            multipleOb.prototype.get = function(key) {
                var i = ~0,
                    resData,
                    objs = observerProxyStroage[this.sourceId],
                    l = objs.ob.length;

                while (++i < l) {
                    if (resData = objs.ob[i].get(key)) {
                        return resData;
                    }
                }
            };

            //销毁数据监听
            multipleOb.prototype.destroy = function() {
                var $this = this,
                    objs = observerProxyStroage[this.sourceId];
                objs.ob.forEach(function(ob) {
                    ob.destroy();
                });

                //删除当前对象所有属性
                Object.keys(this).forEach(function(key) {
                    delete $this[key];
                })

                delete observerProxyStroage[this.sourceId];
            };

            return function(obj, multiple) {
                if (multiple === true && obj instanceof Array) {
                    return new multipleOb(obj);
                } else {
                    return new observer(obj);
                }
            };
        }(), this);
    }, {}],
    56: [function(require, module, exports) {
        /**
         * 路径处理
         * Created by xiyuan on 17-3-7.
         */
        "use strict";

        var URL = require('./url');


        /*获取文件路径*/
        function dirname(path) {
            return path.match(/[^?#]*\//)[0]
        };

        var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//;
        /*当前项目入口地址*/
        var cwd = (!location.href || location.href.indexOf('about:') === 0) ? '' : dirname(location.href);

        /*规范化路径*/
        function normalize(path) {
            path = path.replace(/\\/g, '/').replace(/\/\.\//g, "/")
            path = path.replace(/([^:/])\/+\//g, "$1/");

            while (path.match(DOUBLE_DOT_RE)) {
                path = path.replace(DOUBLE_DOT_RE, "/")
            }

            return path
        };

        /*绝对路径*/
        function resolve(path, url) {
            path = path.replace(/\\/g, '/');

            var host,
                protocol,
                paths = path.match(/^(\w+:)?\/\/(\w[\w\.]*(:\d+)?)/);

            if (paths) {
                protocol = paths[1];
                host = paths[2];
            }

            if (url) {
                if (paths) {
                    if (!protocol) path = URL.protocol(url) + host;
                } else {
                    if (path.charAt(0) === '/') {
                        path = URL.domain(url) + path;
                    } else {
                        url = resolve(url);
                        path = dirname(url) + path;
                    }
                }
            } else {
                if (paths) {
                    if (!protocol) path = window.location.protocol + host;
                } else {
                    if (path.charAt(0) === '/') {
                        path = URL.domain() + path;
                    } else {
                        path = dirname(window.location.href) + path;
                    }
                }
            }
            return normalize(path);
        };

        /*获取路径中的文件名*/
        function fileName(path) {
            var res = path.match(/^[\S]+\/([^\s\/]+)$/)
            return res ? res[1] : '';
        };

        /*获取路径中的文件*/
        function file(path) {
            var res = path.match(/^[\S]+\/([^\s\.\/]+)[^\s\/]*$/);
            return res ? res[1] : '';
        };

        /*获取路径中的文件后缀*/
        function suffix(path) {
            var res = path.match(/\.[^\.\/]*$/);
            return res ? res[0] : '';
        };

        /*获取去除后缀路径*/
        function noSuffix(path) {
            var res = path.match(/[^?#]*\/[^\.\/]*/);
            return res ? res[0] : '';
        };

        module.exports = {
            cwd: cwd,
            dirname: dirname,
            normalize: normalize,
            resolve: resolve,
            fileName: fileName,
            file: file,
            suffix: suffix,
            noSuffix: noSuffix
        }

    }, {
        "./url": 60
    }],
    57: [function(require, module, exports) {
        (function(global) {
            'use strict';

            /** Used to determine if values are of the language type `Object`. */
            var objectTypes = {
                'function': true,
                'object': true
            };

            /** Used as a reference to the global object. */
            var root = (objectTypes[typeof window] && window) || this;

            /** Backup possible global object. */
            var oldRoot = root;

            /** Detect free variable `exports`. */
            var freeExports = objectTypes[typeof exports] && exports;

            /** Detect free variable `module`. */
            var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

            /** Detect free variable `global` from Node.js or Browserified code and use it as `root`. */
            var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;
            if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
                root = freeGlobal;
            }

            /**
             * Used as the maximum length of an array-like object.
             * See the [ES6 spec](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
             * for more details.
             */
            var maxSafeInteger = Math.pow(2, 53) - 1;

            /** Regular expression to detect Opera. */
            var reOpera = /\bOpera/;

            /** Possible global object. */
            var thisBinding = this;

            /** Used for native method references. */
            var objectProto = Object.prototype;

            /** Used to check for own properties of an object. */
            var hasOwnProperty = objectProto.hasOwnProperty;

            /** Used to resolve the internal `[[Class]]` of values. */
            var toString = objectProto.toString;

            /*--------------------------------------------------------------------------*/

            /**
             * Capitalizes a string value.
             *
             * @private
             * @param {string} string The string to capitalize.
             * @returns {string} The capitalized string.
             */
            function capitalize(string) {
                string = String(string);
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

            /**
             * A utility function to clean up the OS name.
             *
             * @private
             * @param {string} os The OS name to clean up.
             * @param {string} [pattern] A `RegExp` pattern matching the OS name.
             * @param {string} [label] A label for the OS.
             */
            function cleanupOS(os, pattern, label) {
                // Platform tokens are defined at:
                // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
                // http://web.archive.org/web/20081122053950/http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
                var data = {
                    '10.0': '10',
                    '6.4': '10 Technical Preview',
                    '6.3': '8.1',
                    '6.2': '8',
                    '6.1': 'Server 2008 R2 / 7',
                    '6.0': 'Server 2008 / Vista',
                    '5.2': 'Server 2003 / XP 64-bit',
                    '5.1': 'XP',
                    '5.01': '2000 SP1',
                    '5.0': '2000',
                    '4.0': 'NT',
                    '4.90': 'ME'
                };
                // Detect Windows version from platform tokens.
                if (pattern && label && /^Win/i.test(os) && !/^Windows Phone /i.test(os) &&
                    (data = data[/[\d.]+$/.exec(os)])) {
                    os = 'Windows ' + data;
                }
                // Correct character case and cleanup string.
                os = String(os);

                if (pattern && label) {
                    os = os.replace(RegExp(pattern, 'i'), label);
                }

                os = format(
                    os.replace(/ ce$/i, ' CE')
                    .replace(/\bhpw/i, 'web')
                    .replace(/\bMacintosh\b/, 'Mac OS')
                    .replace(/_PowerPC\b/i, ' OS')
                    .replace(/\b(OS X) [^ \d]+/i, '$1')
                    .replace(/\bMac (OS X)\b/, '$1')
                    .replace(/\/(\d)/, ' $1')
                    .replace(/_/g, '.')
                    .replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, '')
                    .replace(/\bx86\.64\b/gi, 'x86_64')
                    .replace(/\b(Windows Phone) OS\b/, '$1')
                    .replace(/\b(Chrome OS \w+) [\d.]+\b/, '$1')
                    .split(' on ')[0]
                );

                return os;
            }

            /**
             * An iteration utility for arrays and objects.
             *
             * @private
             * @param {Array|Object} object The object to iterate over.
             * @param {Function} callback The function called per iteration.
             */
            function each(object, callback) {
                var index = -1,
                    length = object ? object.length : 0;

                if (typeof length == 'number' && length > -1 && length <= maxSafeInteger) {
                    while (++index < length) {
                        callback(object[index], index, object);
                    }
                } else {
                    forOwn(object, callback);
                }
            }

            /**
             * Trim and conditionally capitalize string values.
             *
             * @private
             * @param {string} string The string to format.
             * @returns {string} The formatted string.
             */
            function format(string) {
                string = trim(string);
                return /^(?:webOS|i(?:OS|P))/.test(string) ?
                    string :
                    capitalize(string);
            }

            /**
             * Iterates over an object's own properties, executing the `callback` for each.
             *
             * @private
             * @param {Object} object The object to iterate over.
             * @param {Function} callback The function executed per own property.
             */
            function forOwn(object, callback) {
                for (var key in object) {
                    if (hasOwnProperty.call(object, key)) {
                        callback(object[key], key, object);
                    }
                }
            }

            /**
             * Gets the internal `[[Class]]` of a value.
             *
             * @private
             * @param {*} value The value.
             * @returns {string} The `[[Class]]`.
             */
            function getClassOf(value) {
                return value == null ?
                    capitalize(value) :
                    toString.call(value).slice(8, -1);
            }

            /**
             * Host objects can return type values that are different from their actual
             * data type. The objects we are concerned with usually return non-primitive
             * types of "object", "function", or "unknown".
             *
             * @private
             * @param {*} object The owner of the property.
             * @param {string} property The property to check.
             * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
             */
            function isHostType(object, property) {
                var type = object != null ? typeof object[property] : 'number';
                return !/^(?:boolean|number|string|undefined)$/.test(type) &&
                    (type == 'object' ? !!object[property] : true);
            }

            /**
             * Prepares a string for use in a `RegExp` by making hyphens and spaces optional.
             *
             * @private
             * @param {string} string The string to qualify.
             * @returns {string} The qualified string.
             */
            function qualify(string) {
                return String(string).replace(/([ -])(?!$)/g, '$1?');
            }

            /**
             * A bare-bones `Array#reduce` like utility function.
             *
             * @private
             * @param {Array} array The array to iterate over.
             * @param {Function} callback The function called per iteration.
             * @returns {*} The accumulated result.
             */
            function reduce(array, callback) {
                var accumulator = null;
                each(array, function(value, index) {
                    accumulator = callback(accumulator, value, index, array);
                });
                return accumulator;
            }

            /**
             * Removes leading and trailing whitespace from a string.
             *
             * @private
             * @param {string} string The string to trim.
             * @returns {string} The trimmed string.
             */
            function trim(string) {
                return String(string).replace(/^ +| +$/g, '');
            }

            /*--------------------------------------------------------------------------*/

            /**
             * Creates a new platform object.
             *
             * @memberOf platform
             * @param {Object|string} [ua=navigator.userAgent] The user agent string or
             *  context object.
             * @returns {Object} A platform object.
             */
            function parse(ua) {

                /** The environment context object. */
                var context = root;

                /** Used to flag when a custom context is provided. */
                var isCustomContext = ua && typeof ua == 'object' && getClassOf(ua) != 'String';

                // Juggle arguments.
                if (isCustomContext) {
                    context = ua;
                    ua = null;
                }

                /** Browser navigator object. */
                var nav = context.navigator || {};

                /** Browser user agent string. */
                var userAgent = nav.userAgent || '';

                ua || (ua = userAgent);

                /** Used to flag when `thisBinding` is the [ModuleScope]. */
                var isModuleScope = isCustomContext || thisBinding == oldRoot;

                /** Used to detect if browser is like Chrome. */
                var likeChrome = isCustomContext ?
                    !!nav.likeChrome :
                    /\bChrome\b/.test(ua) && !/internal|\n/i.test(toString.toString());

                /** Internal `[[Class]]` value shortcuts. */
                var objectClass = 'Object',
                    airRuntimeClass = isCustomContext ? objectClass : 'ScriptBridgingProxyObject',
                    enviroClass = isCustomContext ? objectClass : 'Environment',
                    javaClass = (isCustomContext && context.java) ? 'JavaPackage' : getClassOf(context.java),
                    phantomClass = isCustomContext ? objectClass : 'RuntimeObject';

                /** Detect Java environments. */
                var java = /\bJava/.test(javaClass) && context.java;

                /** Detect Rhino. */
                var rhino = java && getClassOf(context.environment) == enviroClass;

                /** A character to represent alpha. */
                var alpha = java ? 'a' : '\u03b1';

                /** A character to represent beta. */
                var beta = java ? 'b' : '\u03b2';

                /** Browser document object. */
                var doc = context.document || {};

                /**
                 * Detect Opera browser (Presto-based).
                 * http://www.howtocreate.co.uk/operaStuff/operaObject.html
                 * http://dev.opera.com/articles/view/opera-mini-web-content-authoring-guidelines/#operamini
                 */
                var opera = context.operamini || context.opera,
                    operaClass;

                /** Opera `[[Class]]`. */
                operaClass = reOpera.test(operaClass = (isCustomContext && opera) ? opera['[[Class]]'] : getClassOf(opera)) ?
                    operaClass :
                    (opera = null);

                /*------------------------------------------------------------------------*/

                /** Temporary variable used over the script's lifetime. */
                var data;

                /** The CPU architecture. */
                var arch = ua;

                /** Platform description array. */
                var description = [];

                /** Platform alpha/beta indicator. */
                var prerelease = null;

                /** A flag to indicate that environment features should be used to resolve the platform. */
                var useFeatures = ua == userAgent;

                /** The browser/environment version. */
                var version = useFeatures && opera && typeof opera.version == 'function' && opera.version();

                /** A flag to indicate if the OS ends with "/ Version" */
                var isSpecialCasedOS;

                /* Detectable layout engines (order is important). */
                var layout = getLayout([{
                        'label': 'EdgeHTML',
                        'pattern': 'Edge'
                    },
                    'Trident',
                    {
                        'label': 'WebKit',
                        'pattern': 'AppleWebKit'
                    },
                    'iCab',
                    'Presto',
                    'NetFront',
                    'Tasman',
                    'KHTML',
                    'Gecko'
                ]);

                /* Detectable browser names (order is important). */
                var name = getName([
                    'Adobe AIR',
                    'Arora',
                    'Avant Browser',
                    'Breach',
                    'Camino',
                    'Electron',
                    'Epiphany',
                    'Fennec',
                    'Flock',
                    'Galeon',
                    'GreenBrowser',
                    'iCab',
                    'Iceweasel',
                    'K-Meleon',
                    'Konqueror',
                    'Lunascape',
                    'Maxthon',
                    {
                        'label': 'Microsoft Edge',
                        'pattern': 'Edge'
                    },
                    'Midori',
                    'Nook Browser',
                    'PaleMoon',
                    'PhantomJS',
                    'Raven',
                    'Rekonq',
                    'RockMelt',
                    {
                        'label': 'Samsung Internet',
                        'pattern': 'SamsungBrowser'
                    },
                    'SeaMonkey',
                    {
                        'label': 'Silk',
                        'pattern': '(?:Cloud9|Silk-Accelerated)'
                    },
                    'Sleipnir',
                    'SlimBrowser',
                    {
                        'label': 'SRWare Iron',
                        'pattern': 'Iron'
                    },
                    'Sunrise',
                    'Swiftfox',
                    'Waterfox',
                    'WebPositive',
                    'Opera Mini',
                    {
                        'label': 'Opera Mini',
                        'pattern': 'OPiOS'
                    },
                    'Opera',
                    {
                        'label': 'Opera',
                        'pattern': 'OPR'
                    },
                    'Chrome',
                    {
                        'label': 'Chrome Mobile',
                        'pattern': '(?:CriOS|CrMo)'
                    },
                    {
                        'label': 'Firefox',
                        'pattern': '(?:Firefox|Minefield)'
                    },
                    {
                        'label': 'Firefox for iOS',
                        'pattern': 'FxiOS'
                    },
                    {
                        'label': 'IE',
                        'pattern': 'IEMobile'
                    },
                    {
                        'label': 'IE',
                        'pattern': 'MSIE'
                    },
                    'Safari'
                ]);

                /* Detectable products (order is important). */
                var product = getProduct([{
                        'label': 'BlackBerry',
                        'pattern': 'BB10'
                    },
                    'BlackBerry',
                    {
                        'label': 'Galaxy S',
                        'pattern': 'GT-I9000'
                    },
                    {
                        'label': 'Galaxy S2',
                        'pattern': 'GT-I9100'
                    },
                    {
                        'label': 'Galaxy S3',
                        'pattern': 'GT-I9300'
                    },
                    {
                        'label': 'Galaxy S4',
                        'pattern': 'GT-I9500'
                    },
                    {
                        'label': 'Galaxy S5',
                        'pattern': 'SM-G900'
                    },
                    {
                        'label': 'Galaxy S6',
                        'pattern': 'SM-G920'
                    },
                    {
                        'label': 'Galaxy S6 Edge',
                        'pattern': 'SM-G925'
                    },
                    {
                        'label': 'Galaxy S7',
                        'pattern': 'SM-G930'
                    },
                    {
                        'label': 'Galaxy S7 Edge',
                        'pattern': 'SM-G935'
                    },
                    'Google TV',
                    'Lumia',
                    'iPad',
                    'iPod',
                    'iPhone',
                    'Kindle',
                    {
                        'label': 'Kindle Fire',
                        'pattern': '(?:Cloud9|Silk-Accelerated)'
                    },
                    'Nexus',
                    'Nook',
                    'PlayBook',
                    'PlayStation Vita',
                    'PlayStation',
                    'TouchPad',
                    'Transformer',
                    {
                        'label': 'Wii U',
                        'pattern': 'WiiU'
                    },
                    'Wii',
                    'Xbox One',
                    {
                        'label': 'Xbox 360',
                        'pattern': 'Xbox'
                    },
                    'Xoom'
                ]);

                /* Detectable manufacturers. */
                var manufacturer = getManufacturer({
                    'Apple': {
                        'iPad': 1,
                        'iPhone': 1,
                        'iPod': 1
                    },
                    'Archos': {},
                    'Amazon': {
                        'Kindle': 1,
                        'Kindle Fire': 1
                    },
                    'Asus': {
                        'Transformer': 1
                    },
                    'Barnes & Noble': {
                        'Nook': 1
                    },
                    'BlackBerry': {
                        'PlayBook': 1
                    },
                    'Google': {
                        'Google TV': 1,
                        'Nexus': 1
                    },
                    'HP': {
                        'TouchPad': 1
                    },
                    'HTC': {},
                    'LG': {},
                    'Microsoft': {
                        'Xbox': 1,
                        'Xbox One': 1
                    },
                    'Motorola': {
                        'Xoom': 1
                    },
                    'Nintendo': {
                        'Wii U': 1,
                        'Wii': 1
                    },
                    'Nokia': {
                        'Lumia': 1
                    },
                    'Samsung': {
                        'Galaxy S': 1,
                        'Galaxy S2': 1,
                        'Galaxy S3': 1,
                        'Galaxy S4': 1
                    },
                    'Sony': {
                        'PlayStation': 1,
                        'PlayStation Vita': 1
                    }
                });

                /* Detectable operating systems (order is important). */
                var os = getOS([
                    'Windows Phone',
                    'Android',
                    'CentOS',
                    {
                        'label': 'Chrome OS',
                        'pattern': 'CrOS'
                    },
                    'Debian',
                    'Fedora',
                    'FreeBSD',
                    'Gentoo',
                    'Haiku',
                    'Kubuntu',
                    'Linux Mint',
                    'OpenBSD',
                    'Red Hat',
                    'SuSE',
                    'Ubuntu',
                    'Xubuntu',
                    'Cygwin',
                    'Symbian OS',
                    'hpwOS',
                    'webOS ',
                    'webOS',
                    'Tablet OS',
                    'Tizen',
                    'Linux',
                    'Mac OS X',
                    'Macintosh',
                    'Mac',
                    'Windows 98;',
                    'Windows '
                ]);

                /*------------------------------------------------------------------------*/

                /**
                 * Picks the layout engine from an array of guesses.
                 *
                 * @private
                 * @param {Array} guesses An array of guesses.
                 * @returns {null|string} The detected layout engine.
                 */
                function getLayout(guesses) {
                    return reduce(guesses, function(result, guess) {
                        return result || RegExp('\\b' + (
                            guess.pattern || qualify(guess)
                        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
                    });
                }

                /**
                 * Picks the manufacturer from an array of guesses.
                 *
                 * @private
                 * @param {Array} guesses An object of guesses.
                 * @returns {null|string} The detected manufacturer.
                 */
                function getManufacturer(guesses) {
                    return reduce(guesses, function(result, value, key) {
                        // Lookup the manufacturer by product or scan the UA for the manufacturer.
                        return result || (
                            value[product] ||
                            value[/^[a-z]+(?: +[a-z]+\b)*/i.exec(product)] ||
                            RegExp('\\b' + qualify(key) + '(?:\\b|\\w*\\d)', 'i').exec(ua)
                        ) && key;
                    });
                }

                /**
                 * Picks the browser name from an array of guesses.
                 *
                 * @private
                 * @param {Array} guesses An array of guesses.
                 * @returns {null|string} The detected browser name.
                 */
                function getName(guesses) {
                    return reduce(guesses, function(result, guess) {
                        return result || RegExp('\\b' + (
                            guess.pattern || qualify(guess)
                        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
                    });
                }

                /**
                 * Picks the OS name from an array of guesses.
                 *
                 * @private
                 * @param {Array} guesses An array of guesses.
                 * @returns {null|string} The detected OS name.
                 */
                function getOS(guesses) {
                    return reduce(guesses, function(result, guess) {
                        var pattern = guess.pattern || qualify(guess);
                        if (!result && (result =
                                RegExp('\\b' + pattern + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua)
                            )) {
                            result = cleanupOS(result, pattern, guess.label || guess);
                        }
                        return result;
                    });
                }

                /**
                 * Picks the product name from an array of guesses.
                 *
                 * @private
                 * @param {Array} guesses An array of guesses.
                 * @returns {null|string} The detected product name.
                 */
                function getProduct(guesses) {
                    return reduce(guesses, function(result, guess) {
                        var pattern = guess.pattern || qualify(guess);
                        if (!result && (result =
                                RegExp('\\b' + pattern + ' *\\d+[.\\w_]*', 'i').exec(ua) ||
                                RegExp('\\b' + pattern + ' *\\w+-[\\w]*', 'i').exec(ua) ||
                                RegExp('\\b' + pattern + '(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)', 'i').exec(ua)
                            )) {
                            // Split by forward slash and append product version if needed.
                            if ((result = String((guess.label && !RegExp(pattern, 'i').test(guess.label)) ? guess.label : result).split('/'))[1] && !/[\d.]+/.test(result[0])) {
                                result[0] += ' ' + result[1];
                            }
                            // Correct character case and cleanup string.
                            guess = guess.label || guess;
                            result = format(result[0]
                                .replace(RegExp(pattern, 'i'), guess)
                                .replace(RegExp('; *(?:' + guess + '[_-])?', 'i'), ' ')
                                .replace(RegExp('(' + guess + ')[-_.]?(\\w)', 'i'), '$1 $2'));
                        }
                        return result;
                    });
                }

                /**
                 * Resolves the version using an array of UA patterns.
                 *
                 * @private
                 * @param {Array} patterns An array of UA patterns.
                 * @returns {null|string} The detected version.
                 */
                function getVersion(patterns) {
                    return reduce(patterns, function(result, pattern) {
                        return result || (RegExp(pattern +
                            '(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)', 'i').exec(ua) || 0)[1] || null;
                    });
                }

                /**
                 * Returns `platform.description` when the platform object is coerced to a string.
                 *
                 * @name toString
                 * @memberOf platform
                 * @returns {string} Returns `platform.description` if available, else an empty string.
                 */
                function toStringPlatform() {
                    return this.description || '';
                }

                /*------------------------------------------------------------------------*/

                // Convert layout to an array so we can add extra details.
                layout && (layout = [layout]);

                // Detect product names that contain their manufacturer's name.
                if (manufacturer && !product) {
                    product = getProduct([manufacturer]);
                }
                // Clean up Google TV.
                if ((data = /\bGoogle TV\b/.exec(product))) {
                    product = data[0];
                }
                // Detect simulators.
                if (/\bSimulator\b/i.test(ua)) {
                    product = (product ? product + ' ' : '') + 'Simulator';
                }
                // Detect Opera Mini 8+ running in Turbo/Uncompressed mode on iOS.
                if (name == 'Opera Mini' && /\bOPiOS\b/.test(ua)) {
                    description.push('running in Turbo/Uncompressed mode');
                }
                // Detect IE Mobile 11.
                if (name == 'IE' && /\blike iPhone OS\b/.test(ua)) {
                    data = parse(ua.replace(/like iPhone OS/, ''));
                    manufacturer = data.manufacturer;
                    product = data.product;
                }
                // Detect iOS.
                else if (/^iP/.test(product)) {
                    name || (name = 'Safari');
                    os = 'iOS' + ((data = / OS ([\d_]+)/i.exec(ua)) ?
                        ' ' + data[1].replace(/_/g, '.') :
                        '');
                }
                // Detect Kubuntu.
                else if (name == 'Konqueror' && !/buntu/i.test(os)) {
                    os = 'Kubuntu';
                }
                // Detect Android browsers.
                else if ((manufacturer && manufacturer != 'Google' &&
                        ((/Chrome/.test(name) && !/\bMobile Safari\b/i.test(ua)) || /\bVita\b/.test(product))) ||
                    (/\bAndroid\b/.test(os) && /^Chrome/.test(name) && /\bVersion\//i.test(ua))) {
                    name = 'Android Browser';
                    os = /\bAndroid\b/.test(os) ? os : 'Android';
                }
                // Detect Silk desktop/accelerated modes.
                else if (name == 'Silk') {
                    if (!/\bMobi/i.test(ua)) {
                        os = 'Android';
                        description.unshift('desktop mode');
                    }
                    if (/Accelerated *= *true/i.test(ua)) {
                        description.unshift('accelerated');
                    }
                }
                // Detect PaleMoon identifying as Firefox.
                else if (name == 'PaleMoon' && (data = /\bFirefox\/([\d.]+)\b/.exec(ua))) {
                    description.push('identifying as Firefox ' + data[1]);
                }
                // Detect Firefox OS and products running Firefox.
                else if (name == 'Firefox' && (data = /\b(Mobile|Tablet|TV)\b/i.exec(ua))) {
                    os || (os = 'Firefox OS');
                    product || (product = data[1]);
                }
                // Detect false positives for Firefox/Safari.
                else if (!name || (data = !/\bMinefield\b/i.test(ua) && /\b(?:Firefox|Safari)\b/.exec(name))) {
                    // Escape the `/` for Firefox 1.
                    if (name && !product && /[\/,]|^[^(]+?\)/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
                        // Clear name of false positives.
                        name = null;
                    }
                    // Reassign a generic name.
                    if ((data = product || manufacturer || os) &&
                        (product || manufacturer || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(os))) {
                        name = /[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(os) ? os : data) + ' Browser';
                    }
                }
                // Add Chrome version to description for Electron.
                else if (name == 'Electron' && (data = (/\bChrome\/([\d.]+)\b/.exec(ua) || 0)[1])) {
                    description.push('Chromium ' + data);
                }
                // Detect non-Opera (Presto-based) versions (order is important).
                if (!version) {
                    version = getVersion([
                        '(?:Cloud9|CriOS|CrMo|Edge|FxiOS|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|SamsungBrowser|Silk(?!/[\\d.]+$))',
                        'Version',
                        qualify(name),
                        '(?:Firefox|Minefield|NetFront)'
                    ]);
                }
                // Detect stubborn layout engines.
                if ((data =
                        layout == 'iCab' && parseFloat(version) > 3 && 'WebKit' ||
                        /\bOpera\b/.test(name) && (/\bOPR\b/.test(ua) ? 'Blink' : 'Presto') ||
                        /\b(?:Midori|Nook|Safari)\b/i.test(ua) && !/^(?:Trident|EdgeHTML)$/.test(layout) && 'WebKit' ||
                        !layout && /\bMSIE\b/i.test(ua) && (os == 'Mac OS' ? 'Tasman' : 'Trident') ||
                        layout == 'WebKit' && /\bPlayStation\b(?! Vita\b)/i.test(name) && 'NetFront'
                    )) {
                    layout = [data];
                }
                // Detect Windows Phone 7 desktop mode.
                if (name == 'IE' && (data = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(ua) || 0)[1])) {
                    name += ' Mobile';
                    os = 'Windows Phone ' + (/\+$/.test(data) ? data : data + '.x');
                    description.unshift('desktop mode');
                }
                // Detect Windows Phone 8.x desktop mode.
                else if (/\bWPDesktop\b/i.test(ua)) {
                    name = 'IE Mobile';
                    os = 'Windows Phone 8.x';
                    description.unshift('desktop mode');
                    version || (version = (/\brv:([\d.]+)/.exec(ua) || 0)[1]);
                }
                // Detect IE 11 identifying as other browsers.
                else if (name != 'IE' && layout == 'Trident' && (data = /\brv:([\d.]+)/.exec(ua))) {
                    if (name) {
                        description.push('identifying as ' + name + (version ? ' ' + version : ''));
                    }
                    name = 'IE';
                    version = data[1];
                }
                // Leverage environment features.
                if (useFeatures) {
                    // Detect server-side environments.
                    // Rhino has a global function while others have a global object.
                    if (isHostType(context, 'global')) {
                        if (java) {
                            data = java.lang.System;
                            arch = data.getProperty('os.arch');
                            os = os || data.getProperty('os.name') + ' ' + data.getProperty('os.version');
                        }
                        if (isModuleScope && isHostType(context, 'system') && (data = [context.system])[0]) {
                            os || (os = data[0].os || null);
                            try {
                                data[1] = context.require('ringo/engine').version;
                                version = data[1].join('.');
                                name = 'RingoJS';
                            } catch (e) {
                                if (data[0].global.system == context.system) {
                                    name = 'Narwhal';
                                }
                            }
                        } else if (
                            typeof context.process == 'object' && !context.process.browser &&
                            (data = context.process)
                        ) {
                            if (typeof data.versions == 'object') {
                                if (typeof data.versions.electron == 'string') {
                                    description.push('Node ' + data.versions.node);
                                    name = 'Electron';
                                    version = data.versions.electron;
                                } else if (typeof data.versions.nw == 'string') {
                                    description.push('Chromium ' + version, 'Node ' + data.versions.node);
                                    name = 'NW.js';
                                    version = data.versions.nw;
                                }
                            } else {
                                name = 'Node.js';
                                arch = data.arch;
                                os = data.platform;
                                version = /[\d.]+/.exec(data.version)[0];
                            }
                        } else if (rhino) {
                            name = 'Rhino';
                        }
                    }
                    // Detect Adobe AIR.
                    else if (getClassOf((data = context.runtime)) == airRuntimeClass) {
                        name = 'Adobe AIR';
                        os = data.flash.system.Capabilities.os;
                    }
                    // Detect PhantomJS.
                    else if (getClassOf((data = context.phantom)) == phantomClass) {
                        name = 'PhantomJS';
                        version = (data = data.version || null) && (data.major + '.' + data.minor + '.' + data.patch);
                    }
                    // Detect IE compatibility modes.
                    else if (typeof doc.documentMode == 'number' && (data = /\bTrident\/(\d+)/i.exec(ua))) {
                        // We're in compatibility mode when the Trident version + 4 doesn't
                        // equal the document mode.
                        version = [version, doc.documentMode];
                        if ((data = +data[1] + 4) != version[1]) {
                            description.push('IE ' + version[1] + ' mode');
                            layout && (layout[1] = '');
                            version[1] = data;
                        }
                        version = name == 'IE' ? String(version[1].toFixed(1)) : version[0];
                    }
                    // Detect IE 11 masking as other browsers.
                    else if (typeof doc.documentMode == 'number' && /^(?:Chrome|Firefox)\b/.test(name)) {
                        description.push('masking as ' + name + ' ' + version);
                        name = 'IE';
                        version = '11.0';
                        layout = ['Trident'];
                        os = 'Windows';
                    }
                    os = os && format(os);
                }
                // Detect prerelease phases.
                if (version && (data =
                        /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) ||
                        /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + (useFeatures && nav.appMinorVersion)) ||
                        /\bMinefield\b/i.test(ua) && 'a'
                    )) {
                    prerelease = /b/i.test(data) ? 'beta' : 'alpha';
                    version = version.replace(RegExp(data + '\\+?$'), '') +
                        (prerelease == 'beta' ? beta : alpha) + (/\d+\+?/.exec(data) || '');
                }
                // Detect Firefox Mobile.
                if (name == 'Fennec' || name == 'Firefox' && /\b(?:Android|Firefox OS)\b/.test(os)) {
                    name = 'Firefox Mobile';
                }
                // Obscure Maxthon's unreliable version.
                else if (name == 'Maxthon' && version) {
                    version = version.replace(/\.[\d.]+/, '.x');
                }
                // Detect Xbox 360 and Xbox One.
                else if (/\bXbox\b/i.test(product)) {
                    if (product == 'Xbox 360') {
                        os = null;
                    }
                    if (product == 'Xbox 360' && /\bIEMobile\b/.test(ua)) {
                        description.unshift('mobile mode');
                    }
                }
                // Add mobile postfix.
                else if ((/^(?:Chrome|IE|Opera)$/.test(name) || name && !product && !/Browser|Mobi/.test(name)) &&
                    (os == 'Windows CE' || /Mobi/i.test(ua))) {
                    name += ' Mobile';
                }
                // Detect IE platform preview.
                else if (name == 'IE' && useFeatures) {
                    try {
                        if (context.external === null) {
                            description.unshift('platform preview');
                        }
                    } catch (e) {
                        description.unshift('embedded');
                    }
                }
                // Detect BlackBerry OS version.
                // http://docs.blackberry.com/en/developers/deliverables/18169/HTTP_headers_sent_by_BB_Browser_1234911_11.jsp
                else if ((/\bBlackBerry\b/.test(product) || /\bBB10\b/.test(ua)) && (data =
                        (RegExp(product.replace(/ +/g, ' *') + '/([.\\d]+)', 'i').exec(ua) || 0)[1] ||
                        version
                    )) {
                    data = [data, /BB10/.test(ua)];
                    os = (data[1] ? (product = null, manufacturer = 'BlackBerry') : 'Device Software') + ' ' + data[0];
                    version = null;
                }
                // Detect Opera identifying/masking itself as another browser.
                // http://www.opera.com/support/kb/view/843/
                else if (this != forOwn && product != 'Wii' && (
                        (useFeatures && opera) ||
                        (/Opera/.test(name) && /\b(?:MSIE|Firefox)\b/i.test(ua)) ||
                        (name == 'Firefox' && /\bOS X (?:\d+\.){2,}/.test(os)) ||
                        (name == 'IE' && (
                            (os && !/^Win/.test(os) && version > 5.5) ||
                            /\bWindows XP\b/.test(os) && version > 8 ||
                            version == 8 && !/\bTrident\b/.test(ua)
                        ))
                    ) && !reOpera.test((data = parse.call(forOwn, ua.replace(reOpera, '') + ';'))) && data.name) {
                    // When "identifying", the UA contains both Opera and the other browser's name.
                    data = 'ing as ' + data.name + ((data = data.version) ? ' ' + data : '');
                    if (reOpera.test(name)) {
                        if (/\bIE\b/.test(data) && os == 'Mac OS') {
                            os = null;
                        }
                        data = 'identify' + data;
                    }
                    // When "masking", the UA contains only the other browser's name.
                    else {
                        data = 'mask' + data;
                        if (operaClass) {
                            name = format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
                        } else {
                            name = 'Opera';
                        }
                        if (/\bIE\b/.test(data)) {
                            os = null;
                        }
                        if (!useFeatures) {
                            version = null;
                        }
                    }
                    layout = ['Presto'];
                    description.push(data);
                }
                // Detect WebKit Nightly and approximate Chrome/Safari versions.
                if ((data = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
                    // Correct build number for numeric comparison.
                    // (e.g. "532.5" becomes "532.05")
                    data = [parseFloat(data.replace(/\.(\d)$/, '.0$1')), data];
                    // Nightly builds are postfixed with a "+".
                    if (name == 'Safari' && data[1].slice(-1) == '+') {
                        name = 'WebKit Nightly';
                        prerelease = 'alpha';
                        version = data[1].slice(0, -1);
                    }
                    // Clear incorrect browser versions.
                    else if (version == data[1] ||
                        version == (data[2] = (/\bSafari\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
                        version = null;
                    }
                    // Use the full Chrome version when available.
                    data[1] = (/\bChrome\/([\d.]+)/i.exec(ua) || 0)[1];
                    // Detect Blink layout engine.
                    if (data[0] == 537.36 && data[2] == 537.36 && parseFloat(data[1]) >= 28 && layout == 'WebKit') {
                        layout = ['Blink'];
                    }
                    // Detect JavaScriptCore.
                    // http://stackoverflow.com/questions/6768474/how-can-i-detect-which-javascript-engine-v8-or-jsc-is-used-at-runtime-in-androi
                    if (!useFeatures || (!likeChrome && !data[1])) {
                        layout && (layout[1] = 'like Safari');
                        data = (data = data[0], data < 400 ? 1 : data < 500 ? 2 : data < 526 ? 3 : data < 533 ? 4 : data < 534 ? '4+' : data < 535 ? 5 : data < 537 ? 6 : data < 538 ? 7 : data < 601 ? 8 : '8');
                    } else {
                        layout && (layout[1] = 'like Chrome');
                        data = data[1] || (data = data[0], data < 530 ? 1 : data < 532 ? 2 : data < 532.05 ? 3 : data < 533 ? 4 : data < 534.03 ? 5 : data < 534.07 ? 6 : data < 534.10 ? 7 : data < 534.13 ? 8 : data < 534.16 ? 9 : data < 534.24 ? 10 : data < 534.30 ? 11 : data < 535.01 ? 12 : data < 535.02 ? '13+' : data < 535.07 ? 15 : data < 535.11 ? 16 : data < 535.19 ? 17 : data < 536.05 ? 18 : data < 536.10 ? 19 : data < 537.01 ? 20 : data < 537.11 ? '21+' : data < 537.13 ? 23 : data < 537.18 ? 24 : data < 537.24 ? 25 : data < 537.36 ? 26 : layout != 'Blink' ? '27' : '28');
                    }
                    // Add the postfix of ".x" or "+" for approximate versions.
                    layout && (layout[1] += ' ' + (data += typeof data == 'number' ? '.x' : /[.+]/.test(data) ? '' : '+'));
                    // Obscure version for some Safari 1-2 releases.
                    if (name == 'Safari' && (!version || parseInt(version) > 45)) {
                        version = data;
                    }
                }
                // Detect Opera desktop modes.
                if (name == 'Opera' && (data = /\bzbov|zvav$/.exec(os))) {
                    name += ' ';
                    description.unshift('desktop mode');
                    if (data == 'zvav') {
                        name += 'Mini';
                        version = null;
                    } else {
                        name += 'Mobile';
                    }
                    os = os.replace(RegExp(' *' + data + '$'), '');
                }
                // Detect Chrome desktop mode.
                else if (name == 'Safari' && /\bChrome\b/.exec(layout && layout[1])) {
                    description.unshift('desktop mode');
                    name = 'Chrome Mobile';
                    version = null;

                    if (/\bOS X\b/.test(os)) {
                        manufacturer = 'Apple';
                        os = 'iOS 4.3+';
                    } else {
                        os = null;
                    }
                }
                // Strip incorrect OS versions.
                if (version && version.indexOf((data = /[\d.]+$/.exec(os))) == 0 &&
                    ua.indexOf('/' + data + '-') > -1) {
                    os = trim(os.replace(data, ''));
                }
                // Add layout engine.
                if (layout && !/\b(?:Avant|Nook)\b/.test(name) && (
                        /Browser|Lunascape|Maxthon/.test(name) ||
                        name != 'Safari' && /^iOS/.test(os) && /\bSafari\b/.test(layout[1]) ||
                        /^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Samsung Internet|Sleipnir|Web)/.test(name) && layout[1])) {
                    // Don't add layout details to description if they are falsey.
                    (data = layout[layout.length - 1]) && description.push(data);
                }
                // Combine contextual information.
                if (description.length) {
                    description = ['(' + description.join('; ') + ')'];
                }
                // Append manufacturer to description.
                if (manufacturer && product && product.indexOf(manufacturer) < 0) {
                    description.push('on ' + manufacturer);
                }
                // Append product to description.
                if (product) {
                    description.push((/^on /.test(description[description.length - 1]) ? '' : 'on ') + product);
                }
                // Parse the OS into an object.
                if (os) {
                    data = / ([\d.+]+)$/.exec(os);
                    isSpecialCasedOS = data && os.charAt(os.length - data[0].length - 1) == '/';
                    os = {
                        'architecture': 32,
                        'family': (data && !isSpecialCasedOS) ? os.replace(data[0], '') : os,
                        'version': data ? data[1] : null,
                        'toString': function() {
                            var version = this.version;
                            return this.family + ((version && !isSpecialCasedOS) ? ' ' + version : '') + (this.architecture == 64 ? ' 64-bit' : '');
                        }
                    };
                }
                // Add browser/OS architecture.
                if ((data = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(arch)) && !/\bi686\b/i.test(arch)) {
                    if (os) {
                        os.architecture = 64;
                        os.family = os.family.replace(RegExp(' *' + data), '');
                    }
                    if (
                        name && (/\bWOW64\b/i.test(ua) ||
                            (useFeatures && /\w(?:86|32)$/.test(nav.cpuClass || nav.platform) && !/\bWin64; x64\b/i.test(ua)))
                    ) {
                        description.unshift('32-bit');
                    }
                }
                // Chrome 39 and above on OS X is always 64-bit.
                else if (
                    os && /^OS X/.test(os.family) &&
                    name == 'Chrome' && parseFloat(version) >= 39
                ) {
                    os.architecture = 64;
                }

                ua || (ua = null);

                /*------------------------------------------------------------------------*/

                /**
                 * The platform object.
                 *
                 * @name platform
                 * @type Object
                 */
                var platform = {};

                /**
                 * The platform description.
                 *
                 * @memberOf platform
                 * @type string|null
                 */
                platform.description = ua;

                /**
                 * The name of the browser's layout engine.
                 *
                 * The list of common layout engines include:
                 * "Blink", "EdgeHTML", "Gecko", "Trident" and "WebKit"
                 *
                 * @memberOf platform
                 * @type string|null
                 */
                platform.layout = layout && layout[0];

                /**
                 * The name of the product's manufacturer.
                 *
                 * The list of manufacturers include:
                 * "Apple", "Archos", "Amazon", "Asus", "Barnes & Noble", "BlackBerry",
                 * "Google", "HP", "HTC", "LG", "Microsoft", "Motorola", "Nintendo",
                 * "Nokia", "Samsung" and "Sony"
                 *
                 * @memberOf platform
                 * @type string|null
                 */
                platform.manufacturer = manufacturer;

                /**
                 * The name of the browser/environment.
                 *
                 * The list of common browser names include:
                 * "Chrome", "Electron", "Firefox", "Firefox for iOS", "IE",
                 * "Microsoft Edge", "PhantomJS", "Safari", "SeaMonkey", "Silk",
                 * "Opera Mini" and "Opera"
                 *
                 * Mobile versions of some browsers have "Mobile" appended to their name:
                 * eg. "Chrome Mobile", "Firefox Mobile", "IE Mobile" and "Opera Mobile"
                 *
                 * @memberOf platform
                 * @type string|null
                 */
                platform.name = name;

                /**
                 * The alpha/beta release indicator.
                 *
                 * @memberOf platform
                 * @type string|null
                 */
                platform.prerelease = prerelease;

                /**
                 * The name of the product hosting the browser.
                 *
                 * The list of common products include:
                 *
                 * "BlackBerry", "Galaxy S4", "Lumia", "iPad", "iPod", "iPhone", "Kindle",
                 * "Kindle Fire", "Nexus", "Nook", "PlayBook", "TouchPad" and "Transformer"
                 *
                 * @memberOf platform
                 * @type string|null
                 */
                platform.product = product;

                /**
                 * The browser's user agent string.
                 *
                 * @memberOf platform
                 * @type string|null
                 */
                platform.ua = ua;

                /**
                 * The browser/environment version.
                 *
                 * @memberOf platform
                 * @type string|null
                 */
                platform.version = name && version;

                /**
                 * The name of the operating system.
                 *
                 * @memberOf platform
                 * @type Object
                 */
                platform.os = os || {

                    /**
                     * The CPU architecture the OS is built for.
                     *
                     * @memberOf platform.os
                     * @type number|null
                     */
                    'architecture': null,

                    /**
                     * The family of the OS.
                     *
                     * Common values include:
                     * "Windows", "Windows Server 2008 R2 / 7", "Windows Server 2008 / Vista",
                     * "Windows XP", "OS X", "Ubuntu", "Debian", "Fedora", "Red Hat", "SuSE",
                     * "Android", "iOS" and "Windows Phone"
                     *
                     * @memberOf platform.os
                     * @type string|null
                     */
                    'family': null,

                    /**
                     * The version of the OS.
                     *
                     * @memberOf platform.os
                     * @type string|null
                     */
                    'version': null,

                    /**
                     * Returns the OS string.
                     *
                     * @memberOf platform.os
                     * @returns {string} The OS string.
                     */
                    'toString': function() {
                        return 'null';
                    }
                };

                platform.parse = parse;
                platform.toString = toStringPlatform;

                if (platform.version) {
                    description.unshift(version);
                }
                if (platform.name) {
                    description.unshift(name);
                }
                if (os && name && !(os == String(os).split(' ')[0] && (os == name.split(' ')[0] || product))) {
                    description.push(product ? '(' + os + ')' : 'on ' + os);
                }
                if (description.length) {
                    platform.description = description.join(' ');
                }
                return platform;
            }

            module.exports = parse();
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {}],
    58: [function(require, module, exports) {
        'use strict';

        /*字符串处理（与PHP的 trim功能相同）*/
        String.prototype.ltrim = function(str) {
            if (typeof str === "undefined") {
                return this.replace(/^\s*/, '')
            }
            return this.substr(0, str.length) === str && (this.substr(str.length)) || this;
        };

        String.prototype.rtrim = function(str) {
            if (typeof str === "undefined") {
                return this.replace(/\s*$/, '')
            }
            return this.substr(-str.length) === str && (this.substr(0, this.length - str.length)) || this;
        };

        String.prototype.trim = function(str) {
            return this.ltrim(str).rtrim(str);
        };

        //html编码
        function HTMLEncode(str) {
            var s = "";
            if (str.length == 0) return "";
            s = str.replace(/&/g, "&amp;");
            s = s.replace(/</g, "&lt;");
            s = s.replace(/>/g, "&gt;");
            s = s.replace(/ /g, "&nbsp;");
            s = s.replace(/\'/g, "&#39;");
            s = s.replace(/\"/g, "&quot;");
            return s;
        };

        //解码html;
        function HTMLDecode(str) {
            var s = "";
            if (str.length == 0) return "";
            s = str.replace(/&amp;/g, "&");
            s = s.replace(/&lt;/g, "<");
            s = s.replace(/&gt;/g, ">");
            s = s.replace(/&nbsp;/g, " ");
            s = s.replace(/&#39;/g, "\'");
            s = s.replace(/&quot;/g, "\"");
            return s;
        };

        //转换为小写
        function manualLowercase(s) {
            /* jshint bitwise: false */
            return isString(s) ?
                s.replace(/[A-Z]/g, function(ch) {
                    return String.fromCharCode(ch.charCodeAt(0) | 32);
                }) :
                s;
        };

        //转换为大写
        function manualUppercase(s) {
            /* jshint bitwise: false */
            return isString(s) ?
                s.replace(/[a-z]/g, function(ch) {
                    return String.fromCharCode(ch.charCodeAt(0) & ~32);
                }) :
                s;
        };

        //转换为小写
        function lowercase(string) {
            return isString(string) ? string.toLowerCase() : string;
        };

        //转换为大写
        function uppercase(string) {
            return isString(string) ? string.toUpperCase() : string;
        };

        //检测字符大小写转换
        if ('i' !== 'I'.toLowerCase()) {
            lowercase = manualLowercase;
            uppercase = manualUppercase;
        }

        //转换为正则字符
        function escapeToRegexp(s) {
            return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
            replace(/\x08/g, '\\x08');
        };

        module.exports = {
            HTMLEncode: HTMLEncode,
            HTMLDecode: HTMLDecode,
            manualLowercase: manualLowercase,
            manualUppercase: manualUppercase,
            lowercase: lowercase,
            uppercase: uppercase,
            escapeToRegexp: escapeToRegexp
        }
    }, {}],
    59: [function(require, module, exports) {
        function getType(value) {
            if (isElement(value)) return 'element';
            var type = typeof(value);
            if (type == 'object') {
                type = {}.toString.call(value).match(/object\s+(\w*)/)[1].toLocaleLowerCase()
            }
            return type;
        };

        function isType(type) {
            return function(obj) {
                return {}.toString.call(obj) == "[object " + type + "]"
            }
        };

        /*判断一个变量是否定义*/
        function isDefined(value) {
            return typeof value !== 'undefined';
        }

        function isElement(node) {
            return !!(node && (node.nodeName || (node.prop && node.attr && node.find)));
        }

        /*判断对象是空值*/
        function isEmpty(obj) {
            switch (typeof obj) {
                case 'object':
                    for (var n in obj) {
                        return false
                    }
                    return true;
                    break;
                default:
                    if (!obj) {
                        return true
                    }
                    return false
            }
        };

        var TYPED_ARRAY_REGEXP = /^\[object (?:Uint8|Uint8Clamped|Uint16|Uint32|Int8|Int16|Int32|Float32|Float64)Array\]$/;

        //是否其他类型数组
        function isTypedArray(value) {
            return value && isNumber(value.length) && TYPED_ARRAY_REGEXP.test(toString.call(value));
        }

        //对比两个数据
        function equals(o1, o2) {
            if (o1 === o2) return true;
            if (o1 === null || o2 === null) return false;
            if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
            var t1 = typeof o1,
                t2 = typeof o2,
                length, key, keySet;
            if (t1 === t2) {
                if (t1 === 'object') {
                    if (isArray(o1)) {
                        if (!isArray(o2)) return false;
                        if ((length = o1.length) == o2.length) {
                            for (key = 0; key < length; key++) {
                                if (!equals(o1[key], o2[key])) return false;
                            }
                            return true;
                        }
                    } else if (isDate(o1)) {
                        if (!isDate(o2)) return false;
                        return equals(o1.getTime(), o2.getTime());
                    } else if (isRegExp(o1)) {
                        return isRegExp(o2) ? o1.toString() === o2.toString() : false;
                    } else {
                        if (isWindow(o1) || isWindow(o2) ||
                            isArray(o2) || isDate(o2) || isRegExp(o2)) return false;
                        keySet = Object.create(null);
                        for (key in o1) {
                            if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
                            if (!equals(o1[key], o2[key])) return false;
                            keySet[key] = true;
                        }
                        for (key in o2) {
                            if (!(key in keySet) &&
                                key.charAt(0) !== '$' &&
                                isDefined(o2[key]) &&
                                !isFunction(o2[key])) return false;
                        }
                        return true;
                    }
                }
            }

            /*检查两个变量是否是function*/
            if (getType(o1) === getType(o2)) {
                switch (getType(o1)) {
                    case 'function':
                        if (o1.toString() !== o2.toString()) {
                            return false;
                        }
                        var keys = {},
                            key;
                        for (key in o1) {
                            keys[key] = key;
                        }
                        for (key in o2) {
                            keys[key] = key;
                        }
                        for (key in keys) {
                            if (o1.propertyIsEnumerable(key) && o2.propertyIsEnumerable(key)) {

                            } else {
                                return false;
                            }
                        }

                        keys = {};
                        for (key in o1.prototype) {
                            keys[key] = key;
                        }
                        for (key in o2.prototype) {
                            keys[key] = key;
                        }
                        for (key in keys) {
                            if (o1.prototype.propertyIsEnumerable(key) && o2.prototype.propertyIsEnumerable(key)) {

                            } else {
                                return false;
                            }
                        }
                        return true;

                        break;
                }
            }
            return false;
        };

        module.exports = {
            isType: isType,
            isObject: function(data) {
                return data instanceof Object;
            },
            isArray: function(data) {
                return data instanceof Array;
            },
            isString: function(data) {
                return typeof data === 'string';
            },
            isNumber: function(data) {
                return typeof data === 'number';
            },
            isFunction: function(data) {
                return data instanceof Function;
            },
            isDate: function(data) {
                return data instanceof Date;
            },
            isBoolean: function(data) {
                return typeof data === 'boolean';
            },
            isRegExp: function(data) {
                return data instanceof RegExp;
            },
            isFile: function(data) {
                return data instanceof File;
            },
            isFormData: function(data) {
                return data instanceof FormData;
            },
            isBlob: function(data) {
                return data instanceof Blob;
            },
            isWindow: function(data) {
                return data instanceof Window;
            },
            isHTMLDocument: function(data) {
                return data instanceof HTMLDocument;
            },
            isDefined: isDefined,
            isElement: isElement,
            isEmpty: isEmpty,
            isTypedArray: isTypedArray,
            equals: equals,
        }
    }, {}],
    60: [function(require, module, exports) {
        /**
         * 网址处理
         * Created by xiyuan on 17-3-7.
         */
        "use strict";

        /* url编码 */
        var encode = window ? window.encodeURIComponent : encodeURIComponent;

        /* 获取url的hash */
        function hash(url) {
            if (typeof url === "string") window.location.hash = encodeURI(url);
            return window.location.hash.replace(/^#/, '');
        };

        /* 获取url地址 */
        function url(url) {
            if (typeof url === "string") window.location.href = url;
            return window.location.href;
        };

        /* 设置或返回主机名和当前 URL 的端口号 */
        function host(url) {
            if (typeof url === "string") {
                if (url = url.match(/^(\w+:)?\/\/(\w[\w\.]*(:\d+)?)/)) return url[2];
            };
            return window.location.host;
        };

        /* 设置或返回当前 URL 的主机名 */
        function hostName(url) {
            if (typeof url === "string") {
                if (url = url.match(/^(\w+:)?\/\/(\w[\w\.]*)/)) return url[2];
            };
            return window.location.hostname;
        };

        /*domain name*/
        function domain(url) {
            if (typeof url === "string") {
                if (url = url.match(/^(\w+:)?\/\/(\w[\w\.]*(:\d+)?)/)) return (url[1] ? url[1] : window.location.protocol) + '//' + url[2] + (url[3] || '');
            };
            return window.location.protocol + '//' + window.location.host;
        };

        /* 设置或返回当前 URL 的端口号 */
        function port(url) {
            if (typeof url === "string") {
                if (url = url.match(/^(\w+:)?\/\/(\w[\w\.]*(:(\d+))?)/)) return url[4] || 80;
            };
            return window.location.port;
        };

        /* 设置或返回当前 URL 的协议 */
        function protocol(url) {
            if (typeof url === "string") {
                if (url = url.match(/^\w+:/)) return url[0];
            };
            return window.location.protocol;
        };

        /* 合并数据到url参数中 */
        function computedUrl(url, data) {

            var hash,
                normal,
                hashIndex = url.indexOf('#'),
                dataUrl = objectToUrl(data);

            if (hashIndex < 0) {
                normal = url;
                hash = '';
            } else {
                normal = url.slice(0, hashIndex);
                hash = url.slice(hashIndex);
            }

            normal += dataUrl ? (normal.indexOf('?') < 0 ? '?' : '&') : '';

            return normal + dataUrl + hash;
        };

        /* 把对象转换成url参数 */
        function objectToUrl(obj) {
            var value,
                data = [];

            if (typeof obj === 'object') {
                Object.keys(obj).forEach(function(key) {
                    value = obj[key];
                    if (typeof value === 'object') {
                        Object.keys(value).forEach(function(i) {
                            data.push(encode(key) + '=' + encode(value[i]));
                        });
                    } else {
                        data.push(encode(key) + '=' + encode(value));
                    }
                });
            } else {
                data.push(obj)
            }
            return data.join('&');
        };

        /* 转换URL参数为object */
        function toObject(str, toggle) {
            var _str = str,
                result = {},
                index = str.indexOf('?') + 1,
                hashIndex = str.indexOf('#');

            if (index) {
                //检查hash是否存在,并且检查sercha是否在hash前面
                if (hashIndex > index) {
                    str = str.substring(index, hashIndex);

                    //判断是否开启合并hash中的参数
                    if (toggle) {
                        _str = _str.substring(hashIndex);
                        index = _str.indexOf('?') + 1;
                        index && (str = str + '&' + _str.substring(index))
                    }

                    //检查hash是否存在
                } else if (toggle && hashIndex < index || hashIndex === -1) {
                    str = str.substring(index);
                }

                var key = ~0,
                    arr = str.split("&"),
                    l = arr.length;

                while (++key < l) {
                    var value = arr[key].split('=');
                    //修复多个重名表单name值
                    var nameKey = decodeURIComponent(value[0]);
                    var nameValue = decodeURIComponent(value[1]);
                    var nameValues = result[nameKey];

                    switch (typeof nameValues) {
                        case 'object':
                            result[nameKey].push(nameValue);
                            break;
                        case 'string':
                            result[nameKey] = [nameValues, nameValue];
                            break;
                        default:
                            result[nameKey] = nameValue;
                    }
                }
            }
            return result;
        };

        module.exports = {
            hash: hash,
            url: url,
            host: host,
            domain: domain,
            hostName: hostName,
            port: port,
            protocol: protocol,
            computedUrl: computedUrl,
            objectToUrl: objectToUrl,
            toObject: toObject
        }

    }, {}],
    61: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-29.
         */

        'use strict';
        //消息在粗粒度级别上突出强调应用程序的运行过程。
        function info(msg) {
            console.info(msg);
        }

        //警告出现潜在错误的情形
        function warn(msg) {
            console.warn(msg);
        }

        //虽然发生错误事件，但仍然不影响系统的继续运行。
        function error(msg) {
            console.error(msg);
        }

        //与DEBUG 相比更细致化的记录事件消息。
        function trace(msg) {
            console.dir(msg)
        }

        //调试日志
        function debug(msg) {
            console.log(msg)
        }

        //致命的错误
        function fatal(msg) {
            throw msg;
        }

        module.exports = {
            info: info,
            warn: warn,
            error: error,
            trace: trace,
            debug: debug,
            fatal: fatal
        }
    }, {}],
    62: [function(require, module, exports) {
        /**
         * 资源获取 （model view presenter ...）
         * Created by xiyuan on 17-6-1.
         */

        'use strict';

        var jsonp = require('../lib/net/jsonp');
        var ajax = require('../lib/net/ajax');
        var log = require('../log/log');
        var PATH = require('../lib/path');
        var appConf = require('../config/lib/commData').appConf;

        /**
         * 资源获取
         * @param url
         * @param option
         * @param callback
         */
        function getSource(url, option, callback) {

            //模式目录名称
            var sliceName = appConf.system.moduleDefault[option.mode + 'Slice'],
                modePath = appConf.system.moduleDirName[option.mode],
                info = {
                    //当前模块
                    module: '',
                    //当前操作(切片)
                    slice: '',
                    //当前资源地址
                    url: '',
                    //当前资源路径(不包含文件 module路径、mode类型目录、文件module后缀、文件后缀)
                    pathName: '',
                    //资源目录
                    mode: modePath,
                    //资源来源地址
                    origin: ''
                };

            if (typeof url === 'string') {

                //匹配配置中的path
                var i = ~0,
                    module,
                    location,
                    pathInfo,
                    pl = appConf.pathList.length;

                while (++i < pl) {
                    pathInfo = appConf.pathList[i];
                    if (pathInfo.regExp.test(url)) {
                        url = url.replace(pathInfo.regExp, function(str, $1) {
                            return pathInfo.path + '/' + ($1 || '');
                        });
                        break;
                    }
                }

                //检查当前模块
                location = url.indexOf('@');
                if (location !== -1) {
                    //提取模块地址
                    module = info.module = PATH.normalize(url.slice(0, location));
                    //替换模块
                    url = url.slice(location + 1);
                }

                //获取资源切片
                url = url.replace(/:([^:]*)$/, function(str, $1) {
                    sliceName = $1;
                    return '';
                });

                //当前资源路径(不包含文件 module路径、mode类型目录、文件module后缀、文件后缀)
                info.pathName = url;
                //切片
                info.slice = sliceName;
                //路径
                url = (module ? module + '/' + modePath + '/' : '') + url;
            } else if (url instanceof Object) {
                info = url;
                url = info.url;
                sliceName = info.slice;
            }

            if (option.isAjax) {
                ajax({
                    type: 'get',
                    url: url + '/' + sliceName + (option.suffix || appConf.tplSuffix),
                    success: function(strSource) {
                        callback(strSource)
                    },
                    error: function() {
                        callback(false);
                    }
                });

            } else {
                jsonp({
                    url: url + appConf.system.fileSuffix[option.mode] + '.js',
                    jsonpCallback: appConf.system.fileCallback[option.mode],
                    complete: function(data) {
                        //获取资源真实地址
                        info.url = this.option.url;
                        //检查返回的状态
                        if (this.state) {
                            //检查是否多个jsonp切片
                            var sourceMap = (this.many ? [].slice.call(arguments) : [
                                [].slice.call(arguments)
                            ]).reduce(function(map, source) {
                                map[source[0]] = source.slice(1);
                                return map;
                            }, {});

                            callback(sourceMap[sliceName], info)

                        } else {
                            log.error(option.mode + '文件【' + this.option.url + '】不存在!');
                        }
                    }
                })
            }

        }

        module.exports = getSource;
    }, {
        "../config/lib/commData": 33,
        "../lib/net/ajax": 51,
        "../lib/net/jsonp": 53,
        "../lib/path": 56,
        "../log/log": 61
    }],
    63: [function(require, module, exports) {
        /**
         * 转换真实资源路径
         * Created by xiyuan on 17-6-1.
         */

        var PATH = require('../lib/path');
        var OBJECT = require('../lib/object');
        var appConf = require('../config/lib/commData').appConf;

        /**
         * 转换真实资源路径
         * @param url
         * @param originInfo
         * @param modeType Site.prototype.isPrototypeOf(s)
         */
        function sourcePathNormal(url, originInfo, modeType) {
            var first = url.charAt(0),
                moduleDirName = OBJECT.hasPrototypeProperty(appConf.system.moduleDirName, modeType) ? modeType : appConf.system.moduleDirName[modeType] || modeType,
                sliceName = appConf.system.moduleDefault[modeType + 'Slice'] || '',

                sourceInfo = {
                    //当前模块
                    module: '',
                    //当前操作(切片)
                    slice: '',
                    //当前资源地址
                    url: '',
                    //当前资源路径(不包含文件 module路径、mode类型目录、文件module后缀、文件后缀)
                    pathName: '',
                    //资源目录
                    mode: moduleDirName,
                    //资源来源地址
                    origin: originInfo,

                };

            //匹配配置中的path
            var i = ~0,
                module,
                location,
                pathInfo,
                pl = appConf.pathList.length;

            while (++i < pl) {
                pathInfo = appConf.pathList[i];
                if (pathInfo.regExp.test(url)) {
                    url = url.replace(pathInfo.regExp, function(str, $1) {
                        return pathInfo.path + '/' + ($1 || '');
                    });
                    break;
                }
            }

            //检查当前模块
            location = url.indexOf('@');
            if (location !== -1) {
                if (location === 0) {
                    module = originInfo.module;
                } else {
                    //提取模块地址
                    module = PATH.normalize(url.slice(0, location));
                }
                //替换模块
                url = url.slice(location + 1);
            } else if (url.charAt(0) === '/' || url.charAt(0) === '.') {
                module = '';
            } else {
                module = originInfo.module;
            }

            //获取资源切片
            url = url.replace(/:([^:]*)$/, function(str, $1) {
                sliceName = $1;
                return '';
            });

            //module模块地址
            sourceInfo.module = module;
            //当前资源路径(不包含文件 module路径、mode类型目录、文件module后缀、文件后缀)
            sourceInfo.pathName = url || originInfo.pathName;
            if (/\/$/.test(sourceInfo.pathName)) sourceInfo.pathName += appConf.system.moduleDefault[modeType];

            //切片
            sourceInfo.slice = sliceName;
            //url
            sourceInfo.url = PATH.normalize((module ? module + '/' + moduleDirName + '/' : '') + sourceInfo.pathName);
            return sourceInfo;
        }

        module.exports = sourcePathNormal;
    }, {
        "../config/lib/commData": 33,
        "../lib/object": 54,
        "../lib/path": 56
    }],
    64: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-9.
         */
        'use strict';

        ;
        (function(vf, exports) {
            if (typeof define === "function" && define.cmd) {
                define(function() {
                    return vf;
                })
            } else {
                exports.vf = vf();
            }
        })(function() {

            //初始化
            require('./init/index').exec();


            return {
                lib: require('./inside/lib/exports'),
                engin: require('./engine/index'),
                getConf: require('./inside/config/index').getCoustomConf
            }
        }, window)
    }, {
        "./engine/index": 3,
        "./init/index": 31,
        "./inside/config/index": 32,
        "./inside/lib/exports": 49
    }]
}, {}, [64]);