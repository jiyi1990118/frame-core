/**
 * Created by xiyuan on 17-5-15.
 */
// var observer=require('../../../inside/lib/observer');

//语法解析
var syntaxStruct = require('./syntaxStruct');

//语法结构处理
var syntaxHandle = require('./syntaxHandle');

var log = require('../../../inside/log/log');

var directiveStroage = {};

//指令类
function directiveClass(directiveConf, vnode, expInfo, extraParameters, directiveName, vdomApi) {

    var This = this;

    this.vdomApi = vdomApi;

    //标识当前节点是指令
    vnode.isDirective = true;

    //指令名称
    this.name = directiveName;

    this.expInfo = expInfo;

    //表达式
    this.exp = expInfo.value;

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

    //外部接口数据存储
    this.exports = {};

    //监听存储
    this.watchs = {
        create: [],
        render: []
    }

    this.$api = {
        //作用域
        scope: vnode.$scope,// directiveConf.scope = directiveConf.scope || {},
        //过滤器
        filter: {},
        //虚拟节点
        vnode: vnode,
        //expInfo
        expInfo: vnode.data.attrsMap[directiveName],
        //节点渲染
        render: function () {

        },
        rootScope: vnode.rootScope,
        stroage: {},
        //模板节点
        templateVnode: vnode.clone(),
        //对外提供数据出口
        exports: function (key, data) {
            if (This.exports[key]) {
                if (This.exports[key].ob) {
                    This.exports[key].ob.write(This.exports[key].exp, data)
                } else {
                    log.warn('++++++++++++++++，功能需做兼容!')
                }
            } else {
                log.warn(directiveName + ' 指令对外提供的数据接口 [' + key + '] 未定义!')
            }
        }

    }
}

//监听创建
directiveClass.prototype.watchCreate = function (fn) {
    if (fn instanceof Function) this.watchs.create.push(fn);
}

//监听渲染
directiveClass.prototype.watchRender = function (fn) {
    if (fn instanceof Function) this.watchs.render.push(fn);
}

//实例化
directiveClass.prototype.init = function () {
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
    Object.keys(conf.scope = conf.scope || {}).forEach(function (sKey) {
        $api.scope[sKey] = conf.scope[sKey];
    })

    //检查观察的属性 中数据是否完全加载
    if (conf.props) {
        if (props instanceof Function) {
            props = props.call($api, exp, this.expInfo, vnode);
            watchProps = watchProps.concat(props)

            if (watchProps.length) {
                //进行属性作用域数据获取
                watchProps.forEach(function (propConf) {
                    propConf.exp = propConf.exp || exp;

                    if (!propConf.exp)return renderTrigger();

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

                        //记录到虚拟节点上，以便后续销毁使用
                        (vnode.data.syntaxExample = vnode.data.syntaxExample || []).push(syntaxExample);

                        //监听当前语法
                        if (propConf.watch instanceof Function) {
                            syntaxExample.readWatch(propConf.watch.bind($api))
                        }

                        //检查是否提供外部数据接口
                        if (propConf.isExports) {
                            $this.exports[propConf.key] = {
                                exp: propConf.exp,
                                ob: syntaxExample.structRes.observers[0]
                            };
                            renderTrigger();
                        } else {
                            //读取表达式返回的值
                            if (!syntaxExample.read(function (newData) {
                                    $api.scope[propConf.key] = newData;

                                    //获取当前值的watchKey
                                    if (propConf.getWatchInfo instanceof Function) {
                                        propConf.getWatchInfo(syntaxExample.getWatchInfo());
                                    }

                                    //检查是否自动渲染
                                    if (propConf.autoRender) {
                                        //监听表达式返回的值
                                        syntaxExample.watch(function (newData) {

                                            $api.scope[propConf.key] = newData;

                                            //获取当前值的watchKey
                                            if (propConf.getWatchInfo instanceof Function) {
                                                propConf.getWatchInfo(syntaxExample.getWatchInfo());
                                            }

                                            if (isRender) {
                                                isRender = true;
                                                $this.render();
                                            } else {
                                                renderTrigger();
                                            }
                                        })
                                    }

                                    //检查是否有默认数据 并渲染
                                    if (propConf.hasOwnProperty('default') && isRender) {
                                        isRender = true;
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
                            }
                            ;
                        }
                    } else {
                        console.warn('表达式： ' + propConf.exp + '有误！')
                    }
                })

            } else {
                isRender = true;
                $this.render();
            }
        } else {
            console.warn('指令配置中props只能为function')
        }
    } else {
        isRender = true;
        $this.render();
    }
}

directiveClass.prototype.render = function () {
    var $api = this.$api,
        conf = this.conf,
        vnode = this.vnode,
        renderVnode;

    if (!this.isRender) {
        //写入钩子
        if (conf.hook) {
            var hooks = vnode.data.hook = vnode.data.hook || {};
            Object.keys(conf.hook).forEach(function (hookName) {
                //检查并创建
                hooks[hookName] = hooks[hookName] || [];
                hooks[hookName] = [].concat(hooks[hookName]);

                //合并
                hooks[hookName] = hooks[hookName].concat(function () {
                    conf.hook[hookName].apply($api, arguments);
                });

                vnode.data.hook = hooks;
            })

            if (typeof conf.hook.init === "function") {
                conf.hook.init.call($api, vnode);
            }

            //检查元素是否渲染
            if (vnode.elm) {
                if (typeof conf.hook.create === "function") {
                    conf.hook.create.call($api, vnode);
                }
                if (vnode.elm.parentNode && typeof conf.hook.insert === "function") {
                    conf.hook.insert.call($api, vnode);
                }
            }
        }
    }

    //检查是否有渲染的方法
    if (conf.render instanceof Function) {
        renderVnode = conf.render.call(this.$api, this.$api.vnode, this.$api.scope);

        switch (true) {
            case !renderVnode:
                return;
            case renderVnode === vnode:
            case renderVnode.elm && renderVnode.elm === vnode.elm:
        }

        vnode.innerVnode = renderVnode;
    }

    //标识当前节点是否替换
    vnode.isReplace = conf.isReplace;

    //触发创建的观察
    if (!this.isRender) {
        this.watchs.create.forEach(function (create) {
            create();
        })
    }

    //触发渲染的观察
    this.watchs.render.forEach(function (render) {
        render();
    })
    this.isRender = true;
}

exports.directiveClass = directiveClass;

//指令获取
exports.get = function (directiveName) {
    return directiveStroage[directiveName];
}

//指令注册
exports.register = function (directiveName, directiveConf) {
    directiveStroage[directiveName] = function (vnode, expInfo, extraParameters, vdomApi) {
        return new directiveClass(directiveConf, vnode, expInfo, extraParameters, directiveName, vdomApi);
    };
}