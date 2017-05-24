/**
 * 虚拟Dom
 * Created by xiyuan on 17-5-9.
 */
// "use strict";

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
        referenceNode=referenceNode instanceof Array? referenceNode[0]:referenceNode;
        newNode instanceof Array ? newNode.forEach(function (child, key) {
            parentNode.insertBefore(child, referenceNode);
        }) : parentNode.insertBefore(newNode, referenceNode);
    },
    removeChild: function removeChild(node, child) {
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
        return node.parentNode;
    },
    nextSibling: function nextSibling(node) {
        return node.nextSibling;
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


//对象深度继承
function objectclone(obj) {
    var newObj;

    if (obj instanceof Array) {
        newObj = []
    } else if (obj instanceof Object) {
        newObj = {}
    }

    if (newObj) {
        Object.keys(obj).forEach(function (key) {
            newObj[key] = objectclone(obj[key])
        })
    } else {
        newObj = obj;
    }
    obj=undefined;
    return newObj;
}

//虚拟节点对象
function $vnode(conf) {
    var $this = this;

    //配置继承
    Object.keys(conf).forEach(function (key) {
        $this[key] = conf[key];
    })
}

//节点克隆
$vnode.prototype.clone = function () {
    var conf = {},
        scope = {},
        children=[],
        innerVnode=[],
        $this = this;

    var pros=['$scope','children','elm','isShow','key','sel','tag','text','rootScope'];

    //收集所有的属性
    pros.forEach(function (key) {
        if($this.hasOwnProperty(key)){
            conf[key] = $this[key];
        }
    })

    if(this.innerVnode instanceof Array && this.innerVnode.length){
        // if(this.isReplace)conf.isReplace=true;
        //遍历并克隆内部节点
        this.innerVnode.forEach(function (ch) {
            innerVnode.push(ch.clone())
        })
        conf.innerVnode=innerVnode;
    }else if(conf.elm instanceof Array){
        conf.elm=undefined;
    }

    conf.data = function (data) {
        var tmp={};
        Object.keys(data).forEach(function (key) {
            tmp[key]=data[key];
        })
        return tmp;
    }($this.data);


    //检查是否文本 并克隆文本表达式
    if(isUndef(this.sel) && this.data && this.data.exps){
        conf.data.exps=[];
        Object.keys(this.data.exps).forEach(function (key) {
            conf.data.exps[key]=$this.data.exps[key];
        })
    }

    //继承作用域
    Object.keys($this.$scope||{}).forEach(function (key) {
        scope[key] = $this.$scope[key];
    })
    conf.$scope = scope;

    if(this.children){
        this.children.forEach(function (ch) {
            children.push(ch.clone())
        })
    }

    conf.children=children;
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

//将观察的数据转换成作用域
$vnode.prototype.observerToScope=function (watchData,watchKey,scopeKey) {
    var $this = this,
    ob=observer(watchData);
    ob.readWatch(watchKey,function (data) {
        $this.$scope[scopeKey] = data;
    });
    return ob;
}

//节点销毁
$vnode.prototype.destroy=function (type) {
    var $this = this;

    //检查是否文本
    if(isUndef(this.sel) && this.data && this.data.exps){
        switch (type){
            case 'elm':
                break;
            default:
                Object.keys(this.data.exps).forEach(function (key) {
                    if($this.data.exps[key] instanceof Object){
                        $this.data.exps[key].destroy();
                    }
                    delete $this.data.exps[key];
                })
        }
    }

    if(this.elm){
        if(this.elm instanceof Array){
            this.innerVnode.forEach(function (vnode,index) {
                delete $this.elm[index];
                delete $this.innerVnode[index];
                vnode.destroy(type);
            })

        }else if(this.elm.parentNode){
            //销毁子节点
            if(this.children){
                this.children.forEach(function (ch,index) {
                    delete $this.children[index];
                    ch.destroy(type);
                })
            }

            switch (type){
                case 'elm':
                    break;
                default:
                    htmlDomApi.removeChild(this.elm.parentNode,this.elm);
            }
        }
    }

    if(type !=='elm'){
        Object.keys(this.$scope||{}).forEach(function (key) {
            delete $this.$scope[key];
        })
    }

    Object.keys(this.data||{}).forEach(function (key) {
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
        rootScope:{},
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
    return vnode.sel !== undefined;
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
 */
function rearrangePatch(newVnode,oldVnode,parentElm) {
    htmlDomApi.insertBefore(parentElm,newVnode.elm,oldVnode.elm);
    oldVnode.destroy();
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

function init(modules) {
    var i, j, cbs = {};
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
    function createRmCb(ch, listeners) {
        return function rmCb() {
            if (--listeners === 0) {
                ch.destroy();
            }
        };
    }

    //根据虚拟节点创建真实dom节点
    function createElm(vnode, insertedVnodeQueue, callback, extraParameters,parentScope) {
        var i,
            isRearrange,
            oldVnode,
            data = vnode.data || {},
            initCount = cbs.init.length,
            children = vnode.children, sel = vnode.sel;

        //检查并传递作用域
        if(Object.keys(vnode.rootScope).length && extraParameters.scope !== vnode.rootScope){
            Object.keys(extraParameters.scope).forEach(function (key) {
                vnode.$scope[key]=extraParameters.scope[key];
            })
        }else{
            vnode.rootScope=extraParameters.scope;
        }

        //由父节点传递作用域给子级
        if(parentScope instanceof Object){
            Object.keys(parentScope).forEach(function (key) {
                vnode.$scope[key]=parentScope[key];
            })
        }

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

            if (initCount && --initCount)return

            //检查当前元素是否替换成innerVnode
            if (vnode.isReplace) {
                switch (true) {
                    case typeof vnode.innerVnode === 'string':
                        vnode.innerVnode = module.exports.html2vdom(vnode.innerVnode);
                    case vnode.innerVnode instanceof Array:
                    case vnode.innerVnode instanceof Object:
                        if (!(vnode.innerVnode instanceof Array)) {
                            vnode.innerVnode = [vnode.innerVnode];
                        }

                        //检查节点是否被渲染，此处需要做元素对比
                        if(vnode.elm && vnode.elm.length){
                            patch(oldVnode,vnode,vnode.rootScope);
                            //销毁对象但不销毁元素
                            oldVnode.destroy('elm');
                            oldVnode=vnode.clone();
                            console.log(vnode,'????')
                            return
                        }else{
                            vnode.elm = [];
                            vnode.innerVnode.forEach(function (ch) {

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
                                }, extraParameters)

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
                                var oldVnode;
                                createElm(ch, insertedVnodeQueue, function (ch, isRearrange) {
                                    if (isRearrange) {
                                        // console.log(velm,'??????????????//',ch,oldVnode,vnode)
                                        rearrangePatch(ch,oldVnode,vnode.elm);
                                    } else {
                                        api.appendChild(elm, ch.elm);
                                    }
                                    oldVnode = ch.clone();
                                }, extraParameters,vnode.$scope);
                            } else {
                                api.appendChild(elm, api.createTextNode(ch));
                            }
                        })
                    } else if (primitive(vnode.text)) {
                        api.appendChild(elm, api.createTextNode(vnode.text));
                    }
                } else {
                    //文本节点
                    vnode.elm = api.createTextNode(vnode.text);

                    var scope={};
                    Object.keys(vnode.rootScope).forEach(function (key) {
                        scope[key]=vnode.rootScope[key];
                    });
                    Object.keys(vnode.$scope).forEach(function (key) {
                        scope[key]=vnode.$scope[key];
                    });


                    //字符串内容表达式检查
                    if(vnode.data && vnode.data.exps){
                        var exps=vnode.data.exps;
                        exps.forEach(function (exp,index) {
                            if(exp instanceof Object){
                                ;(exps[index]=syntaxHandle(exp,[vnode.rootScope,vnode.$scope],{},true)).readWatch(function (data) {
                                    console.log('this is text ',data,vnode.$scope)
                                })
                            }
                        })

                        // console.log(vnode,parentScope,'>>>>>>>>>>',scope)
                    }
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

            //销毁旧节点
            oldVnode && oldVnode.destroy();
            //节点备份
            oldVnode=vnode.clone();

            //返回当前节点数据
            callback(vnode, isRearrange);

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
        cbs.init.forEach(function (initHook) {
            initHook(vnode, initCreate, extraParameters)
        })
    }

    //创建新的虚拟节点
    function addVnodes(parentVnode, before, vnodes, startIdx, endIdx, insertedVnodeQueue, extraParameters) {
        var parentElm = parentVnode.elm;

        vnodes.slice(startIdx,endIdx+1).forEach(function (ch) {
            if (ch instanceof Object) {
                var oldVnode;
                createElm(ch, insertedVnodeQueue, function (ch, isRearrange) {
                    if (isRearrange) {
                        rearrangePatch(ch,oldVnode,parentElm);
                    } else {
                        api.appendChild(parentElm, ch.elm, before);
                    }
                    oldVnode = ch.clone();
                }, extraParameters,parentVnode.$scope);
            } else {
                api.appendChild(parentElm, api.createTextNode(vnode.text), before);
            }
        })
    }

    //调用销毁钩子
    function invokeDestroyHook(vnode) {
        var i, j, data = vnode.data;

        if (isDef(data)) {

            //触发虚拟节点中的销毁钩子
            if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode);

            //触发model中的销毁钩子
            cbs.destroy.forEach(function (destroyHook) {
                destroyHook(vnode);
            })

            if (isDef(vnode.children)) {
                //触发子元素的销毁钩子
                vnode.children.forEach(function (children) {
                    if (children instanceof Object) {
                        invokeDestroyHook(children);
                    }
                })
            }

        }
    }

    //删除虚拟节点
    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {

        for (; startIdx <= endIdx; ++startIdx) {
            var i_1 = void 0, listeners = void 0, rm = void 0, ch = vnodes[startIdx];

            if (ch instanceof Object) {
                if (isDef(ch.sel)) {
                    //调用销毁钩子
                    invokeDestroyHook(ch);

                    //监听并删除元素
                    listeners = cbs.remove.length + 1;
                    rm = createRmCb(ch, listeners);

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
    }

    //更新子元素
    function updateChildren(parentVnode, oldCh, newCh, insertedVnodeQueue, extraParameters) {
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
                patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, extraParameters);
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            } else if (sameVnode(oldEndVnode, newEndVnode)) {
                patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, extraParameters);
                oldEndVnode = oldCh[--oldEndIdx];
                newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldStartVnode, newEndVnode)) {
                patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, extraParameters);
                api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
                oldStartVnode = oldCh[++oldStartIdx];
                newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldEndVnode, newStartVnode)) {
                patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, extraParameters);
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
                                rearrangePatch(ch,oldVnode,parentElm);
                            } else {
                                api.insertBefore(parentElm, ch.elm, oldStartVnode.elm);
                            }
                            oldVnode=ch.clone();
                        }, extraParameters,parentVnode.$scope);
                    })(newStartVnode);

                    newStartVnode = newCh[++newStartIdx];
                } else {
                    elmToMove = oldCh[idxInOld];
                    if (elmToMove.sel !== newStartVnode.sel) {
                        (function (newStartVnode) {
                            var oldVnode;
                            createElm(newStartVnode, insertedVnodeQueue, function (ch, isRearrange) {
                                if (isRearrange) {
                                    rearrangePatch(ch,oldVnode,parentElm);
                                } else {
                                    api.insertBefore(parentElm, ch.elm, oldStartVnode.elm);
                                }
                                oldVnode=ch.clone();
                            }, extraParameters,parentVnode.$scope)
                        })(newStartVnode);

                    } else {
                        patchVnode(elmToMove, newStartVnode, insertedVnodeQueue, extraParameters);
                        oldCh[idxInOld] = undefined;
                        api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                    }
                    newStartVnode = newCh[++newStartIdx];
                }
            }
        }
        if( oldEndIdx === newEndIdx)return;

        // console.log(oldStartIdx , oldEndIdx,oldEndIdx,newCh,newCh[3] && newCh[3].elm,newStartIdx,newEndIdx)

        //处理需要新增或移除的节点
        if (oldStartIdx > oldEndIdx) {
            before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
            addVnodes(parentVnode, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue, extraParameters);
        } else if (newStartIdx > newEndIdx) {
            removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
        }
    }

    //虚拟节点补丁
    function patchVnode(oldVnode, vnode, insertedVnodeQueue, extraParameters) {
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
            if (isDef(i) && isDef(i = i.update)) i(oldVnode, vnode);
        }

        //检查节点中的文本
        if (isUndef(vnode.text)) {
            if (isDef(oldCh) && isDef(ch)) {
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
        } else if (oldVnode.text !== vnode.text) {
            api.setTextContent(elm, vnode.text);
        }

        //修补后 的钩子  触发节点中的 postpatch 钩子
        if (isDef(hook) && isDef(i = hook.postpatch)) {
            i(oldVnode, vnode);
        }
    }

    //对比节点并修补
    return function patch(oldVnode, Vnode, scope, filter) {
        scope=scope||{};

        var i, elm, parent;
        var insertedVnodeQueue = [];

        var extraParameters = {
            scope: scope,
            filter: filter || {}
        }


        //检查并转换dom元素为虚拟Dom
        if (!isVnode(oldVnode)) {
            oldVnode = emptyNodeAt(oldVnode);
        }

        //检查是否innerVnode内部节点替换
        if(Vnode.isReplace){
            //检查旧节点是否也是内部节点
            if(oldVnode.innerVnode && oldVnode.innerVnode.length){
                elm=oldVnode.innerVnode[0].elm;
            }else{
                elm=oldVnode.elm
            }
            
            //获取父节点
            if(elm){
                if(elm instanceof Array ){
                    parent = api.parentNode(elm[0])
                }else{
                    parent = api.parentNode(elm)
                }
            }

            //检查是否有父节点
            if(parent){
                updateChildren({elm:parent}, oldVnode.innerVnode, Vnode.innerVnode, insertedVnodeQueue, extraParameters);
                //移除旧元素
                // removeVnodes(parent, [oldVnode], 0, 0);
            }else{
                Vnode.elm = [];
                Vnode.innerVnode.forEach(function (ch) {
                    createElm(ch, insertedVnodeQueue, function (ch, isRearrange) {
                        Vnode.elm = Vnode.elm.concat(ch.elm)
                    }, extraParameters,Vnode.$scope)

                })
            }

        //常规情况
        }else{
            if (Vnode instanceof Array) {

                elm = oldVnode.elm;
                parent = api.parentNode(elm);

                //创建新节点
                Vnode.forEach(function (Vnode) {

                    var oldVnode;
                    //创建新节点
                    createElm(Vnode, insertedVnodeQueue, function (ch, isRearrange) {
                        if (isRearrange) {
                            rearrangePatch(ch,oldVnode,parent);
                        } else {
                            //新增节点到父元素容器中
                            api.insertBefore(parent, Vnode.elm, api.nextSibling(elm));
                        }
                        oldVnode=ch.clone();
                    }, extraParameters);
                })

                if (parent !== null) {
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

                //检查两个虚拟节点是否相同
                if (sameVnode(oldVnode, Vnode)) {
                    //检查并传递作用域
                    if(Object.keys(Vnode.rootScope).length){
                        Object.keys(scope).forEach(function (key) {
                            Vnode.$scope[key]=scope[key];
                        })
                    }else{
                        Vnode.rootScope=scope;
                    }
                    //节点修补
                    patchVnode(oldVnode, Vnode, insertedVnodeQueue, extraParameters);
                } else {
                    elm = oldVnode.elm;
                    parent = api.parentNode(elm);

                    //创建新节点
                    createElm(Vnode, insertedVnodeQueue, function (ch, isRearrange) {
                        var _oldVnode;
                        if (parent !== null) {
                            if (isRearrange) {
                                rearrangePatch(ch,_oldVnode,parent);
                            } else {
                                //新增节点到父元素容器中
                                api.insertBefore(parent, Vnode.elm, api.nextSibling(elm));
                                //移除旧元素
                                removeVnodes(parent, [oldVnode], 0, 0);
                            }
                            _oldVnode=ch.clone();
                        }
                    }, extraParameters);
                }
            }
        }


        //触发队列中的insert钩子
        insertedVnodeQueue.forEach(function (ivq) {
            ivq.data.hook.insert(ivq);
        });

        //触发model中的post钩子
        cbs.post.forEach(function (postHook) {
            postHook();
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
    function invokeHandler(handler, vnode, event) {
        if (typeof handler === "function") {
            // call function handler
            handler.call(vnode, event, vnode);
        }
        else if (typeof handler === "object") {
            // call handler with arguments
            if (typeof handler[0] === "function") {
                // special case for single argument for performance
                if (handler.length === 2) {
                    handler[0].call(vnode, handler[1], event, vnode);
                }
                else {
                    var args = handler.slice(1);
                    args.push(event);
                    args.push(vnode);
                    handler[0].apply(vnode, args);
                }
            }
            else {
                // call multiple handlers
                for (var i = 0; i < handler.length; i++) {
                    invokeHandler(handler[i]);
                }
            }
        }
    }

    function handleEvent(event, vnode) {
        var name = event.type, on = vnode.data.on;
        // call event handler(s) if exists
        if (on && on[name]) {
            invokeHandler(on[name], vnode, event);
        }
    }

    function createListener() {
        return function handler(event) {
            handleEvent(event, handler.vnode);
        };
    }

    function updateEventListeners(oldVnode, vnode) {
        var oldOn = oldVnode.data.on, oldListener = oldVnode.listener, oldElm = oldVnode.elm,
            on = vnode && vnode.data.on, elm = (vnode && vnode.elm), name;
        // optimization for reused immutable handlers
        if (oldOn === on) {
            return;
        }
        // remove existing listeners which no longer used
        if (oldOn && oldListener) {
            // if element changed or deleted we remove all existing listeners unconditionally
            if (!on) {
                for (name in oldOn) {
                    // remove listener if element was changed or existing listeners removed
                    oldElm.removeEventListener(name, oldListener, false);
                }
            }
            else {
                for (name in oldOn) {
                    // remove listener if existing listener removed
                    if (!on[name]) {
                        oldElm.removeEventListener(name, oldListener, false);
                    }
                }
            }
        }
        // add new listeners which has not already attached
        if (on) {
            // reuse existing listener or create new
            var listener = vnode.listener = oldVnode.listener || createListener();
            // update vnode for listener
            listener.vnode = vnode;
            // if element changed or added we add all needed listeners unconditionally
            if (!oldOn) {
                for (name in on) {
                    // add listener if element was changed or new listeners added
                    elm.addEventListener(name, listener, false);
                }
            }
            else {
                for (name in on) {
                    // add listener if new listener added
                    if (!oldOn[name]) {
                        elm.addEventListener(name, listener, false);
                    }
                }
            }
        }
    }

    return {
        create: updateEventListeners,
        update: updateEventListeners,
        destroy: updateEventListeners
    };
}

var compMange = require('./componentMange');
var directorieMange = require('./directiveMange');

//组件检查
function compAndDirectiveInspect() {

    function inspectInit(vnode, initCall, extraParameters) {
        var compExample,
            isInitCall,
            data = vnode.data,
            attrsMap = data.attrsMap || {},
            attrs = data.attrs = data.attrs || {},
            handleExampleQueue = [],
            compClass = compMange.get(vnode.tag);

        function exapmpleQueueHandle() {
            var compExample = handleExampleQueue.pop();
            if (compExample) {

                //检查是否指令 并销毁当前指令属性记录
                if (compExample instanceof directorieMange.directiveClass) {
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
                    compExample.init();
                    exapmpleQueueHandle();
                }
            }
        }

        //组件检查
        if (compClass) {
            compExample = compClass(vnode, extraParameters);
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
                directorieClass = directorieMange.get(attrName);

            //检查是否是指令
            if (directorieClass) {
                directorieExample = directorieClass(vnode, extraParameters);
                //存入实例队列
                handleExampleQueue.push(directorieExample);
                //观察指令渲染
                directorieExample.watchRender(function () {
                    console.log('this is',vnode)
                    if (isInitCall) initCall();
                })
            } else {
                //如果不是指令则写入属性
                attrs[attrName] = attrsMap[attrName].value;
            }
        })


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

    //主要用于检查更新时候文本节点
    function inspectUpdate(oldVnode, vnode) {
        //检查两个节点是否都是文本节点
        if(isUndef(oldVnode.sel) && isUndef(vnode.sel)){

            //继承作用域
            Object.keys(oldVnode.$scope||{}).forEach(function (key) {
                vnode.$scope[key] = oldVnode.$scope[key];
            });

            if(oldVnode.data && vnode.data){
                //检查是否存在文本表达式字符 并且相等
                if( oldVnode.data.textExpString && oldVnode.data.textExpString === vnode.data.textExpString ){
                    //数据转移
                    Object.keys(oldVnode.data).forEach(function (key) {
                        vnode.data[key]=oldVnode.data[key];
                    })
                }
            }
        }
    }

    return {
        init: inspectInit,
        update:inspectUpdate
    }
}

module.exports = {
    patch: patch,
    vnode: vnode,
    isVnode: isVnode,
    domApi: htmlDomApi,
    node2vnode: emptyNodeAt
};
