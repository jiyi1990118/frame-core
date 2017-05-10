(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
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
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s
})({
    1: [function(require, module, exports) {
        /**
         * 引擎中心
         * Created by xiyuan on 17-5-9.
         */
        "use strict";

        //视图引擎
        var viewEngine = require('./view/exports');

        module.exports = {
            viewEngin: viewEngine
        }

    }, {
        "./view/exports": 2
    }],
    2: [function(require, module, exports) {
        /**
         * 视图引擎
         * Created by xiyuan on 17-5-9.
         */
        "use strict";

        //虚拟dom
        var vdom = require('./vdom/vdom');

        //语法解析
        var syntax = require('./syntax/syntax');

        //html字符转换成虚拟DOM数据结构
        var html2vdom = require('./html2vdom/html2vdom');

        var observer = require('../../inside/observer/observer');

        module.exports = vdom
    }, {
        "../../inside/observer/observer": 7,
        "./html2vdom/html2vdom": 3,
        "./syntax/syntax": 4,
        "./vdom/vdom": 5
    }],
    3: [function(require, module, exports) {
        /**
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
        (function(root, factory) {
            if (typeof define === 'function' && define.amd) {
                define(factory.bind(this));
            } else if (typeof exports === 'object') { //nodejs
                module.exports = factory; //Need to pass jsdom window to initialize
            } else {
                root.html2vdom = factory();
            }
        }(this, function(window) {
            //browser and jsdom compatibility
            window = window || this;
            var document = window.document;

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
             * html 转换成虚拟dom数据结构
             */
            return function html2vdom(html) {
                var nowStruct,
                    eleStruct = [],
                    structLevel = [];

                HTMLParser(html, {
                    //标签节点起始
                    start: function(tagName, attrs, unary) {
                        nowStruct = {
                            sel: tagName,
                            data: {
                                attrsMap: attrs.reduce(function(attrs, current) {
                                    attrs[current.name] = current.value;
                                    return attrs;
                                }, {})
                            },
                            children: [],
                            text: undefined,
                            elm: undefined,
                            key: undefined
                        }
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

                        var exps = [];

                        /**
                         * 获取表达式
                         * @param text
                         * @returns {*}
                         */
                        function findExp(text) {
                            var sid,
                                eid,
                                expStr,
                                str = text;

                            if (str.length) {
                                if ((sid = str.indexOf(DelimiterLeft)) === -1 || (eid = str.indexOf(DelimiterRight, sid)) === -1) {
                                    exps.push(str)
                                } else {
                                    //截取界定符中的表达式字符
                                    expStr = str.slice(sid + DelimiterLeft.length).slice(0, eid - sid - DelimiterLeft.length);
                                    //剩下的字符
                                    exps.push({
                                        expStr: expStr
                                    })
                                    findExp(str.slice(eid + DelimiterRight.length));
                                }
                            }
                            return text;
                        }

                        var nowStruct = {
                            text: findExp(text),
                            data: {
                                exps: exps
                            },
                            elm: undefined,
                            key: undefined
                        }

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
            };
        }));

    }, {}],
    4: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-4-25.
         */
        (function(syntaxFn) {
            if (typeof define === "function" && define.cmd) {
                define(syntaxFn)
            } else {
                this.syntax = syntaxFn();
            }
        })(function() {

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
            syntaxParser.prototype.getSoonAtom = function() {
                var atom = this.soonAtom;
                delete this.soonAtom;
                return atom
            }

            //获取后面的表达式
            syntaxParser.prototype.nextExpressionLex = function(atom, isAdopt) {
                this.expStruct = null;
                this.expTemp.valueType = null;
                return this.expressionLex(atom, isAdopt);
            }

            //语法块结束符号添加
            syntaxParser.prototype.addBlockEnd = function(symbol) {
                this.expBlockEnd.push(symbol);
                //表达式层级参数
                this.levelArgs.push(this.arguments = []);
            }

            //表达式连接属性获取
            syntaxParser.prototype.getExpAttr = function(strcut, isBefore) {
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
            syntaxParser.prototype.expConcat = function(strcut, expStruct) {
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
            syntaxParser.prototype.expressionLex = function(atom, isAdopt) {
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


            })(syntaxParser.prototype);

            //原子扫描
            syntaxParser.prototype.atomLex = function() {
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

            })(syntaxParser.prototype);


            //检查扫描是否结束
            syntaxParser.prototype.eof = function() {
                return this.index >= this.length;
            };

            //错误抛出
            syntaxParser.prototype.throwErr = function(msg, atom) {
                this.errMsg = msg;
                atom = atom || this.preAtom;
                console.warn(msg + ' [ 第' + (atom.start + 1) + '个字符 ]');
            }

            return function(code) {
                console.log(new syntaxParser(code))
                // new syntaxParser(code)
            }
        })
    }, {}],
    5: [function(require, module, exports) {
        /**
         * 虚拟Dom
         * Created by xiyuan on 17-5-9.
         */

        (function(exports) {

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

            function init(modules) {
                var i, j, cbs = {};
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
                        children = vnode.children,
                        sel = vnode.sel;

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
                        var elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, tag) :
                            api.createElement(tag);

                        //获取元素ID
                        if (hash < dot)
                            elm.id = sel.slice(hash + 1, dot);

                        //获取元素Class
                        if (dotIdx > 0)
                            elm.className = sel.slice(dot + 1).replace(/\./g, ' ');

                        //触发model中的create 钩子
                        cbs.create.forEach(function(createHook) {
                            createHook(emptyNode, vnode)
                        })

                        //检查子元素 并递归创建子元素真实Dom
                        if (isArray(children)) {
                            children.forEach(function(ch) {
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
                        cbs.destroy.forEach(function(destroyHook) {
                            destroyHook(vnode);
                        })

                        if (isDef(vnode.children)) {
                            //触发子元素的销毁钩子
                            vnode.children.forEach(function(children) {
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
                                rm = createRmCb(ch.elm, listeners);

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
                                api.removeChild(parentElm, ch.elm);
                            }
                        } else {
                            api.removeChild(parentElm, parentElm.childNodes[startIdx]);
                        }
                    }
                }

                //更新子元素
                function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
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
                        vnode.forEach(function(vnode) {
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
                        if (!(vnode instanceof Object)) return oldVnode;

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
                    insertedVnodeQueue.forEach(function(ivq) {
                        ivq.data.hook.insert(ivq);
                    });

                    //触发model中的post钩子
                    cbs.post.forEach(function(postHook) {
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
                function invokeHandler(handler, vnode, event) {
                    if (typeof handler === "function") {
                        // call function handler
                        handler.call(vnode, event, vnode);
                    } else if (typeof handler === "object") {
                        // call handler with arguments
                        if (typeof handler[0] === "function") {
                            // special case for single argument for performance
                            if (handler.length === 2) {
                                handler[0].call(vnode, handler[1], event, vnode);
                            } else {
                                var args = handler.slice(1);
                                args.push(event);
                                args.push(vnode);
                                handler[0].apply(vnode, args);
                            }
                        } else {
                            // call multiple handlers
                            for (var i = 0; i < handler.length; i++) {
                                invokeHandler(handler[i]);
                            }
                        }
                    }
                }

                function handleEvent(event, vnode) {
                    var name = event.type,
                        on = vnode.data.on;
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
                    var oldOn = oldVnode.data.on,
                        oldListener = oldVnode.listener,
                        oldElm = oldVnode.elm,
                        on = vnode && vnode.data.on,
                        elm = (vnode && vnode.elm),
                        name;
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
                        } else {
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
                        } else {
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

            var vdom = {
                patch: init([attributesModule(), classModule(), propsModule(), styleModule(), eventListenersModule()]),
                vnode: vnode,
                isVnode: isVnode
            };

            if (typeof module === "object" && typeof module.exports === "object") {
                module.exports = vdom;
            } else if (typeof define === "function") {
                define(function(require, exports, module) {
                    module.exports = vdom;
                })
            } else {
                exports.vdom = vdom;
            }
        })(this)

    }, {}],
    6: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-9.
         */
        (function(FL) {
            if (typeof define === "function" && define.cmd) {
                define(FL)
            } else {
                this.FL = FL();
            }
        })(function() {
            return require('./engine/exports');
        })
    }, {
        "./engine/exports": 1
    }],
    7: [function(require, module, exports) {
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
                key = (key || '').replace(/^\[([^.\]]+)\]|^\.?([^.\[\]]+)/, function(str, arrKey, objKey) {
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
             * 获取需要销毁的监听节点
             * @param listen
             * @returns {*}
             */
            function destroyListen(listen) {
                if (!listen.parent || !Object.keys(listen.parent.child).length === 1) return listen;
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
            listenStruct.prototype.diff = function(parentData) {
                var oldData = this.targetData,
                    oldParentData = this.parentData,
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
                    if (this.topListen && oldParentData !== this.parentData && Object.getOwnPropertyDescriptor(oldParentData, this.nowKey) && Object.getOwnPropertyDescriptor(oldParentData, this.nowKey).set !== this.prevDefineProperty.set) {
                        this.topListen.berforDefineProperty = this.prevDefineProperty;
                    } else {
                        this.prevDefineProperty && Object.defineProperty(oldParentData, this.nowKey, this.prevDefineProperty);
                    }

                    //触发监听
                    this.listens.forEach(function(fn) {
                        fn(newData);
                    });

                    this.topListen = undefined;
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
                    Object.defineProperty(this.parentData, this.nowKey, {
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
            listenStruct.prototype.set = function(data) {
                this.targetData = data;
            };

            //获取监听节点数据
            listenStruct.prototype.get = function() {
                return this.targetData;
            };

            //添加监听
            listenStruct.prototype.add = function(fn) {
                this.listens.indexOf(fn) !== -1 || this.listens.push(fn);
            };

            //删除监听
            listenStruct.prototype.remove = function(fn) {
                if (typeof fn === "function") {
                    var index = this.listens.indexOf(fn);
                    return index === -1 ? false : this.listens.splice(this.listens.indexOf(fn), 1)[0];
                } else {
                    this.listens = [];
                }

                //所有监听移除后还原数据原有属性
                if (!this.listens.length && !Object.keys(this.child).length) {
                    //此处主要销毁监听节点
                    destroyListen(this).destroy();
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
                Object.keys(this.child).forEach(function(key) {
                    this.child[key].destroy();
                }.bind(this));

                //删除当前对象所有属性
                Object.keys(this).forEach(function(key) {
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
             * 获取对应的数据
             * @param key
             */
            observer.prototype.get = function(key) {
                key = typeof key === "string" ? key : '';
                return observerProxyStroage[this.sourceId].get(key);
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

            return function(obj) {
                return new observer(obj);
            };
        }(), this);
    }, {}]
}, {}, [6]);