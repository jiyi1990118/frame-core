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

        //检查父文档片段中是否含有指定的元素
        if(parentNode instanceof DocumentFragment){
            var i=~0,
                child,
                isChild,
                childNodes=[].slice.call(parentNode.childNodes),
                len=childNodes.length;

            while(++i<len){
                child=childNodes[i];
                if(child === referenceNode || child.contains(referenceNode)){
                    isChild=true;
                    break;
                }
            }
        }else{
            isChild=parentNode.contains(referenceNode)?true:false;
        }

        referenceNode=isChild?referenceNode:null;

        newNode instanceof Array ? newNode.forEach(function (child, key) {
            parentNode.insertBefore(child, referenceNode);
        }) : parentNode.insertBefore(newNode, referenceNode);
    },
    removeChild: function removeChild(node, child) {
        if (!node)return
        child instanceof Array ? child.forEach(function (child) {
            node.removeChild(child);
        }) : node.removeChild(child);
    },
    appendChild: function appendChild(node, child) {
        child instanceof Array ? child.forEach(function (child) {
            node.appendChild(child);
        }) : node.appendChild(child);
    },
    parentNode: function parentNode(node) {
        node=node instanceof Array ? parentNode(node[0]) : node
        return node?node.parentNode:null;
    },
    replaceChild: function (parentNode, newNode, oldNode) {
        var Rm;
        if (newNode instanceof Array) {
            var doc = document.createDocumentFragment();
            newNode.forEach(function (elm) {
                doc.appendChild(elm)
            })
            newNode = doc;
        }

        if (oldNode instanceof Array) {
            Rm = oldNode;
            oldNode = Rm.shift();
            Rm.forEach(function (elm) {
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

//调用销毁钩子
function invokeDestroyHook(vnode) {
    var i, j, data = vnode.data;

    if (isDef(data)) {
        //触发虚拟节点中的销毁钩子
        if (isDef(i = data.hook) && isDef(i = i.destroy)){
            [].concat(i).forEach(function (destroy) {
                destroy(vnode);
            })
        } ;
    }

    //触发model中的销毁钩子
    cbs.destroy.forEach(function (destroyHook) {
        destroyHook(vnode);
    });
}

//虚拟节点对象
function $vnode(conf) {
    var $this = this;

    this.data=this.data||{};

    //配置继承
    Object.keys(conf).forEach(function (key) {
        $this[key] = conf[key];
    })
}

//节点克隆
$vnode.prototype.clone = function () {

    var conf = {},
        scope = {},
        children = [],
        innerVnode = [],
        $this = this;

    var pros = ['$scope', 'children', 'elm', 'isShow', 'key', 'sel', 'tag', 'text', 'rootScope', 'isReplace', 'isComponent', 'isDirective', 'cid'];

    //收集所有的属性
    pros.forEach(function (key) {
        if ($this.hasOwnProperty(key)) {
            conf[key] = $this[key];
        }
    })

    if (this.innerVnode instanceof Array && this.innerVnode.length) {
        // if(this.isReplace)conf.isReplace=true;
        //遍历并克隆内部节点
        this.innerVnode.forEach(function (ch) {
            innerVnode.push(ch.clone())
        })
        conf.innerVnode = innerVnode;
    } else if (conf.elm instanceof Array) {
        conf.elm = undefined;
    }

    conf.data = function (data) {
        var tmp = {},
            attrsMap={};
        Object.keys(data).forEach(function (key) {
            switch (key){
                case 'attrsMap':
                    if(data[key] instanceof Object){
                        Object.keys(data[key]).forEach(function (attrName) {
                            attrsMap[attrName] =data[key][attrName]
                        })
                    }
                    tmp[key]=attrsMap;
                    break
                case 'on':
                    if(data[key] instanceof Object){
                        Object.keys(data[key]).forEach(function (eventName) {
                            var eventFn=data[key][eventName];
                            if(eventFn instanceof Array){
                                eventFn=[].concat(eventFn);
                            }
                            attrsMap[eventName] =eventFn;
                        })
                    }
                    tmp[key]=attrsMap;
                    break;
                default:
                    tmp[key] = data[key];
            }

        })
        return tmp;
    }($this.data);


    //检查是否文本 并克隆文本表达式
    if (isUndef(this.sel) && this.data && this.data.exps) {
        conf.data.exps = [];
        Object.keys(this.data.exps).forEach(function (key) {
            conf.data.exps[key] = $this.data.exps[key];
        })
    }

    //继承作用域
    Object.keys($this.$scope || {}).forEach(function (key) {
        scope[key] = $this.$scope[key];
    })
    conf.$scope = scope;

    //继承中间作用域
    conf.middleScope = this.middleScope.concat();

    if (this.children) {
        this.children.forEach(function (ch) {
            children.push(ch.clone())
        })
    }

    conf.children = children;
    conf.isClone = true;

    return new $vnode(conf);
}

//节点作用域传递
$vnode.prototype.scope = function (scope) {
    var $this = this;
    if (scope instanceof Object) {
        Object.keys(scope).forEach(function (key) {
            $this.$scope[key] = scope[key];
        })
    }
}

//给虚拟dom添加事件监听
$vnode.prototype.addEventListener=function (type,eventFn) {
    if(!this.data){
            console.log('-->>','元素销毁，需要销毁指令 相关绑定')
        return this;
    }
    //事件集合
    var events=this.data.on=this.data.on||{};
    //添加事件
    (events[type]=events[type]||[]).push(eventFn);

    //检查元素是否存在
    if(this.elm){
        //实时绑定
        this.elm.addEventListener(type,eventFn,false);
    }
    return this;
};

//移除虚拟dom事件监听
$vnode.prototype.removeListener=function (type,eventFn) {
    if(!this.data)return this;
    //事件集合
    var location,
        events=this.data.on;

    if(events && events[type]){
        if(events[type] instanceof Array){
            location= events[type].indexOf(eventFn);
            if(location !== -1){
                events[type].splice(location,1);
                //检查元素是否存在
                if(this.elm){
                    //实时绑定
                    this.elm.removeEventListener(type,eventFn,false);
                }
            }
        }else if(events[type] instanceof Function && events[type] === eventFn){
            delete events[type];
            //检查元素是否存在
            if(this.elm){
                //实时绑定
                this.elm.removeEventListener(type,eventFn,false);
            }
        }
    }
    return this;
};

//设置属性
$vnode.prototype.setAttr=function (attrName,val) {
    var element=this.elm,
        attrs=this.data.attrs=this.data.attrs||{};

    attrs[attrName]=val;
    if(element){
        switch (attrName){
            case 'class':
                this.addClass(val);
                break;
            case 'checked':
            case 'readonly':
            case 'disabled':
            case 'selected':
                element[attrName]=!!val;
                val ?element.setAttribute(attrName,attrName):element.removeAttribute(attrName);
                break;
            default:
                element.setAttribute(attrName,val);
        }
    }
    return val;
};

//获取属性
$vnode.prototype.getAttr=function (attrName) {
    return (this.data.attrs||{})[attrName];
};

//移除属性
$vnode.prototype.removeAttr=function (attrName) {
    var attrVal,
        element=this.elm,
        attrs=this.data.attrs;

    if(attrName === 'class'){
        this.removeClass();
    }

    if(!attrs)return;

    attrVal=attrs[attrName];
    delete attrs[attrName];

    if(element){
        delete element[attrName];
        attrVal=element.getAttribute(attrName);
    }
    element.removeAttribute(attrName);
    return attrVal;
};

//设置样式
$vnode.prototype.css=function (name,val) {
    var styleVal,
        element=this.elm,
        style=this.data.style=this.data.style||{};

    if(name instanceof Object){

        Object.keys(name).forEach(function (key) {
            var styleName=key.replace(/\-([a-z])/,function (str,$1) {
                return $1.toUpperCase();
            })
            style[styleName]=name[key];
            if(element){
                element.style[styleName]=name[key]
            }
        })

    }else if(val !== undefined){
        var styleName=name.replace(/\-([a-z])/,function (str,$1) {
            return $1.toUpperCase();
        });
        style[styleName]=val;
        if(element){
            element.style[styleName]=val
        }
    }
};

//添加class
$vnode.prototype.addClass=function () {
    var element=this.elm,
        classList=[],
        allClas=this.data['class']=this.data['class']={};

    //遍历所有参数
    [].slice.call(arguments).forEach(function (classVal) {
        if(typeof classVal === 'string'){
            classList=classList.concat(classVal.split(" "));
        }else{
            classList=classList.concat(classVal);
        }
    });

    //存入class相关数据
    classList.forEach(function (className) {
        allClas[className]=true;
    });

    if(element){
        element.classList.add.apply(element.classList,classList);
    }
};

//移除class
$vnode.prototype.removeClass=function () {
    var element=this.elm,
        classList=[],
        allClas=this.data['class']=this.data['class']||{};

    if(arguments.length === 0){
        Object.keys(allClas).forEach(function (key) {
            classList.push(key);
        })
        if(element){
            element.removeAttribute('class');
        }
    }else{
        //遍历所有参数
        [].slice.call(arguments).forEach(function (classVal) {
            if(typeof classVal === 'string'){
                classList=classList.concat(classVal.split(" "));
            }else{
                classList=classList.concat(classVal);
            }
        });
    }

    classList.forEach(function (key) {
        delete allClas[key];
        if(element){
            element.classList.remove(key)
        }
    })

};

//切换class
$vnode.prototype.toggleClass=function (className) {
    var element=this.elm,
        classList=[],
        allClas=this.data['class']=this.data['class']||{};

    //遍历所有参数
    [].slice.call(arguments).forEach(function (classVal) {
        if(typeof classVal === 'string'){
            classList=classList.concat(classVal.split(" "));
        }else{
            classList=classList.concat(classVal);
        }
    });

    classList.forEach(function (key) {
        if(allClas[key]){
            delete allClas[key];
            if(element){
                element.classList.remove(key);
            }
        }else{
            allClas[key]=true;
            if(element){
                element.classList.add(key);
            }
        }
    })

    if(Object.keys(allClas).length === 0 && element){
        element.removeAttribute('class');
    }
};

//展示
$vnode.prototype.show=function () {
    if(!this.isShow){
        this.isShow=true;
        this.parentVnode.updateChildrenShow()
    }
};

//隐藏
$vnode.prototype.hide=function () {
    if(this.isShow){
        this.isShow=false;
        this.parentVnode.updateChildrenShow()
    }
};

//展示/隐藏切换
$vnode.prototype.toggle=function (className) {
    this.isShow?this.hide():this.show();
};

//更新子元素是否展示
$vnode.prototype.updateChildrenShow=function () {

    var elm,
        children,
        isInner=this.elm instanceof Array && this.elm;

    if(this.elm instanceof Array){
        elm=this.elm[0].parentNode;
        children=this.innerVnode;
    }else{
        elm=this.elm;
        children=this.children;
    }

    //遍历检查子元素显示状态
    children.forEach(function (ch,index) {
        //子元素占位
        var location=children.indexOf(ch);
        //是否展示
        if(ch.isShow ){

            if(ch.elm instanceof Array){
                ch.elm.forEach(function (_elm,_i) {
                    isInner && isInner.splice(location+_i-1,0,_elm)
                    htmlDomApi.insertBefore(elm,_elm,children[index+1] ? children[index+1].elm:null)
                })
            }else if(!elm.contains(ch.elm)){
                isInner && isInner.splice(location,0,ch.elm)
                htmlDomApi.insertBefore(elm,ch.elm,children[index+1] ? children[index+1].elm:null)
            }

        }else{

            //移除子元素 elm 元素集合
            isInner && isInner.splice(location,[].concat(ch.elm).length)

            if(ch.elm instanceof Array){
                ch.elm.forEach(function (celm) {
                    if(elm.contains(celm)){
                        htmlDomApi.removeChild(elm,celm);
                    }
                })
                
            }else{
                if(elm.contains(ch.elm)){
                    htmlDomApi.removeChild(elm,ch.elm);
                }
            }
        }
    })

}

//将观察的数据转换成作用域
$vnode.prototype.observerToScope = function (watchData, watchKey, scopeKey) {
    var $this = this,
        ob = observer(watchData);
    ob.readWatch(watchKey, function (data) {
        $this.$scope[scopeKey] = data;
    });
    return ob;
}

//节点销毁
$vnode.prototype.destroy = function (type) {
    var $this = this;

    if(!this.hasOwnProperty('sel'))return;

    //检查是否文本
    if (isUndef(this.sel) && this.data && this.data.exps) {
        switch (type) {
            case 'elm':
            case false:
                break;
            default:
                Object.keys(this.data.exps).forEach(function (key) {
                    if ($this.data.exps[key] instanceof Object) {
                        $this.data.exps[key].destroy();
                    }
                    delete $this.data.exps[key];
                });

                //销毁文本表达式
                (this.data.exps || []).forEach(function (exp, index) {
                    if (exp.structRes) {
                        exp.destroy();
                    }
                    delete $this.data.exps[index];
                });
        };

    }

    if (this.elm) {
        //调用销毁钩子
        invokeDestroyHook(this)
        if (this.elm instanceof Array) {
            switch (type) {
                case false:
                    break;
                case 'elm':
                default:
                    (this.innerVnode || []).forEach(function (vnode, index) {
                        if (type !== 'elm') $this.elm.splice(0,1);
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
                        this.children.forEach(function (ch, index) {
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

    //检查节点上的语法表达式
    this.isClone || (this.data.syntaxExample||[]).forEach(function (syntaxExample) {
        var structRes=syntaxExample.structRes;

        //销毁语法上的监听
        structRes.observers.forEach(function (obs) {
            obs.destroy();
        });

    });

    Object.keys(this.$scope || {}).forEach(function (key) {
        delete $this.$scope[key];
    })

    Object.keys(this.data || {}).forEach(function (key) {
        delete $this.data[key];
    })

    Object.keys(this).forEach(function (key) {
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
        parentVnode:null,
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
    var i, map = {}, key, ch;
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
    if(oldVnode.elm !== newVnode.elm){
        //触发队列中的insert钩子
        [newVnode].forEach(function (ivq) {
            ivq.data.hook.insert(ivq);
        });
    }
}

//重新摆放列表元素
function rearrangeElm(vnodeList) {
    var parentNode,
        nowEle,
        elmContainer = document.createDocumentFragment();

    vnodeList.forEach(function (vnode) {
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
    exps.forEach(function (exp, index) {
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
    hooks.forEach(function (hookName) {
        cbs[hookName] = [];
        modules.forEach(function (module) {
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
                    containerElm.innerVnode.forEach(function (vnode) {
                        containerElm.elm = containerElm.elm.concat(vnode.elm);
                    })
                }
            }
        };
    }

    //根据虚拟节点创建真实dom节点
    function createElm(vnode, insertedVnodeQueue, callback, extraParameters, parentNode) {
        var i,
            ivq,
            isRearrange,
            oldVnode,
            rootScope,
            innerFilter,
            data = vnode.data || {},
            initCount = cbs.init.length,
            children = vnode.children, sel = vnode.sel;

        if (innerFilter = vnode.innerFilter) {
            Object.keys(extraParameters.filter).forEach(function (key) {
                innerFilter[key] = extraParameters.filter[key];
            })
            extraParameters.filter=innerFilter;
        } else {
            innerFilter = extraParameters.filter;
        }

        //传递父节点
        if(parentNode)vnode.parentVnode=parentNode;

        //检查并传递作用域
        if (parentNode) {
            if (innerFilter = parentNode.innerFilter) {
                Object.keys(extraParameters.filter).forEach(function (key) {
                    innerFilter[key] = extraParameters.filter[key];
                })
            } else {
                innerFilter = extraParameters.filter;
            }

            //检查是否完全独立 （主要兼容 template 在组件内部 this.render方式）
            if(vnode.rootScope === vnode.innerScope){
                rootScope = vnode.rootScope;
            }else
            //检查是否独立作用域
            if(parentNode.innerScope) {
                rootScope = parentNode.innerScope;
                extraParameters.scope=rootScope;
                extraParameters.filter=innerFilter;
            }  else {
                rootScope = parentNode.rootScope;
                //由父节点传递作用域给子级
                if (parentNode instanceof Object ) {
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
            if (initCount && --initCount)return;

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
                            patch(oldVnode, vnode, {
                                scope:rootScope,
                                filter:extraParameters.filter
                            },  parentNode);

                            //销毁对象但不销毁元素
                            oldVnode.destroy('elm');
                            oldVnode = vnode.clone();
                            return;
                        } else{

                            vnode.elm = [];
                            vnode.innerVnode.forEach(function (ch) {

                                //重新定位内部作用域
                                if(!ch.innerScope && !vnode.innerScope && vnode.isComponent){
                                    ch.innerScope=ch.$scope
                                }

                                createElm(ch, insertedVnodeQueue, function (ch, isRearrange) {

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

                    //检查是否同一个元素
                    if(oldVnode && vnode.elm === oldVnode.elm)return;

                    //创建实体Dom元素
                    var elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, vnode.tag)
                        : api.createElement(vnode.tag);

                    if (vnode.id) elm.id = vnode.id;
                    if (vnode.className) elm.className = vnode.className;

                    //触发model中的create 钩子
                    cbs.create.forEach(function (createHook) {
                        createHook(emptyNode, vnode)
                    })

                    //检查子元素 并递归创建子元素真实Dom
                    if (isArray(children)) {
                        children.forEach(function (ch) {
                            if (ch instanceof Object) {

                                //收集作用域
                                vnode.middleScope.length && (ch.middleScope = ch.middleScope.concat(vnode.middleScope));
                                Object.keys(vnode.$scope).length && ch.middleScope.push(vnode.$scope);

                                var oldVnode;
                                createElm(ch, insertedVnodeQueue, function (ch, isRearrange) {

                                    if (isRearrange) {
                                        rearrangePatch(ch, oldVnode, vnode.elm);
                                    } else {
                                        api.appendChild(elm, ch.elm);
                                        //销毁旧节点
                                        oldVnode && oldVnode.destroy();
                                    }
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

                        exps.forEach(function (exp, index) {
                            if (exp instanceof Object) {
                                //收集作用域
                                var scopes = [vnode.rootScope].concat(vnode.middleScope);
                                scopes.push(vnode.$scope);

                                //表达式监听
                                (exps[index] = syntaxHandle(exp, scopes, extraParameters.filter, true)).readWatch(function (data) {
                                    //检查文本是否以存在 则重新合并文本内容
                                    if (text !== undefined) {
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

            if ( isDef(i)) {
                //检查并触发create类型钩子
                if (i.create) {
                    ;[].concat(i.create).forEach(function (create) {
                        create(emptyNode, vnode);
                    })
                }
            }

            //返回当前节点数据
            callback(vnode, isRearrange);

            if(extraParameters.isload){

                //收集延后的节点
                var delayedInsertedVnodeQueue=[]
                //触发队列中的insert钩子
                while (ivq=insertedVnodeQueue.shift()){
                    if(ivq.elm.parentNode){
                        ivq.data && ivq.data.hook && ivq.data.hook.insert && [].concat(ivq.data.hook.insert).forEach(function (insert) {
                            insert(ivq);
                        })
                    }else{
                        delayedInsertedVnodeQueue.push(ivq)
                    }
                }

                delayedInsertedVnodeQueue.forEach(function (ivq) {
                    insertedVnodeQueue.push(ivq);
                })

            }

            //收集并存储插入类型钩子
            insertedVnodeQueue.push(vnode);

            //销毁旧节点
            // oldVnode && oldVnode.destroy();

            //节点备份
            oldVnode = vnode.clone();

            //标识父元素重新排列子元素
            isRearrange = true;
        }

        //获取并执行 虚拟节点中的初始化钩子
        if (isDef(data) && isDef(i = data.hook) && isDef(i = i.init)) {
            initCount++;
            [].concat(i).forEach(function (init) {
                init(vnode, initCreate, extraParameters);
            })
        } else if (!initCount) {
            initCreate()
        }

        //触发model中的create 钩子
        cbs.init.forEach(function (initHook) {
            initHook(vnode, initCreate, extraParameters, parentNode)
        })
    }

    //创建新的虚拟节点
    function addVnodes(parentVnode, before, vnodes, startIdx, endIdx, insertedVnodeQueue, extraParameters, containerElm) {
        var parentElm = parentVnode.elm;

        //遍历并创建节点
        vnodes.slice(startIdx, endIdx + 1).forEach(function (ch) {
            if (ch instanceof Object) {
                var oldVnode;
                createElm(ch, insertedVnodeQueue, function (ch, isRearrange) {
                    if (isRearrange) {
                        rearrangePatch(ch, oldVnode, parentElm);
                    } else {
                        api.appendChild(parentElm, ch.elm, before);
                    }
                    oldVnode = ch.clone();

                    //检查是否是innerVnode容器
                    if (containerElm) {
                        containerElm.elm = []
                        containerElm.innerVnode.forEach(function (vnode) {
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
            containerElm.innerVnode.forEach(function (vnode) {
                containerElm.elm = containerElm.elm.concat(vnode.elm);
            })
        }
    }

    //删除虚拟节点
    function removeVnodes(parentElm, vnodes, startIdx, endIdx, containerElm) {

        for (; startIdx <= endIdx; ++startIdx) {
            var i_1 = void 0, listeners = void 0, rm = void 0, ch = vnodes[startIdx];

            if (ch instanceof Object) {
                if (isDef(ch.sel)) {

                    //监听并删除元素
                    listeners = cbs.remove.length + 1;
                    rm = createRmCb(ch, listeners, containerElm);

                    //遍历并触发model中的remove钩子
                    cbs.remove.forEach(function (removeHook) {
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
            containerElm.innerVnode.forEach(function (vnode) {
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
        var oldStartIdx = 0, newStartIdx = 0;
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
            console.log(newCh, oldCh,parentVnode)
            if (!oldStartVnode) {
                oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
            }
            else if (!oldEndVnode) {
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
                    (function (newStartVnode) {
                        var oldVnode;
                        createElm(newStartVnode, insertedVnodeQueue, function (ch, isRearrange) {
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
                        (function (newStartVnode) {
                            var oldVnode;
                            createElm(newStartVnode, insertedVnodeQueue, function (ch, isRearrange) {
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
        if (oldEndIdx === newEndIdx)return;

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
        if (oldVnode === vnode)return;

        if (isDef(vnode.data)) {
            //触发model中的update钩子
            cbs.update.forEach(function (updateHook) {
                updateHook(oldVnode, vnode);
            })
            i = vnode.data.hook;

            //触发节点中的update钩子
            if (isDef(i) && isDef(i = i.update)){
                [].concat(i).forEach(function (update) {
                    update(oldVnode, vnode);
                })
            };
        }

        //检查节点中的文本
        if (isUndef(vnode.text)) {

            //检查元素节点是否组件 则重新渲染元素
            if (vnode.isComponent && vnode.isClone) {
                //清空元素
                vnode.elm = undefined;
                createElm(vnode, insertedVnodeQueue, function (ch, isRearrange) {
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
                exps.forEach(function (exp, index) {
                    if (exp instanceof Object) {
                        //收集作用域
                        var scopes = [vnode.rootScope].concat(vnode.middleScope);
                        scopes.push(vnode.$scope);
                        //表达式监听
                        (exps[index] = syntaxHandle(exp, scopes, extraParameters.filter, true)).readWatch(function (data) {
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

        var i, elm, parent, nextElm,ivq;
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
                parentVnode = parentVnode || {elm: parent};
                //更新子节点
                updateChildren(parentVnode, oldVnode, Vnode, insertedVnodeQueue, extraParameters);
                //移除旧元素
                // removeVnodes(parent, [oldVnode], 0, 0);
            } else {
                Vnode.elm = [];
                Vnode.innerVnode.forEach(function (ch) {
                    createElm(ch, insertedVnodeQueue, function (ch, isRearrange) {
                        Vnode.elm = Vnode.elm.concat(ch.elm)
                    }, extraParameters, Vnode)

                })
            }

            //常规情况
        } else {

            if (Vnode instanceof Array) {

                var containerVnode=Vnode,
                    tmpNode,
                    tmpParent=parent;

                //创建新节点
                Vnode.forEach(function (Vnode) {

                    var oldVnode,
                        nowParentNode;
                    //创建新节点
                    createElm(Vnode, insertedVnodeQueue, function (ch, isRearrange) {

                        if (isRearrange) {
                            rearrangePatch(ch, oldVnode, oldVnode.elm.parentNode);
                        } else {
                            //新增节点到父元素容器中
                            var location=containerVnode.indexOf(ch);

                            if(tmpNode){
                                if(tmpNode instanceof Array){
                                    tmpParent=tmpNode[0].parentNode;
                                }else{
                                    tmpParent=tmpNode.parentNode;
                                }
                            }else{
                                tmpParent=parent;
                            }

                            api.insertBefore(nowParentNode=tmpParent||parent, ch.elm, containerVnode[location+1]?containerVnode[location+1].elm:null);
                        }
                        oldVnode = ch.clone();
                        tmpNode=ch.elm;
                    }, extraParameters);
                })

                if (oldVnode && parent !== null) {
                    //移除旧元素
                    removeVnodes(parent, [oldVnode], 0, 0);
                }

            } else {
                if (!(Vnode instanceof Object))return oldVnode;

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
                        Object.keys(scope).forEach(function (key) {
                            Vnode.$scope[key] = scope[key];
                        })
                    } else {
                        Vnode.rootScope = scope;
                    }
                    //节点修补
                    patchVnode(oldVnode, Vnode, insertedVnodeQueue, extraParameters);
                } else {

                    //创建新节点
                    createElm(Vnode, insertedVnodeQueue, function (ch, isRearrange) {
                        var _oldVnode;
                        if (parent !== null) {
                            if (isRearrange) {
                                rearrangePatch(ch, _oldVnode, parent);
                                if(oldVnode.elm !== ch.elm){
                                    //触发队列中的insert钩子
                                    [ch].forEach(function (ivq) {
                                        ivq.data.hook.insert(ivq);
                                    });
                                }
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
        cbs.post.forEach(function (postHook) {
            postHook();
        });

        //检查是否有回调
        if (callback instanceof Function) callback(parent, function (newParent) {
            parent = newParent
        });

        //触发队列中的insert钩子
        while (ivq=insertedVnodeQueue.shift()){
            ivq.data && ivq.data.hook && ivq.data.hook.insert && [].concat(ivq.data.hook.insert).forEach(function (insert) {
                insert(ivq);
            })
        }
        extraParameters.isload=true;
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
        "truespeed", "typemustmatch", "visible"];
    var booleanAttrsDict = Object.create(null);
    for (var i = 0, len = booleanAttrs.length; i < len; i++) {
        booleanAttrsDict[booleanAttrs[i]] = true;
    }
    function updateAttrs(oldVnode, vnode) {
        var key, cur, old, elm = vnode.elm, oldAttrs = oldVnode.data.attrs, attrs = vnode.data.attrs,
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

    return {create: updateAttrs, update: updateAttrs};
}

/**
 * class插件
 * @returns {{create: updateClass, update: updateClass}}
 */
function classModule() {
    function updateClass(oldVnode, vnode) {
        var cur, name, elm = vnode.elm, oldClass = oldVnode.data["class"], klass = vnode.data["class"];
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

    return {create: updateClass, update: updateClass};
}


/**
 * 附加属性插件
 * @returns {{create: updateProps, update: updateProps}}
 */
function propsModule() {
    function updateProps(oldVnode, vnode) {
        var key, cur, old, elm = vnode.elm, oldProps = oldVnode.data.props, props = vnode.data.props;
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

    return {create: updateProps, update: updateProps};
}

/**
 * 样式插件
 * @returns {{create: updateStyle, update: updateStyle, destroy: applyDestroyStyle, remove: applyRemoveStyle}}
 */
function styleModule() {
    var raf = (typeof window !== 'undefined' && window.requestAnimationFrame) || setTimeout;
    var nextFrame = function (fn) {
        raf(function () {
            raf(fn);
        });
    };

    function setNextFrame(obj, prop, val) {
        nextFrame(function () {
            obj[prop] = val;
        });
    }

    function updateStyle(oldVnode, vnode) {
        var cur, name, elm = vnode.elm, oldStyle = oldVnode.data.style, style = vnode.data.style;
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
                }
                else {
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
            }
            else if (name !== 'remove' && cur !== oldStyle[name]) {
                if (name[0] === '-' && name[1] === '-') {
                    elm.style.setProperty(name, cur);
                }
                else {
                    elm.style[name] = cur;
                }
            }
        }
    }

    function applyDestroyStyle(vnode) {
        var style, name, elm = vnode.elm, s = vnode.data.style;
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
        var name, elm = vnode.elm, i = 0, compStyle, style = s.remove, amount = 0, applied = [];
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
        elm.addEventListener('transitionend', function (ev) {
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
        var elm = (vnode && vnode.elm),
            oldElm = oldVnode.elm,
            on = vnode && vnode.data.on,
            oldOn = oldVnode.data.on;

        if(on === oldOn)return;

        if (!oldOn) {
            //遍历所有事件类型
            Object.keys(on||{}).forEach(function (eventName) {
                [].concat(on[eventName]).forEach(function (fn) {
                    elm.addEventListener(eventName, fn, false);
                });
            });
        } else {
            on=on||{};
            Object.keys(oldOn).forEach(function (eventName) {
                var onEvents=on[eventName]?[].concat(on[eventName]):[];
                [].concat(oldOn[eventName]).forEach(function (fn) {
                    if(onEvents.indexOf(fn) === -1)oldElm.removeEventListener(eventName, fn, false);
                });
            })
        }
    }

    return {
        create: updateEventListeners,
        update: updateEventListeners,
        destroy: updateEventListeners
    };
}

var compManage = require('./componentManage');
var directorieManage = require('./directiveManage');

//组件与指令检查
function compAndDirectiveInspect() {

    function inspectInit(vnode, initCall, extraParameters, parentNode) {

        var compExample,
            isInitCall,
            isLayoutElm,
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
                    compExample.watchCreate(function () {
                        exapmpleQueueHandle();
                    })
                    compExample.init();
                } else {
                    //检查是替换
                    if(handleExampleQueue.length || compExample.conf.isReplace){
                        exapmpleQueueHandle();
                    }
                    compExample.init();
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
            compExample.watchRender(function () {
                initCall();
                isInitCall = true;
            })
        } else {
            isInitCall = true;
        }

        //指令检查
        Object.keys(attrsMap).forEach(function (attrName) {
            var directorieExample,
                directorieClass = directorieManage.get(attrName);

            //检查是否是指令
            if (directorieClass) {

                //检查是否多个不同类型同名称的指令
                [].concat(attrsMap[attrName]).forEach(function (expInfo) {

                    directorieExample = directorieClass(vnode, expInfo,extraParameters,module.exports);
                    //存入实例队列
                    handleExampleQueue.push(directorieExample);
                    //观察指令渲染
                    directorieExample.watchRender(function () {
                        if (isInitCall) initCall();
                    })
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
            handleExampleQueue = handleExampleQueue.sort(function (before, after) {
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
    cbs:cbs,
    isVnode: isVnode,
    domApi: htmlDomApi,
    node2vnode: emptyNodeAt
};
