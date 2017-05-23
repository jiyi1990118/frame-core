/**
 * Created by xiyuan on 17-5-11.
 */


//语法解析
var syntaxStruct = require('./syntaxStruct');

//语法结构处理
var syntaxHandle = require('./syntaxHandle');

var compStroage = {};

//组件类
function compClass(compConf, vnode, extraParameters) {
    //标识当前节点是组件
    vnode.isComponent = true;

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

    this.$api={
        //作用域
        scope:{

        },
        //过滤器
        filter:{

        },
        //虚拟节点
        vnode:vnode,
        //节点渲染
        render:function () {

        },
        stroage:{

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
        $this=this,
        $api=this.$api,
        conf = this.conf,
        vnode = this.vnode,
        data = vnode.data,
        propLoad=0,
        attrsMap = data.attrsMap,
        props = conf.props,
        watchProps = [],
        extraParameters = this.extraParameter;

    //处理观察的属性
    function propHandle(propName, prop) {

        if(!attrsMap[propName]){
            return console.warn('组件数据属性 '+propName+' 未定义!');
        }

        if (prop instanceof Function) {
            prop = prop.call(this, attrsMap[propName].value)
            prop.key = prop.key || propName;
            watchProps = watchProps.concat(prop)

        } else if (prop instanceof Object) {
            prop.key = prop.key || propName;
            prop.exp = prop.exp || attrsMap[propName].value;
            watchProps.push(prop);

        } else {
            watchProps.push({
                key: propName,
                exp: attrsMap[propName].value
            })
        }
    }
    
    function renderTrigger() {
        if(watchProps.length <= ++propLoad){
            isRender=true;
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
                    strcut=syntaxStruct(propConf.exp);

                //检查表达式是否错误
                if(!strcut.errMsg){
                    syntaxExample=syntaxHandle(strcut,extraParameters.assign,extraParameters.filter);

                    //读取表达式返回的值
                    if(!syntaxExample.read(function (newData) {
                            $api.scope[propConf.key]=newData;
                        //检查是否自动渲染
                        if(propConf.autoRender){
                            //监听表达式返回的值
                            syntaxExample.watch(function (newData) {
                                $api.scope[propConf.key]=newData;
                                if(isRender)$this.render();
                            })
                        }

                        //检查是否有默认数据 并渲染
                        if(propConf.hasOwnProperty('default')){
                            if(isRender)$this.render();
                        }else{
                            renderTrigger();
                        }

                    })){
                        //检查是否有默认数据
                        if(propConf.hasOwnProperty('default')){
                            $api.scope[propConf.key]=propConf['default'];
                            renderTrigger();
                        }
                    }

                    // console.log(propConf,strcut,syntaxExample)
                }else{
                    console.warn('表达式： '+propConf.exp+'有误！')
                }

            })
            return this;
        }
    } else {
        isRender=true;
        this.render();
    }

}

compClass.prototype.render = function () {
    var conf = this.conf,
        vnode=this.vnode;

    //检查是否有渲染的方法
    if (conf.render instanceof Function) {
        vnode.innerVnode=conf.render.call(this.$api, this.$api.vnode, this.$api.scope);
    }else if(conf.template){

        if(conf.isReplace || conf.isReplace === undefined){
            conf.isReplace=true;
            vnode.innerVnode=conf.template;
        }else{

        }
    }

    //标识当前节点是否替换
    vnode.isReplace=conf.isReplace;

    //触发创建的观察
    if(!this.isRender){
        this.watchs.create.forEach(function (create) {
            create();
        })
    }

    //触发渲染的观察
    this.watchs.render.forEach(function (render) {
        render();
    })

    this.isRender=true;
}

//组件获取
exports.get = function (compName) {
    return compStroage[compName];
}

//组件注册
exports.register = function (compName, compConf) {
    compStroage[compName] = function (vnode, extraParameters) {
        return new compClass(compConf, vnode, extraParameters);
    };
}