/**
 * 语法结构处理
 * Created by xiyuan on 17-5-11.
 */

"use strict";

var log=require('../../../inside/log/log');

var observer = require('../../../inside/lib/observer');

//语法值观察专用
var $ob = function () {
    this.count = 0;
    this.watchCount = 0;
    this.stroage = {};
    this.receiveStroage = [];
}

$ob.prototype.watch = function (type) {
    var $this = this,
        loadState,
        stroage = this.stroage;

    this.watchCount++;


    return function (data) {
        //记录值
        stroage[type] = data;

        if(!loadState){
            ++$this.count
            loadState=true;
        }

        //计数器
        if ($this.count === $this.watchCount) {
            if($this.receiveStroage.length){
                $this.receiveStroage.forEach(function (fn) {
                    fn(stroage)
                })
            }
        }
    }
}

$ob.prototype.receive = function (fn) {
    var stroage = this.stroage;
    this.receiveStroage.push(fn);

    //检查是否加载完毕
    if (this.watchCount === this.count) {
        this.receiveStroage.forEach(function (fn) {
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
            return (val1.value === undefined ? '':val1.value) + (val2.value === undefined ? '':val2.value);
        case '-':
            return val1.value - val2.value;
        case '*':
            return val1.value * val2.value;
        case '/':
            return val1.value / val2.value;
        case '%':
            return val1.value % val2.value;
        case '|':
            return val1.value | val2.value;
        case '&':
            return val1.value & val2.value;
        case '||':
            return val1.value || val2.value;
        case '&&':
            return val1.value || val2.value;
        case '==':
            return val1.value == val2.value;
        case '>=':
            return val1.value >= val2.value;
        case '<=':
            return val1.value <= val2.value;
        case '===':
            return val1.value === val2.value;
        //三元运算
        case '?':
            return val1.value ? val2.value : val3.value;
        //成员表达式
        case 'Member':
            return val1.value[val2.value];
        //数组表达式
        case 'Array':
            var arr = [];
            Object.keys(val1).forEach(function (key) {
                arr.push(val1[key].value)
            })
            return arr;
        //对象表达式
        case 'Object':
            var obj = {};
            Object.keys(val1).forEach(function (key) {
                obj[key] = val1[key].value;
            })
            return obj;
        //方法执行
        case 'Call':
            var call,
                ags = [];

            Object.keys(val1).forEach(function (key) {
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

            Object.keys(val1).forEach(function (key) {
                if (key === 'callee') {
                    return fcall = val1[key].value
                }
                fags.push(val1[key].value);
            });
            if(typeof fcall === 'function') return fcall.apply(this, fags);
            return log.error('过滤器 '+val2+' 不存在!');
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
 * @param multiple
 */
function analysis(struct, scope, filter,multiple) {
    var $this = this;

    this.reads = [];
    this.watchs = [];
    this.scope = scope;
    this.filter = filter;
    this.observers=[];
    this.multiple=multiple;

    this.lex(struct, function (resData) {
        $this.resData = resData.value;
        //获取监听key
        delete $this.watchInfo;
        if(resData.keys instanceof Array){
            $this.watchInfo={
                observer:resData.observer,
                key:resData.keys.join('.')
            };
        };

        //触发观察
        $this.watchs.forEach(function (fn) {
            fn(resData.value);
        });

        //触发读取
        $this.reads.forEach(function (fn) {
            fn(resData.value);
        });
        $this.reads = [];
    });

}

//语法结果观察
analysis.prototype.watch = function (fn) {
    this.watchs.push(fn);
}

//移除语法观察
analysis.prototype.unWatch = function (fn) {
    if(fn && this.watchs.indexOf(fn) !== -1){
        this.watchs.splice(this.watchs.indexOf(fn),1)
    }else{
        this.watchs=[];
    }
}

//语法结果读取
analysis.prototype.read = function (fn) {
    //检查返回的数据
    if (this.hasOwnProperty('resData')) {
        fn(this.resData);
    } else {
        this.reads.push(fn);
    }
    return this.resData;
}

//语法结果读取
analysis.prototype.readWatch = function (fn) {
    //检查返回的数据
    if (this.hasOwnProperty('resData')) {
        fn(this.resData);
    }
    this.watchs.push(fn);
    return this.resData;
}

//语法结构检查
analysis.prototype.lex = function (nowStruct, callback, isFilter) {

    var keys,
        _keys,
        obData,
        $this = this,
        ob = new $ob();

    switch (nowStruct.exp) {
        //一元表达式
        case 'UnaryExpression':
            this.lex(nowStruct.argment, ob.watch('argment'));
            ob.receive(function (data) {
                callback({
                    value: operation('$' + nowStruct.operator, data.argment)
                })
            })
            break;
        //二元表达式
        case 'BinaryExpression':
            this.lex(nowStruct.left, ob.watch('left'))
            this.lex(nowStruct.right, ob.watch('right'));

            ob.receive(function (data) {
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

            ob.receive(function (data) {
                callback({
                    value: operation(nowStruct.operator, data.condition, data.accord, data.mismatch)
                })
            })
            break;
        //成员表达式
        case 'MemberExpression':
            this.lex(nowStruct.object, ob.watch('object'), isFilter,nowStruct)
            this.lex(nowStruct.property, ob.watch('property'), nowStruct.computed ? false : 'noComputed');

            ob.receive(function (data) {

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
                            data.object.observer.readWatch(_keys = keys, function (newData) {
                                callback({
                                    value: newData,
                                    observer: data.object.observer,
                                    keys: data.object.keys.concat(data.property.value)
                                });
                            });
                        }

                        //检查是否数组子级元素
                    } else if(data.object.atoms){

                        var VAL=data.object.atoms[data.property.value];

                        if(VAL.observer){
                            keys = VAL.keys.join('.');

                            if (_keys !== keys) {
                                _keys && VAL.observer.unwatch(_keys);
                                //数据读取并监听
                                VAL.observer.readWatch(_keys = keys, function (newData) {
                                    callback({
                                        value: newData,
                                        observer: VAL.observer,
                                        keys: VAL.keys.concat()
                                    });
                                });
                            }
                        }else{
                            callback(VAL)
                        }

                    }else{
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
            nowStruct.arguments.forEach(function (args, index) {
                $this.lex(args, ob.watch(index));
            })

            ob.receive(function (data) {
                callback({
                    value: operation('Array', data),
                    atoms:data
                });
            })
            break;
        //对象表达式
        case 'ObjectExpression':
            nowStruct.property.forEach(function (property) {
                $this.lex(property.value, ob.watch(property.key.value))
            })

            ob.receive(function (data) {
                var objData = operation('Object', data);
                obData = observer($this.scope,$this.multiple);

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
            nowStruct.arguments.forEach(function (args, index) {
                $this.lex(args, ob.watch(index))
            })

            ob.receive(function (data) {
                callback({
                    value: operation('Call', data)
                });
            })
            break;
        //过滤器表达式
        case 'FilterExpression':
            this.lex(nowStruct.callee, ob.watch('callee'), true,nowStruct);

            if (nowStruct.arguments.length) {
                //遍历过滤器参数
                nowStruct.arguments.forEach(function (arg, index) {
                    if(arg.value === '$'){
                        $this.lex(nowStruct.lead, ob.watch(index));
                    }else{
                        $this.lex(arg, ob.watch(index));
                    }
                });
            } else {
                this.lex(nowStruct.lead, ob.watch(0));
            }

            ob.receive(function (data) {
                callback({
                    value: operation('Filter', data,nowStruct.callee.value)
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

            ob.receive(function (data) {
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
                            obData = observer(this.scope,this.multiple);
                            //收集监听对象
                            $this.observers.push(obData);
                            //数据读取并监听
                            obData.readWatch(nowStruct.value, function (newData) {
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

analysis.prototype.destroy=function () {
    var $this=this;

    //销毁监听对象
    this.observers.forEach(function (obs) {
        obs.destroy();
    });

    Object.keys(this).forEach(function (key) {
        delete $this[key];
    });
}

/**
 * 语法结构处理类
 * @param syntaxStruct
 * @param scope
 * @param filter
 */
function structHandle(syntaxStruct, scope, filter,multiple) {
var $this=this;
    //语法过滤器
    this.filter = filter;

    //语法作用域
    this.scope = scope||{};
    //语法结构
    this.structRes = new analysis(syntaxStruct, this.scope, filter,multiple);
}

//数据分配
structHandle.prototype.assign = function (key, data) {
    this.scope[key] = data;
}

//表达式数据观察
structHandle.prototype.watch = function (fn) {
    this.structRes.watch(fn)
}

//移除表达式数据观察
structHandle.prototype.unWatch = function (fn) {
    this.structRes.unWatch(fn)
}

//获取值的监听key
structHandle.prototype.getWatchInfo=function () {
    return this.structRes.watchInfo;
};

//表达式数据读取
structHandle.prototype.read = function (fn) {
    return this.structRes.read(fn)
}

//表达式数据读取
structHandle.prototype.readWatch = function (fn) {
    return this.structRes.readWatch(fn)
}

structHandle.prototype.destroy=function () {
    var $this=this;
    this.structRes.destroy();
    Object.keys(this.scope).forEach(function (key) {
        delete $this.scope[key]
    })

    Object.keys(this).forEach(function (key) {
        delete $this[key];
    })
}

module.exports = function syntaxStructHandle(syntaxStruct, scope, filter,multiple) {
    return new structHandle(syntaxStruct, scope, filter,multiple);
}