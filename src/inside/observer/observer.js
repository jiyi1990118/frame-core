/**
 * Created by xiyuan on 17-3-7.
 */
(function (observer) {
    if (typeof define === "function" && define.amd) {
        define(function (require, exports, module) {
            module.exports = observer;
        });
    } else {
        window.observer = observer;
    }

})(function () {
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
        key = (key || '').replace(/^\[([^.\]]+)\]|^\.?([^.\[\]]+)/, function (str, arrKey, objKey) {
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

        recursionKey(key, function (nowKey, key) {
            if (key)return sourceObj = sourceObj[nowKey];
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
                if (!isInstance(newData, oldData))return false;
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
     * 获取需要销毁的监听节点
     * @param listen
     * @returns {*}
     */
    function destroyListen(listen) {
        if(!listen.parent || !Object.keys(listen.parent.child).length === 1 )return listen;
        return destroyListen(listen.parent);
    }

    /**
     * 数据监听结构
     * @param parentListen
     */
    function listenStruct(parentListen, nowKey) {

        //子级数据
        this.child = {};
        //监听的回调集合
        this.listens = [];
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
            }
        } else {
            this.targetData = parentListen;
        }
        this.listen();
    }

    //数据对比
    listenStruct.prototype.diff = function (parentData) {
        var oldData=this.targetData,
            oldParentData=this.parentData,
            newData = parentData && typeof parentData === 'object' ? parentData[this.nowKey] : undefined,
            isEqual = diff(oldData, newData);

        //触发子级
        this.berforDefineProperty && this.berforDefineProperty.hasOwnProperty('set') && this.berforDefineProperty.set(newData, this);
        //获取父级数据
        this.parentData = this.parent.targetData;
        //更改目标数据
        this.targetData = newData;

        if (!isEqual) {
            //还原旧数据的属性
            //检查当前数据属性 后面是否修改
            if(this.topListen && oldParentData !== this.parentData  && Object.getOwnPropertyDescriptor(oldParentData,this.nowKey) && Object.getOwnPropertyDescriptor(oldParentData,this.nowKey).set !== this.prevDefineProperty.set){
                this.topListen.berforDefineProperty=this.prevDefineProperty;
            }else{
                this.prevDefineProperty && Object.defineProperty(oldParentData, this.nowKey, this.prevDefineProperty);
            }

            //触发监听
            this.listens.forEach(function (fn) {
                fn(newData);
            });

            this.topListen=undefined;
            //数据监听
            this.listen(!(parentData && parentData.hasOwnProperty(this.nowKey)));
        }

        //触发子级节点数据对比
        Object.keys(this.child).forEach(function (key) {
            var childListen = this.child[key];
            childListen.diff(newData);
        }.bind(this));
    };

    //节点数据监听
    listenStruct.prototype.listen = function (isDelete) {
        var This = this;

        if (this.parentData && typeof this.parentData === 'object') {

            this.prevDefineProperty=Object.getOwnPropertyDescriptor(this.parentData, this.nowKey) || {
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
            Object.defineProperty(this.parentData, this.nowKey, {
                enumerable: true,
                configurable: true,
                set: function (newData, transfer) {
                    var tmp = {};
                    tmp[This.nowKey] = newData;
                    This.diff(tmp);
                    //数据监听转移
                    transfer && (This.topListen = transfer);
                },
                get: function (transfer) {
                    switch (true){
                        case transfer instanceof  listenStruct:
                            //数据监听转移
                            transfer && (This.topListen = transfer);
                            break;
                        case transfer === 'this':
                            return This;
                        default:
                    }
                    return This.targetData;
                }
            });
            this.isDelete = false;
            if (isDelete === true) {
                this.isDelete = true;
                delete this.parentData[this.nowKey]
            }
        }

    };

    //设置监听节点数据
    listenStruct.prototype.set = function (data) {
        this.targetData = data;
    };

    //获取监听节点数据
    listenStruct.prototype.get = function () {
        return this.targetData;
    };

    //添加监听
    listenStruct.prototype.add = function (fn) {
        this.listens.indexOf(fn) !== -1 || this.listens.push(fn);
    };

    //删除监听
    listenStruct.prototype.remove = function (fn) {
        if(typeof fn === "function"){
            var index = this.listens.indexOf(fn);
            return index === -1 ? false : this.listens.splice(this.listens.indexOf(fn), 1)[0];
        }else{
            this.listens=[];
        }

        //所有监听移除后还原数据原有属性
        if(!this.listens.length && !Object.keys(this.child).length){
            //此处主要销毁监听节点
            destroyListen(this).destroy();
        }
    };

    //添加子节点
    listenStruct.prototype.addChild = function (key, listenStruct) {
        return this.child[key] = listenStruct;
    };

    //根据key获取子节点
    listenStruct.prototype.getChild = function (key) {
        return key ? this.child[key] : this.child;
    };

    //删除子节点
    listenStruct.prototype.removeChild = function (key) {
        var child = this.child[key];
        return delete this.child[key] && child;
    };

    //节点销毁
    listenStruct.prototype.destroy = function () {
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

        //销毁子节点
        Object.keys(this.child).forEach(function (key) {
            this.child[key].destroy();
        }.bind(this));

        //删除当前对象所有属性
        Object.keys(this).forEach(function (key) {
            delete this[key];
        }.bind(this))
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
    observerProxy.prototype.set = function (key, data) {
        return levelKey(this.listen.targetData, key, data);
    };

    /**
     * 资源获取
     * @param key
     * @returns {*}
     */
    observerProxy.prototype.get = function (key) {
        return levelKey(this.listen.targetData, key);
    };

    //新增数据监听
    observerProxy.prototype.addListen = function (key, fn) {
        var parentListen = this.listen,
            sourceObj = parentListen.targetData;
        if (typeof fn !== "function") {
            fn = key;
            key = ''
        }
        //遍历监听的Key
        recursionKey(key, function (nowKey, nextKey) {
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

    //删除数据监听
    observerProxy.prototype.removeListen = function (key, fn) {
        var parentListen = this.listen;
        recursionKey(key, function (nowKey, nextKey) {
            if (nowKey) {
                parentListen = parentListen.getChild(nowKey)
            }
            if (!(nowKey && nextKey)) {
                parentListen && parentListen.remove(fn);
            }
            return nextKey;
        })
    };

    observerProxy.prototype.destroy = function () {
        this.listen.destroy();
        Object.keys(this).forEach(function (key) {
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
        if (obj instanceof observer)return obj;
        observerProxyStroage[this.sourceId = uid()] = new observerProxy(obj);
    }

    /**
     * 数据监听
     * @param watchKey
     * @param watchFn
     */
    observer.prototype.watch = function (watchKey, watchFn) {
        if (typeof watchFn !== "function") {
            watchFn = watchKey;
            watchKey = '';
        }
        observerProxyStroage[this.sourceId].addListen(watchKey, watchFn);
    };

    /**
     * 移除监听
     * @param watchKey
     * @param watchFn
     */
    observer.prototype.unWatch = function (watchKey, watchFn) {
        if (typeof watchFn !== "function" && typeof watchKey === "function") {
            watchFn = watchKey;
            watchKey = '';
        }
        observerProxyStroage[this.sourceId].removeListen(watchKey, watchFn);
    };

    /**
     * 获取对应的数据
     * @param key
     */
    observer.prototype.get = function (key) {
        key = typeof key === "string" ? key : '';
        return observerProxyStroage[this.sourceId].get(key);
    };

    /**
     * 销毁数据监听
     */
    observer.prototype.destroy = function () {
        observerProxyStroage[this.sourceId].destroy();
        delete observerProxyStroage[this.sourceId];
        //销毁所有私有属性
        Object.keys(this).forEach(function (key) {
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

    return function (obj) {
        return new observer(obj);
    };
}());