/**
 * Created by xiyuan on 17-4-25.
 */
(function (syntaxFn) {
    if (typeof define === "function" && define.cmd) {
        define(syntaxFn)
    } else {
        this.syntax = syntaxFn();
    }
})(function () {

    //字符检测
    var strGate = {
        // 空白字符
        isWhiteSpace: function (cp) {
            return (cp === 0x20) || (cp === 0x09) || (cp === 0x0B) || (cp === 0x0C) || (cp === 0xA0) ||
                (cp >= 0x1680 && [0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(cp) >= 0);
        },
        // 行结束字符
        isLineTerminator: function (cp) {
            return (cp === 0x0A) || (cp === 0x0D) || (cp === 0x2028) || (cp === 0x2029);
        },
        // 变量起始字符
        isidentifierStart: function (cp) {
            return (cp === 0x24) || (cp === 0x5F) ||
                (cp >= 0x41 && cp <= 0x5A) ||
                (cp >= 0x61 && cp <= 0x7A) ||
                (cp === 0x5C) ||
                (cp >= 0x80);
        },
        // 变量字符
        isidentifierPart: function (cp) {
            return (cp === 0x24) || (cp === 0x5F) ||
                (cp >= 0x41 && cp <= 0x5A) ||
                (cp >= 0x61 && cp <= 0x7A) ||
                (cp >= 0x30 && cp <= 0x39) ||
                (cp === 0x5C) ||
                (cp >= 0x80);
        },
        // 数字字符
        isDecimalDigit: function (cp) {
            return (cp >= 0x30 && cp <= 0x39); // 0..9
        },
        //检查是否关键词
        isKeyword: function (id) {
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
        codePointAt: function (cp) {
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
    function syntaxParser(code) {
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
    syntaxParser.prototype.getSoonAtom = function () {
        var atom = this.soonAtom;
        delete this.soonAtom;
        return atom
    }

    //获取后面的表达式
    syntaxParser.prototype.nextExpressionLex = function (atom, isAdopt) {
        this.expStruct = null;
        this.expTemp.valueType = null;
        return this.expressionLex(atom, isAdopt);
    }

    //语法块结束符号添加
    syntaxParser.prototype.addBlockEnd = function (symbol) {
        this.expBlockEnd.push(symbol);
        //表达式层级参数
        this.levelArgs.push(this.arguments = []);
    }

    //表达式连接属性获取
    syntaxParser.prototype.getExpAttr = function (strcut, isBefore) {
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
    syntaxParser.prototype.expConcat = function (strcut, expStruct) {
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
    syntaxParser.prototype.expressionLex = function (atom, isAdopt) {
        //检查语法是否出错
        if (this.errMsg)return;

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
                if(expTemp.valueType !== 'literal'){
                    if(atom.identity === 'assignment'){
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

                                        nextAtom=this.atomLex();
                                        if(nextAtom){
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

                                        nextAtom = nextAtom||this.atomLex();
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
    (function (expression) {

        //一元表达式
        expression.expUnary = function (atom, expTemp) {
            var struct = {
                    argment: null,
                    operator: atom.value,
                    priority: 3,
                    exp: 'UnaryExpression'
                },
                nextAtom = this.atomLex();

            var tmpStruct = this.expConcat(struct);

            this.nextExpressionLex(nextAtom,false);

            if (!this.expStruct)return this.throwErr('一元运算表达式不完整！');

            //继续检查后续表达式 并 表达式连接
            this.expStruct = this.expConcat(tmpStruct);

            expTemp.valueType = 'literal';
            return struct;
        }

        //二元表达式
        expression.expBinary = function (atom, expTemp) {
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

            if (!nextAtom)return this.throwErr('二元运算语法错误，右侧表达式不存在！');

            //连接之前的表达式
            var tmpStruct = this.expConcat(nowStruct, struct);

            if (!expTemp.valueType)return this.throwErr('二元表达式，右侧语法错误！', atom);

            //继续检查后续表达式 并 表达式连接
            this.expStruct = this.expConcat(tmpStruct, this.expStruct);

            expTemp.valueType = 'literal';
            return struct;
        }

        //三元表达式
        expression.expTernary = function (atom, expTemp) {
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

            struct.mismatch=this.expStruct;

            expTemp.valueType = 'literal'

            return this.expStruct =struct;
        }

        //自运算
        expression.expUpdate = function (atom, expTemp) {
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
        expression.expUpdateAfter = function (atom, expTemp) {

            //检查语法是否符合后自运算
            function checkExpression(expStruct){
                switch (expStruct.exp){
                    case 'BinaryExpression':
                        return checkExpression(expStruct.right);
                    case 'MemberExpression':
                        return expStruct;
                    case 'UnaryExpression':
                        return checkExpression(expStruct.argment);
                    default:
                        switch (expStruct.type){
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
            if(!checkExpression(this.expStruct)){
                return  this.throwErr('后自运算表达式有误!', atom);
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
        expression.expMember = function (atom, expTemp) {
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
        expression.expArray = function (atom, expTemp) {
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
        expression.expObject = function (atom, expTemp) {
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
        expression.expCall = function (atom, expTemp) {

            //检查方法表达式
            if( expTemp.valueType !== 'identifier' && this.expStruct.exp !== 'CallExpression' )return this.throwErr('表达式不是一个方法！');

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

            if(nextAtom){
                if (nextAtom.value === '.' || nextAtom.value === '[') {
                    struct = this.expMember(nextAtom, expTemp);
                } else {
                    this.soonAtom = nextAtom;
                }
            }

            return struct;
        }

        //分配表达式
        expression.expAssignment = function (atom, expTemp) {
            var struct = {
                    exp: 'AssignmentExpression',
                    value: null,
                    identifier:this.expStruct,
                    operator: atom.value,
                    priority: atom.priority
                };

            this.nextExpressionLex();
            struct.value=this.expStruct;

            return this.expStruct=struct;
        }

        //过滤表达式
        expression.expFilter = function (atom, expTemp) {
            var struct = {
                    exp: 'FilterExpression',
                    arguments: [],
                    operator: atom.value,
                    priority: atom.priority,
                    callee: null,
                    lead:null
                },
                tmpStruct = this.expConcat(struct);

            this.nextExpressionLex(this.atomLex(),false);

            if(this.expStruct.exp){
                switch (this.expStruct.exp){
                    case 'MemberExpression':
                        struct.callee=this.expStruct;
                        break;
                    case 'CallExpression':
                        struct.callee=this.expStruct.callee;
                        struct.arguments=this.expStruct.arguments;
                        break;
                    default:
                        return this.throwErr('过滤器表达式错误!')
                }
            }else{
                switch (this.expStruct.type){
                    case atomType.Keyword:
                    case atomType.identifier:
                        struct.callee=this.expStruct;
                        break;
                    default:
                        return this.throwErr('过滤器数据类型错误!')
                }
            }

            this.expStruct=tmpStruct;
            tmpStruct.valueType='literal';

            return struct;
        }


    })(syntaxParser.prototype);

    //原子扫描
    syntaxParser.prototype.atomLex = function () {
        if (this.eof())return

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

        if (!atom)return;

        this.atoms.push(atom);
        return atom;
    };

    //原子类型扫描
    (function (scan) {

        // 标识符
        scan.identifierLex = function () {
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
        scan.PunctuatorLex = function () {
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
        scan.StringLiteralLex = function () {
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
        scan.NumericLiteralLex = function () {
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

    })(syntaxParser.prototype);


    //检查扫描是否结束
    syntaxParser.prototype.eof = function () {
        return this.index >= this.length;
    };

    //错误抛出
    syntaxParser.prototype.throwErr = function (msg, atom) {
        this.errMsg = msg;
        atom = atom || this.preAtom;
        console.warn(msg + ' [ 第' + (atom.start + 1) + '个字符 ]');
    }

    return function (code) {
        console.log(new syntaxParser(code))
        // new syntaxParser(code)
    }
})