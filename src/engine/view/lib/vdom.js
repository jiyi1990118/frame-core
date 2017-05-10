/**
 * 虚拟Dom
 * Created by xiyuan on 17-5-9.
 */

//钩子类型
var hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];

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
        parentNode.insertBefore(newNode, referenceNode);
    },
    removeChild: function removeChild(node, child) {
        node.removeChild(child);
    },
    appendChild: function appendChild(node, child) {
        node.appendChild(child);
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

//虚拟节点构造
function vnode(sel, data, children, text, elm) {
    var key = data === undefined ? undefined : data.key;
    return {
        tag: sel,
        data: data,
        children: children,
        text: text,
        elm: elm,
        key: key
    };
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

//创建
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

    //转换dom元素为虚拟节点
    function emptyNodeAt(elm) {
        var id = elm.id ? '#' + elm.id : '';
        var c = elm.className ? '.' + elm.className.split(' ').join('.') : '';
        return vnode(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
    }

    //创建删除的钩子
    function createRmCb(childElm, listeners) {
        return function rmCb() {
            if (--listeners === 0) {
                api.removeChild(api.parentNode(childElm), childElm);
            }
        };
    }

    //根据虚拟节点创建真实dom节点
    function createElm(vnode, insertedVnodeQueue) {
        var i, data = vnode.data,
            children = vnode.children, sel = vnode.sel;

        //获取并执行 虚拟节点中的初始化钩子
        if (isDef(data)) {
            if (isDef(i = data.hook) && isDef(i = i.init)) {
                i(vnode);
                data = vnode.data;
            }
        }

        //检查是否是注释
        if (sel === '!') {
            if (isUndef(vnode.text)) {
                vnode.text = '';
            }
            vnode.elm = api.createComment(vnode.text);

        } else if (isDef(sel)) {
            // 解析选择器

            //获取ID起始位置
            var hashIdx = sel.indexOf('#');

            //获取Class起始位置
            var dotIdx = sel.indexOf('.', hashIdx);

            var hash = hashIdx > 0 ? hashIdx : sel.length;
            var dot = dotIdx > 0 ? dotIdx : sel.length;

            //获取标签
            var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;

            //创建实体Dom元素
            var elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, tag)
                : api.createElement(tag);

            //获取元素ID
            if (hash < dot)
                elm.id = sel.slice(hash + 1, dot);

            //获取元素Class
            if (dotIdx > 0)
                elm.className = sel.slice(dot + 1).replace(/\./g, ' ');

            //触发model中的create 钩子
            cbs.create.forEach(function (createHook) {
                createHook(emptyNode, vnode)
            })

            //检查子元素 并递归创建子元素真实Dom
            if (isArray(children)) {
                children.forEach(function (ch) {
                    if (ch instanceof Object) {
                        api.appendChild(elm, createElm(ch, insertedVnodeQueue));
                    } else {
                        api.appendChild(elm, api.createTextNode(vnode.text));
                    }
                })
            } else if (primitive(vnode.text)) {
                api.appendChild(elm, api.createTextNode(vnode.text));
            }

            i = vnode.data.hook;
            if (isDef(i)) {
                //检查并触发create类型钩子
                if (i.create)
                    i.create(emptyNode, vnode);

                //收集并存储插入类型钩子
                if (i.insert)
                    insertedVnodeQueue.push(vnode);
            }

        } else {
            //文本节点
            vnode.elm = api.createTextNode(vnode.text);
        }
        return vnode.elm;
    }

    //创建新的虚拟节点
    function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
        for (; startIdx <= endIdx; ++startIdx) {
            var ch = vnodes[startIdx];
            if (ch instanceof Object) {
                api.appendChild(parentElm, createElm(ch, insertedVnodeQueue), before);
            } else {
                api.appendChild(parentElm, api.createTextNode(vnode.text), before);
            }
        }
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
                        invokeDestroyHook(i);
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
                    rm = createRmCb(ch.elm, listeners);

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
                    api.removeChild(parentElm, ch.elm);
                }
            } else {
                api.removeChild(parentElm, parentElm.childNodes[startIdx]);
            }
        }
    }

    //更新子元素
    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
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
                patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            } else if (sameVnode(oldEndVnode, newEndVnode)) {
                patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                oldEndVnode = oldCh[--oldEndIdx];
                newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldStartVnode, newEndVnode)) {
                patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
                oldStartVnode = oldCh[++oldStartIdx];
                newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldEndVnode, newStartVnode)) {
                patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                oldEndVnode = oldCh[--oldEndIdx];
                newStartVnode = newCh[++newStartIdx];
            } else {
                if (oldKeyToIdx === undefined) {
                    oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                }
                idxInOld = oldKeyToIdx[newStartVnode.key];
                if (isUndef(idxInOld)) {
                    api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    newStartVnode = newCh[++newStartIdx];
                } else {
                    elmToMove = oldCh[idxInOld];
                    if (elmToMove.sel !== newStartVnode.sel) {
                        api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    } else {
                        patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                        oldCh[idxInOld] = undefined;
                        api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                    }
                    newStartVnode = newCh[++newStartIdx];
                }
            }
        }

        //处理需要新增或移除的节点
        if (oldStartIdx > oldEndIdx) {
            before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
            addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
        } else if (newStartIdx > newEndIdx) {
            removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
        }
    }

    //虚拟节点补丁
    function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
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
                if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue);
            } else if (isDef(ch)) {
                if (isDef(oldVnode.text))
                    api.setTextContent(elm, '');
                addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
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
    return function patch(oldVnode, vnode) {

        var i, elm, parent;
        var insertedVnodeQueue = [];

        //检查并转换dom元素为虚拟Dom
        if (!isVnode(oldVnode)) {
            oldVnode = emptyNodeAt(oldVnode);
        }

        if (vnode instanceof Array) {

            elm = oldVnode.elm;
            parent = api.parentNode(elm);

            //创建新节点
            vnode.forEach(function (vnode) {
                //创建新节点
                createElm(vnode, insertedVnodeQueue);
                //新增节点到父元素容器中
                api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
            })

            if (parent !== null) {
                //移除旧元素
                removeVnodes(parent, [oldVnode], 0, 0);
            }

        } else {
            if (!(vnode instanceof Object))return oldVnode;

            //检查并转换dom元素为虚拟Dom
            if (!isVnode(vnode)) {
                vnode = emptyNodeAt(vnode);
            }

            //触发model中pre钩子
            for (i = 0; i < cbs.pre.length; ++i)
                cbs.pre[i]();

            //检查两个虚拟节点是否相同
            if (sameVnode(oldVnode, vnode)) {
                //节点修补
                patchVnode(oldVnode, vnode, insertedVnodeQueue);
            } else {
                elm = oldVnode.elm;
                parent = api.parentNode(elm);

                //创建新节点
                createElm(vnode, insertedVnodeQueue);

                if (parent !== null) {
                    //新增节点到父元素容器中
                    api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
                    //移除旧元素
                    removeVnodes(parent, [oldVnode], 0, 0);
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

        return vnode;
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

module.exports = {
    patch: init([attributesModule(), classModule(), propsModule(), styleModule(), eventListenersModule()]),
    vnode: vnode,
    isVnode: isVnode
};
