/**
 * Created by xiyuan on 17-5-11.
 */


//语法解析
var syntaxStruct = require('./syntaxStruct');

//语法结构处理
var syntaxHandle = require('./syntaxHandle');

// var encrypt= require('../../../inside/lib/encrypt');

var log=require('../../../inside/log/log');

var compStroage = {};

//组件类
function compClass(compConf, vnode, extraParameters,vdomApi,compName) {

    var This=this;

    //标识当前节点是组件
    vnode.isComponent = true;

    //组件元素内部作用域
    vnode.innerScope={};

    if(compConf.scope instanceof Function){
        var _scope=compConf.scope();
        if(_scope) vnode.innerScope=_scope;
    }else if(compConf.scope instanceof Object){
        Object.keys(compConf.scope||{}).forEach(function (key) {
            vnode.innerScope[key]=compConf.scope[key];
        })
    }

    vnode.innerFilter=compConf.filter||{};

    //组件实例配置
    this.conf = compConf;

    //当前组件虚拟节点
    this.vnode = vnode;

    //组件名称
    this.compName=compName;

    //组件优先级
    this.priority = compConf.priority || 0;

    //组件扩展参数
    this.extraParameter = extraParameters;

    //外部接口数据存储
    this.exports={};

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
        template:compConf.template,
        //虚拟节点
        vnode: vnode,
        //节点渲染
        render: function (html,scope,filter) {
            var vnode=vdomApi.html2vdom(html);
            vnode.innerScope=scope;
            vnode.rootScope=scope;
            vnode.$scope=scope||vnode.$scope;
            vnode.innerFilter=filter;
            return vnode;

        },
        rootScope: vnode.rootScope,
        //模板节点
        templateVnode: vnode.clone(),
        stroage: {},
        //对外提供数据出口
        exports:function (key,data) {
            if(This.exports[key]){
                if(This.exports[key].ob){
                    This.exports[key].ob.write(This.exports[key].exp,data)
                }else{
                    log.warn('++++++++++++++++，功能需做兼容!')
                }
            }else{
                log.warn(This.compName +' 组件对外提供的数据接口 ['+key+'] 未定义!')
            }
        }

    }

}

//监听创建
compClass.prototype.watchCreate = function (fn) {
    if (fn instanceof Function) this.watchs.create.push(fn);
}

//监听渲染
compClass.prototype.watchRender = function (fn) {
    if (fn instanceof Function) this.watchs.render.push(fn);
}

//实例化
compClass.prototype.init = function () {
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
        var proData={};
        if (!attrsMap[propName] ) {
            return prop.isEmpty || console.warn('" '+$this.compName+'" 组件数据属性 ' + propName + ' 未定义!');
        }

        if (prop instanceof Function) {
            proData=prop = prop.call(this, attrsMap[propName].value)
            proData.key = prop.key || propName;
            watchProps = watchProps.concat(proData);
        } else if (prop instanceof Object) {
            proData.key = prop.key || propName;
            proData.exp = prop.exp || attrsMap[propName].value;

            Object.keys(prop).forEach(function (key) {
                proData[key]=prop[key];
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
            propLoad--;
            if(!isRender)$this.render();
            isRender = true;
        }
    }

    //检查模板
    if (!conf.template) {
        conf.template = vnode.children;
    }

    //检查观察的属性 并处理
    if (props) {
        if (props instanceof Array) {
            props.forEach(function (propName) {
                propHandle(propName);
            })
        } else if (props instanceof Object) {
            Object.keys(props).forEach(function (propName) {
                propHandle(propName, props[propName]);
            })
        }

        if (watchProps.length) {
            //进行属性作用域数据获取
            watchProps.forEach(function (propConf) {
                var syntaxExample,
                    strcut = syntaxStruct(propConf.exp);

                //检查表达式是否错误
                if (!strcut.errMsg) {

                    //收集作用域
                    var scopes = [vnode.rootScope].concat(vnode.middleScope);
                    scopes.push(vnode.$scope);

                    syntaxExample = syntaxHandle(strcut, scopes, extraParameters.filter, true);

                    //记录到虚拟节点上，以便后续销毁使用
                    (vnode.data.syntaxExample=vnode.data.syntaxExample||[]).push(syntaxExample);

                    //监听当前语法
                    if(propConf.watch instanceof Function){
                        syntaxExample.readWatch(propConf.watch.bind($api))
                    }


                    //检查是否提供外部数据接口
                    if(propConf.isExports) {
                        $this.exports[propConf.key] = {
                            exp: propConf.exp,
                            ob: syntaxExample.structRes.observers[0]
                        };

                        renderTrigger();
                    }else{
                        //读取表达式返回的值
                        if (!syntaxExample.read(function (newData) {

                                $api.scope[propConf.key] = newData;

                                //获取当前值的watchKey
                                if(propConf.getWatchInfo instanceof Function){
                                    propConf.getWatchInfo(syntaxExample.getWatchInfo());
                                }

                                //检查是否自动渲染
                                if (propConf.autoRender) {
                                    //监听表达式返回的值
                                    syntaxExample.watch(function (newData) {
                                        $api.scope[propConf.key] = newData;

                                        //获取当前值的watchKey
                                        if(propConf.getWatchInfo instanceof Function){
                                            propConf.getWatchInfo(syntaxExample.getWatchInfo());
                                        }

                                        if (isRender){
                                            isRender = true;
                                            $this.render();
                                        }else{
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
                            if (propConf.hasOwnProperty('default') ) {
                                $api.scope[propConf.key] = propConf['default'];
                                renderTrigger();
                            }else if(propConf.isEmpty){
                                renderTrigger();
                            }
                        }
                    }

                } else {
                    console.warn($this.compName+'组件  表达式： ' + propConf.exp + '有误！')
                }

            })
        }else{
            isRender = true;
            this.render();
        }
    } else {
        isRender = true;
        this.render();
    }
    return this;
}

compClass.prototype.render = function () {
    var conf = this.conf,
        vnode = this.vnode,
        $api = this.$api;

    if(!this.isRender){

        //写入钩子
        if(conf.hook){
            var hooks=vnode.data.hook=vnode.data.hook||{};
            Object.keys(conf.hook).forEach(function (hookName) {
                //检查并创建
                hooks[hookName]=hooks[hookName]||[];
                hooks[hookName]=[].concat(hooks[hookName]);

                //合并
                hooks[hookName]=hooks[hookName].concat(function () {
                    conf.hook[hookName].apply($api,arguments);
                });

                vnode.data.hook=hooks;
            });

            if(typeof conf.hook.init === "function"){
                conf.hook.init.apply($api,vnode);
            }
        }
    }

    //检查是否有渲染的方法
    if (conf.render instanceof Function) {
        vnode.innerVnode = conf.render.call(this.$api, this.$api.vnode, this.$api.scope)||conf.template;
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

//组件获取
exports.get = function (compName) {
    return compStroage[compName];
}

//组件注册
exports.register = function (compName, compConf) {
    compStroage[compName] = function (vnode, extraParameters,vdomApi) {
        return new compClass(compConf, vnode, extraParameters,vdomApi,compName);
    };
}