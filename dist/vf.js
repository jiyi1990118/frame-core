(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require === "function" && require;
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
    var i = typeof require === "function" && require;
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


        var observer = require('../inside/lib/observer');

        module.exports = {
            observer: observer,
            viewEngin: viewEngine
        }

    }, {
        "../inside/lib/observer": 9,
        "./view/exports": 2
    }],
    2: [function(require, module, exports) {
        /**
         * 视图引擎
         * Created by xiyuan on 17-5-9.
         */
        "use strict";

        //虚拟dom
        var vdom = require('./lib/vdom');

        //语法解析
        var syntaxStruct = require('./lib/syntaxStruct');

        //语法结构处理
        var syntaxHandle = require('./lib/syntaxHandle');

        //html字符转换成虚拟DOM数据结构
        var html2vdom = require('./lib/html2vdom');

        //组件管理
        var compMange = require('./lib/componentMange');

        //指令管理
        var directiveMange = require('./lib/directiveMange');

        /**
         * 视图渲染
         * @param html      html元素 或 html字符串
         * @param scope     [作用域]
         * @param filter    [过滤器]
         */
        function render(html, scope, filter) {
            return html2vdom(html)
        }

        //虚拟Dom或实体Dom销毁
        function destroy(vnode) {

        }


        //对外提供基础接口
        exports.vdom = vdom;
        exports.html2vdom = html2vdom;
        exports.syntaxStruct = syntaxStruct;
        exports.syntaxHandle = syntaxHandle;

        exports.componentMange = compMange;
        exports.directiveMange = directiveMange;

        //对外提供视图渲染接口
        exports.render = render;

        //对外提供视图销毁接口
        exports.destroy = destroy;


    }, {
        "./lib/componentMange": 3,
        "./lib/directiveMange": 4,
        "./lib/html2vdom": 5,
        "./lib/syntaxHandle": 6,
        "./lib/syntaxStruct": 7,
        "./lib/vdom": 8
    }],
    3: [function(require, module, exports) {
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

            this.$api = {
                //作用域
                scope: {

                },
                //过滤器
                filter: {

                },
                //虚拟节点
                vnode: vnode,
                //节点渲染
                render: function() {

                },
                stroage: {

                }

            }

        }

        //监听创建
        compClass.prototype.watchCreate = function(fn) {
            if (fn instanceof Function) this.watchs.create.push(fn);
        }

        //监听渲染
        compClass.prototype.watchRender = function(fn) {
            if (fn instanceof Function) this.watchs.render.push(fn);
        }

        //实例化
        compClass.prototype.init = function() {
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

                if (!attrsMap[propName]) {
                    return console.warn('组件数据属性 ' + propName + ' 未定义!');
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
                if (watchProps.length <= ++propLoad) {
                    isRender = true;
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
                    props.forEach(function(propName) {
                        propHandle(propName);
                    })
                } else if (props instanceof Object) {
                    Object.keys(props).forEach(function(propName) {
                        propHandle(propName, props[propName]);
                    })
                }

                if (watchProps.length) {
                    //进行属性作用域数据获取
                    watchProps.forEach(function(propConf) {
                        var syntaxExample,
                            strcut = syntaxStruct(propConf.exp);

                        //检查表达式是否错误
                        if (!strcut.errMsg) {
                            syntaxExample = syntaxHandle(strcut, extraParameters.assign, extraParameters.filter);

                            //读取表达式返回的值
                            if (!syntaxExample.read(function(newData) {
                                    $api.scope[propConf.key] = newData;
                                    //检查是否自动渲染
                                    if (propConf.autoRender) {
                                        //监听表达式返回的值
                                        syntaxExample.watch(function(newData) {
                                            $api.scope[propConf.key] = newData;
                                            if (isRender) $this.render();
                                        })
                                    }

                                    //检查是否有默认数据 并渲染
                                    if (propConf.hasOwnProperty('default')) {
                                        if (isRender) $this.render();
                                    } else {
                                        renderTrigger();
                                    }

                                })) {
                                //检查是否有默认数据
                                if (propConf.hasOwnProperty('default')) {
                                    $api.scope[propConf.key] = propConf['default'];
                                    renderTrigger();
                                }
                            }

                            // console.log(propConf,strcut,syntaxExample)
                        } else {
                            console.warn('表达式： ' + propConf.exp + '有误！')
                        }

                    })
                    return this;
                }
            } else {
                isRender = true;
                this.render();
            }

        }

        compClass.prototype.render = function() {
            var conf = this.conf,
                vnode = this.vnode;

            //检查是否有渲染的方法
            if (conf.render instanceof Function) {
                vnode.innerVnode = conf.render.call(this.$api, this.$api.vnode, this.$api.scope);
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
                this.watchs.create.forEach(function(create) {
                    create();
                })
            }

            //触发渲染的观察
            this.watchs.render.forEach(function(render) {
                render();
            })

            this.isRender = true;
        }

        //组件获取
        exports.get = function(compName) {
            return compStroage[compName];
        }

        //组件注册
        exports.register = function(compName, compConf) {
            compStroage[compName] = function(vnode, extraParameters) {
                return new compClass(compConf, vnode, extraParameters);
            };
        }
    }, {
        "./syntaxHandle": 6,
        "./syntaxStruct": 7
    }],
    4: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-15.
         */
        // var observer=require('../../../inside/lib/observer');

        //语法解析
        var syntaxStruct = require('./syntaxStruct');

        //语法结构处理
        var syntaxHandle = require('./syntaxHandle');

        var directiveStroage = {};

        //指令类
        function directiveClass(directiveConf, vnode, extraParameters, directiveName) {
            //标识当前节点是指令
            vnode.isDirective = true;

            //指令名称
            this.name = directiveName;

            //表达式
            this.exp = vnode.data.attrsMap[directiveName].value

            //指令实例配置
            this.conf = directiveConf;

            //当前指令虚拟节点
            this.vnode = vnode;

            //指令扩展参数
            this.extraParameter = extraParameters;

            //指令优先级
            this.priority = directiveConf.priority || 0;

            //监听存储
            this.watchs = {
                create: [],
                render: []
            }

            this.$api = {
                //作用域
                scope: directiveConf.scope = directiveConf.scope || {},
                //过滤器
                filter: {},
                //虚拟节点
                vnode: vnode,
                //节点渲染
                render: function() {

                },
                rootScope: vnode.rootScope,
                stroage: {},
                //模板节点
                templateVnode: vnode.clone()

            }
        }

        //监听创建
        directiveClass.prototype.watchCreate = function(fn) {
            if (fn instanceof Function) this.watchs.create.push(fn);
        }

        //监听渲染
        directiveClass.prototype.watchRender = function(fn) {
            if (fn instanceof Function) this.watchs.render.push(fn);
        }

        //实例化
        directiveClass.prototype.init = function() {
            var isRender,
                propLoad = 0,
                $this = this,
                $api = this.$api,
                conf = this.conf,
                vnode = this.vnode,
                data = vnode.data,
                props = conf.props,
                watchProps = [],
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
            Object.keys(extraParameters.scope = extraParameters.scope || {}).forEach(function(sKey) {
                $api.scope[sKey] = extraParameters.scope[sKey];
            })

            //作用域处理合并
            Object.keys(conf.scope = conf.scope || {}).forEach(function(sKey) {
                $api.scope[sKey] = conf.scope[sKey];
            })

            //检查观察的属性 中数据是否完全加载
            if (conf.props) {
                if (props instanceof Function) {
                    props = props.call($api, this.exp);
                    watchProps = watchProps.concat(props)

                    if (watchProps.length) {
                        //进行属性作用域数据获取
                        watchProps.forEach(function(propConf) {
                            var syntaxExample,
                                strcut = syntaxStruct(propConf.exp);

                            //检查表达式是否错误
                            if (!strcut.errMsg) {
                                syntaxExample = syntaxHandle(strcut, extraParameters.scope, extraParameters.filter);

                                //读取表达式返回的值
                                if (!syntaxExample.read(function(newData) {
                                        $api.scope[propConf.key] = newData;

                                        //获取当前值的watchKey
                                        if (propConf.getWatchInfo instanceof Function) {
                                            propConf.getWatchInfo(syntaxExample.getWatchInfo());
                                        }

                                        //检查是否自动渲染
                                        if (propConf.autoRender) {
                                            //监听表达式返回的值
                                            syntaxExample.watch(function(newData) {
                                                $api.scope[propConf.key] = newData;

                                                //获取当前值的watchKey
                                                if (propConf.getWatchInfo instanceof Function) {
                                                    propConf.getWatchInfo(syntaxExample.getWatchInfo());
                                                }

                                                if (isRender) $this.render();
                                            })
                                        }

                                        //检查是否有默认数据 并渲染
                                        if (propConf.hasOwnProperty('default')) {
                                            if (isRender) $this.render();
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
                                };

                                // console.log(propConf,strcut,syntaxExample)
                            } else {
                                console.warn('表达式： ' + propConf.exp + '有误！')
                            }

                        })

                    }


                } else {
                    console.warn('指令配置中props只能为function')
                }
            }
        }

        directiveClass.prototype.render = function() {
            var conf = this.conf,
                vnode = this.vnode;

            //检查是否有渲染的方法
            if (conf.render instanceof Function) {
                vnode.innerVnode = conf.render.call(this.$api, this.$api.vnode, this.$api.scope);
            }

            //标识当前节点是否替换
            vnode.isReplace = conf.isReplace;

            //触发创建的观察
            if (!this.isRender) {
                this.watchs.create.forEach(function(create) {
                    create();
                })
            }

            //触发渲染的观察
            this.watchs.render.forEach(function(render) {
                render();
            })

            this.isRender = true;
        }

        exports.directiveClass = directiveClass;

        //指令获取
        exports.get = function(directiveName) {
            return directiveStroage[directiveName];
        }

        //指令注册
        exports.register = function(directiveName, directiveConf) {
            directiveStroage[directiveName] = function(vnode, extraParameters) {
                return new directiveClass(directiveConf, vnode, extraParameters, directiveName);
            };
        }
    }, {
        "./syntaxHandle": 6,
        "./syntaxStruct": 7
    }],
    5: [function(require, module, exports) {
        /**
         * html字符转虚拟dom数据
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
        "use strict";

        //browser and jsdom compatibility
        var window = window || this;
        var document = window.document;

        //虚拟Dom
        var vdom = require('./vdom');

        //语法解析
        var syntaxStruct = require('./syntaxStruct');

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
         * html字符串转虚拟dom
         * @param htmlStr
         * @returns {Array}
         */
        function str2vdom(htmlStr) {
            var nowStruct,
                eleStruct = [],
                structLevel = [];

            HTMLParser(htmlStr, {
                //标签节点起始
                start: function(tagName, attrs, unary) {
                    nowStruct = vdom.vnode(
                        tagName, {
                            attrsMap: attrs.reduce(function(attrs, current) {
                                var type,
                                    localtion,
                                    modifiers,
                                    attrName = current.name;

                                //获取自定义属性的类型
                                if ((localtion = attrName.indexOf(':')) !== -1) {
                                    type = attrName.slice(localtion + 1);
                                    attrName = attrName.slice(0, localtion) || 'bind';
                                    //获取修饰符
                                    if ((localtion = type.indexOf('.')) !== -1) {
                                        modifiers = type.slice(localtion + 1);
                                        type = type.slice(0, localtion);
                                        modifiers = modifiers.split('.')
                                    }
                                } else {
                                    //获取修饰符
                                    if ((localtion = attrName.indexOf('.')) !== -1) {
                                        modifiers = attrName.slice(localtion + 1);
                                        attrName = attrName.slice(0, localtion);
                                        modifiers = modifiers.split('.')
                                    }
                                }

                                attrs[attrName] = {
                                    type: type,
                                    modifiers: modifiers,
                                    value: current.value,
                                    attrName: current.name
                                };

                                return attrs;
                            }, {})
                        }, []
                    )

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

                    var exps = [],
                        strs = [],
                        expStr;

                    /**
                     * 获取表达式
                     * @param text
                     * @returns {*}
                     */
                    (function findExp(text) {
                        var sid,
                            eid,
                            _str,
                            str = text;

                        if (str.length) {
                            if ((sid = str.indexOf(DelimiterLeft)) === -1 || (eid = str.indexOf(DelimiterRight, sid)) === -1) {
                                exps.push(str);
                                strs.push(str);
                            } else {
                                if (sid) {
                                    _str = str.slice(0, sid);
                                    exps.push(_str);
                                    strs.push(_str);
                                }
                                //截取界定符中的表达式字符
                                expStr = str.slice(sid + DelimiterLeft.length).slice(0, eid - sid - DelimiterLeft.length);
                                //解析表达式
                                exps.push(syntaxStruct(expStr));
                                //剩下的字符
                                findExp(str.slice(eid + DelimiterRight.length));
                            }
                        }
                        return text;
                    })(text)

                    var nowStruct = vdom.vnode(
                        undefined, {
                            exps: exps,
                            textExpString: expStr
                        },
                        undefined,
                        strs.join('')
                    )

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
        }

        /**
         * dom转虚拟Dom
         * @param dom
         */
        function dom2vdom(dom) {
            var vnode;

            switch (dom.nodeType) {
                //Text
                case 3:
                    if (/^\s+$/.test(dom.textContent)) return;
                    vnode = vdom.vnode(undefined, undefined, undefined, dom.textContent, dom)
                    break;
                    //Element
                case 1:
                    vnode = vdom.node2vnode(dom);
                    //DocumentFragment
                case 11:
                    vnode = vnode || [];
                    dom.childNodes.forEach(function(node) {
                        var cvnode = dom2vdom(node);
                        if (cvnode) vnode.children.push(cvnode);
                    })
                    break;
                    //DocumentType
                case 9:
                    console.warn('暂不支持document')
            }
            return vnode;
        }

        /**
         * html 转换成虚拟dom数据结构
         */
        module.exports = vdom.html2vdom = function html2vdom(html) {
            //检查是否dom节点
            return html.nodeName ? dom2vdom(html) : str2vdom(html);
        };

    }, {
        "./syntaxStruct": 7,
        "./vdom": 8
    }],
    6: [function(require, module, exports) {
        /**
         * 语法结构处理
         * Created by xiyuan on 17-5-11.
         */

        "use strict";

        var observer = require('../../../inside/lib/observer');

        //语法值观察专用
        var $ob = function() {
            this.count = 0;
            this.watchCount = 0;
            this.stroage = {};
            this.receiveStroage = [];
        }

        $ob.prototype.watch = function(type) {
            var $this = this,
                stroage = this.stroage;

            this.watchCount++;
            return function(data) {
                //记录值
                stroage[type] = data;

                //计数器
                if (++$this.count === $this.watchCount) {
                    if ($this.receiveStroage.length) {
                        $this.count--;
                        $this.receiveStroage.forEach(function(fn) {
                            fn(stroage)
                        })
                    }
                }
            }
        }

        $ob.prototype.receive = function(fn) {
            var stroage = this.stroage;
            this.receiveStroage.push(fn);

            //检查是否加载完毕
            if (this.watchCount === this.count) {
                this.count--;
                this.receiveStroage.forEach(function(fn) {
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
                    return (val1.value === undefined ? '' : val1.value) + (val2.value === undefined ? '' : val2.value);
                case '-':
                    return val1.value - val2.value;
                case '*':
                    return val1.value * val2.value;
                case '/':
                    return val1.value / val2.value;
                case '%':
                    return val1.value % val2.value;
                    //三元运算
                case '?':
                    return val1.value ? val2.value : val3.value;
                    //成员表达式
                case 'Member':
                    return val1.value[val2.value];
                    //数组表达式
                case 'Array':
                    var arr = [];
                    Object.keys(val1).forEach(function(key) {
                        arr.push(val1[key].value)
                    })
                    return arr;
                    //对象表达式
                case 'Object':
                    var obj = {};
                    Object.keys(val1).forEach(function(key) {
                        obj[key] = val1[key];
                    })
                    return obj;
                    //方法执行
                case 'Call':
                    var call,
                        ags = [];

                    Object.keys(val1).forEach(function(key) {
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

                    Object.keys(val1.value).forEach(function(key) {
                        if (key === 'callee') {
                            return fcall = val1.value[key]
                        }
                        fags.push(val1.value[key]);
                    })
                    return fcall.apply(this, fags);
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
         */
        function analysis(struct, scope, filter, multiple) {
            var $this = this;

            this.reads = [];
            this.watchs = [];
            this.scope = scope;
            this.filter = filter;
            this.observers = [];
            this.multiple = multiple;

            this.lex(struct, function(resData) {
                $this.resData = resData.value;

                //获取监听key
                delete $this.watchInfo;
                if (resData.keys instanceof Array) {
                    $this.watchInfo = {
                        observer: resData.observer,
                        key: resData.keys.join('.')
                    };
                };

                //触发观察
                $this.watchs.forEach(function(fn) {
                    fn(resData.value);
                });

                //触发读取
                $this.reads.forEach(function(fn) {
                    fn(resData.value);
                });
                $this.reads = [];
            });

        }

        //语法结果观察
        analysis.prototype.watch = function(fn) {
            this.watchs.push(fn);
        }

        //移除语法观察
        analysis.prototype.unWatch = function(fn) {
            if (fn && this.watchs.indexOf(fn) !== -1) {
                this.watchs.splice(this.watchs.indexOf(fn), 1)
            } else {
                this.watchs = [];
            }
        }

        //语法结果读取
        analysis.prototype.read = function(fn) {
            //检查返回的数据
            if (this.hasOwnProperty('resData')) {
                fn(this.resData);
            } else {
                this.reads.push(fn);
            }
            return this.resData;
        }

        //语法结果读取
        analysis.prototype.readWatch = function(fn) {
            //检查返回的数据
            if (this.hasOwnProperty('resData')) {
                fn(this.resData);
            }
            this.watchs.push(fn);
            return this.resData;
        }


        //语法结构检查
        analysis.prototype.lex = function(nowStruct, callback, isFilter) {

            var keys,
                _keys,
                obData,
                $this = this,
                ob = new $ob();

            switch (nowStruct.exp) {
                //一元表达式
                case 'UnaryExpression':
                    this.lex(nowStruct.argment, ob.watch('argment'));
                    ob.receive(function(data) {
                        callback({
                            value: operation('$' + nowStruct.operator, data.argment)
                        })
                    })
                    break;
                    //二元表达式
                case 'BinaryExpression':
                    this.lex(nowStruct.left, ob.watch('left'))
                    this.lex(nowStruct.right, ob.watch('right'));

                    ob.receive(function(data) {
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

                    ob.receive(function(data) {
                        callback({
                            value: operation(nowStruct.operator, data.condition, data.accord, data.mismatch)
                        })
                    })
                    break;
                    //成员表达式
                case 'MemberExpression':
                    this.lex(nowStruct.object, ob.watch('object'), isFilter)
                    this.lex(nowStruct.property, ob.watch('property'), nowStruct.computed || 'noComputed');

                    ob.receive(function(data) {
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
                                    data.object.observer.readWatch(_keys = keys, function(newData) {
                                        callback({
                                            value: newData,
                                            observer: data.object.observer,
                                            keys: data.object.keys.concat(data.property.value)
                                        });
                                    });
                                }

                            } else {
                                console.warn('语法对象错误!')
                            }
                        }

                    })
                    break;
                    //数组表达式
                case 'ArrayExpression':
                    //遍历数组元素
                    nowStruct.arguments.forEach(function(args, index) {
                        $this.lex(args, ob.watch(index))
                    })

                    ob.receive(function(data) {
                        callback({
                            value: operation('Array', data)
                        });
                    })
                    break;
                    //对象表达式
                case 'ObjectExpression':
                    nowStruct.property.forEach(function(property) {
                        $this.lex(property.value, ob.watch(property.key.value))
                    })

                    ob.receive(function(data) {
                        var objData = operation('Object', data);
                        obData = observer($this.scope, $this.multiple);

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
                    nowStruct.arguments.forEach(function(args, index) {
                        $this.lex(args, ob.watch(index))
                    })

                    ob.receive(function(data) {
                        callback({
                            value: operation('Call', data)
                        });
                    })
                    break;
                    //过滤器表达式
                case 'FilterExpression':
                    this.lex(nowStruct.callee, ob.watch('callee'), true);

                    if (nowStruct.arguments.length) {
                        //遍历过滤器参数
                        nowStruct.arguments.forEach(function(args, index) {
                            $this.lex(args, ob.watch(index))
                        });
                    } else {
                        this.lex(nowStruct.lead, ob.watch(0));
                    }

                    ob.receive(function(data) {
                        callback({
                            value: operation('Filter', data)
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

                    ob.receive(function(data) {
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
                                    obData = observer(this.scope, this.multiple);
                                    //收集监听对象
                                    $this.observers.push(obData);
                                    //数据读取并监听
                                    obData.readWatch(nowStruct.value, function(newData) {
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

        analysis.prototype.destroy = function() {
            var $this = this;

            //销毁监听对象
            this.observers.forEach(function(obs) {
                obs.destroy();
            });

            Object.keys(this).forEach(function(key) {
                delete $this[key];
            });
        }

        /**
         * 语法结构处理类
         * @param syntaxStruct
         * @param scope
         * @param filter
         */
        function structHandle(syntaxStruct, scope, filter, multiple) {
            var $this = this;
            //语法过滤器
            this.filter = filter;

            //语法作用域
            this.scope = scope || {};
            //语法结构
            this.structRes = new analysis(syntaxStruct, this.scope, filter, multiple);
        }

        //数据分配
        structHandle.prototype.assign = function(key, data) {
            this.scope[key] = data;
        }

        //表达式数据观察
        structHandle.prototype.watch = function(fn) {
            this.structRes.watch(fn)
        }

        //移除表达式数据观察
        structHandle.prototype.unWatch = function(fn) {
            this.structRes.unWatch(fn)
        }

        //获取值的监听key
        structHandle.prototype.getWatchInfo = function() {
            return this.structRes.watchInfo;
        };

        //表达式数据读取
        structHandle.prototype.read = function(fn) {
            return this.structRes.read(fn)
        }

        //表达式数据读取
        structHandle.prototype.readWatch = function(fn) {
            return this.structRes.readWatch(fn)
        }

        structHandle.prototype.destroy = function() {
            var $this = this;
            this.structRes.destroy();
            Object.keys(this.scope).forEach(function(key) {
                delete $this.scope[key]
            })

            Object.keys(this).forEach(function(key) {
                delete $this[key];
            })
        }

        module.exports = function syntaxStructHandle(syntaxStruct, scope, filter, multiple) {
            return new structHandle(syntaxStruct, scope, filter, multiple);
        }
    }, {
        "../../../inside/lib/observer": 9
    }],
    7: [function(require, module, exports) {
        /**
         * 语法解析
         * Created by xiyuan on 17-4-25.
         */
        "use strict";

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
        function syntaxParserClass(code) {
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
        syntaxParserClass.prototype.getSoonAtom = function() {
            var atom = this.soonAtom;
            delete this.soonAtom;
            return atom
        }

        //获取后面的表达式
        syntaxParserClass.prototype.nextExpressionLex = function(atom, isAdopt) {
            this.expStruct = null;
            this.expTemp.valueType = null;
            return this.expressionLex(atom, isAdopt);
        }

        //语法块结束符号添加
        syntaxParserClass.prototype.addBlockEnd = function(symbol) {
            this.expBlockEnd.push(symbol);
            //表达式层级参数
            this.levelArgs.push(this.arguments = []);
        }

        //表达式连接属性获取
        syntaxParserClass.prototype.getExpAttr = function(strcut, isBefore) {
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
        syntaxParserClass.prototype.expConcat = function(strcut, expStruct) {
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
        syntaxParserClass.prototype.expressionLex = function(atom, isAdopt) {
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


        })(syntaxParserClass.prototype);

        //原子扫描
        syntaxParserClass.prototype.atomLex = function() {
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

        })(syntaxParserClass.prototype);


        //检查扫描是否结束
        syntaxParserClass.prototype.eof = function() {
            return this.index >= this.length;
        };

        //错误抛出
        syntaxParserClass.prototype.throwErr = function(msg, atom) {
            this.errMsg = msg;
            atom = atom || this.preAtom;
            console.warn(msg + ' [ 第' + (atom.start + 1) + '个字符 ]');
        }

        //语法缓存
        var syntaxCache = {};

        module.exports = function syntaxParser(code) {
            //获取缓存
            var syntaxStruct = syntaxCache[code];
            if (!syntaxStruct) {
                //无缓存则解析，并放入缓存
                syntaxStruct = new syntaxParserClass(code);
                syntaxCache[code] = syntaxStruct.expStruct;

                //销毁对象
                Object.keys(syntaxStruct).forEach(function(key) {
                    delete syntaxStruct[key];
                })
                syntaxStruct = syntaxCache[code];
            }
            return syntaxStruct;
        }
    }, {}],
    8: [function(require, module, exports) {
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
                referenceNode = referenceNode instanceof Array ? referenceNode[0] : referenceNode;
                newNode instanceof Array ? newNode.forEach(function(child, key) {
                    parentNode.insertBefore(child, referenceNode);
                }) : parentNode.insertBefore(newNode, referenceNode);
            },
            removeChild: function removeChild(node, child) {
                child instanceof Array ? child.forEach(function(child) {
                    node.removeChild(child);
                }) : node.removeChild(child);
            },
            appendChild: function appendChild(node, child) {
                child instanceof Array ? child.forEach(function(child) {
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
                Object.keys(obj).forEach(function(key) {
                    newObj[key] = objectclone(obj[key])
                })
            } else {
                newObj = obj;
            }
            obj = undefined;
            return newObj;
        }

        //虚拟节点对象
        function $vnode(conf) {
            var $this = this;

            //配置继承
            Object.keys(conf).forEach(function(key) {
                $this[key] = conf[key];
            })
        }

        //节点克隆
        $vnode.prototype.clone = function() {
            var conf = {},
                scope = {},
                children = [],
                innerVnode = [],
                $this = this;

            var pros = ['$scope', 'children', 'elm', 'isShow', 'key', 'sel', 'tag', 'text', 'rootScope'];

            //收集所有的属性
            pros.forEach(function(key) {
                if ($this.hasOwnProperty(key)) {
                    conf[key] = $this[key];
                }
            })

            if (this.innerVnode instanceof Array && this.innerVnode.length) {
                // if(this.isReplace)conf.isReplace=true;
                //遍历并克隆内部节点
                this.innerVnode.forEach(function(ch) {
                    innerVnode.push(ch.clone())
                })
                conf.innerVnode = innerVnode;
            } else if (conf.elm instanceof Array) {
                conf.elm = undefined;
            }

            conf.data = function(data) {
                var tmp = {};
                Object.keys(data).forEach(function(key) {
                    tmp[key] = data[key];
                })
                return tmp;
            }($this.data);


            //检查是否文本 并克隆文本表达式
            if (isUndef(this.sel) && this.data && this.data.exps) {
                conf.data.exps = [];
                Object.keys(this.data.exps).forEach(function(key) {
                    conf.data.exps[key] = $this.data.exps[key];
                })
            }

            //继承作用域
            Object.keys($this.$scope || {}).forEach(function(key) {
                scope[key] = $this.$scope[key];
            })
            conf.$scope = scope;

            //继承中间作用域
            conf.middleScope = this.middleScope.concat();

            if (this.children) {
                this.children.forEach(function(ch) {
                    children.push(ch.clone())
                })
            }

            conf.children = children;
            conf.isClone = true;

            return new $vnode(conf);
        }

        //节点作用域传递
        $vnode.prototype.scope = function(scope) {
            var $this = this;
            if (scope instanceof Object) {
                Object.keys(scope).forEach(function(key) {
                    $this.$scope[key] = scope[key];
                })
            }
        }

        //将观察的数据转换成作用域
        $vnode.prototype.observerToScope = function(watchData, watchKey, scopeKey) {
            var $this = this,
                ob = observer(watchData);
            ob.readWatch(watchKey, function(data) {
                $this.$scope[scopeKey] = data;
            });
            return ob;
        }

        //节点销毁
        $vnode.prototype.destroy = function(type) {
            var $this = this;

            //检查是否文本
            if (isUndef(this.sel) && this.data && this.data.exps) {
                switch (type) {
                    case 'elm':
                        break;
                    default:
                        Object.keys(this.data.exps).forEach(function(key) {
                            if ($this.data.exps[key] instanceof Object) {
                                $this.data.exps[key].destroy();
                            }
                            delete $this.data.exps[key];
                        })
                }

                //销毁文本表达式
                ;
                (this.data.exps || []).forEach(function(exp, index) {
                    if (exp.structRes) {
                        exp.destroy();
                    }
                    delete $this.data.exps[index];
                });

            }

            if (this.elm) {
                if (this.elm instanceof Array) {
                    this.innerVnode.forEach(function(vnode, index) {
                        delete $this.elm[index];
                        delete $this.innerVnode[index];
                        vnode.destroy(type);
                    })

                } else if (this.elm.parentNode) {
                    //销毁子节点
                    if (this.children) {
                        this.children.forEach(function(ch, index) {
                            delete $this.children[index];
                            ch.destroy(type);
                        })
                    }

                    switch (type) {
                        case 'elm':
                            break;
                        default:
                            htmlDomApi.removeChild(this.elm.parentNode, this.elm);
                    }
                }
            }

            if (type !== 'elm') {
                Object.keys(this.$scope || {}).forEach(function(key) {
                    delete $this.$scope[key];
                })
            }

            Object.keys(this.data || {}).forEach(function(key) {
                delete $this.data[key];
            })

            Object.keys(this).forEach(function(key) {
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
        function rearrangePatch(newVnode, oldVnode, parentElm) {
            htmlDomApi.insertBefore(parentElm, newVnode.elm, oldVnode.elm);
            oldVnode.destroy();
        }

        //重新摆放列表元素
        function rearrangeElm(vnodeList) {
            var parentNode,
                nowEle,
                elmContainer = document.createDocumentFragment();

            vnodeList.forEach(function(vnode) {
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
            hooks.forEach(function(hookName) {
                cbs[hookName] = [];
                modules.forEach(function(module) {
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
            function createElm(vnode, insertedVnodeQueue, callback, extraParameters, parentNode) {
                var i,
                    isRearrange,
                    oldVnode,
                    data = vnode.data || {},
                    initCount = cbs.init.length,
                    children = vnode.children,
                    sel = vnode.sel;

                //检查并传递作用域
                if (Object.keys(vnode.rootScope).length && extraParameters.scope !== vnode.rootScope) {
                    Object.keys(extraParameters.scope).forEach(function(key) {
                        vnode.$scope[key] = extraParameters.scope[key];
                    })
                } else {
                    vnode.rootScope = extraParameters.scope;
                }

                //由父节点传递作用域给子级
                if (parentNode instanceof Object) {
                    vnode.middleScope.concat(parentNode.middleScope);
                    Object.keys(parentNode.$scope || {}).length && vnode.middleScope.push(parentNode.$scope)
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

                    if (initCount && --initCount) return

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
                                if (vnode.elm && vnode.elm.length) {
                                    patch(oldVnode, vnode, vnode.rootScope, extraParameters.filter, parentNode);
                                    //销毁对象但不销毁元素
                                    oldVnode.destroy('elm');
                                    oldVnode = vnode.clone();
                                    console.log(vnode, '????')
                                    return
                                } else {
                                    vnode.elm = [];
                                    vnode.innerVnode.forEach(function(ch) {

                                        createElm(ch, insertedVnodeQueue, function(ch, isRearrange) {

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
                            var elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, vnode.tag) :
                                api.createElement(vnode.tag);

                            if (vnode.id) elm.id = vnode.id;
                            if (vnode.className) elm.className = vnode.className;

                            //触发model中的create 钩子
                            cbs.create.forEach(function(createHook) {
                                createHook(emptyNode, vnode)
                            })

                            //检查子元素 并递归创建子元素真实Dom
                            if (isArray(children)) {
                                children.forEach(function(ch) {
                                    if (ch instanceof Object) {
                                        var oldVnode;
                                        createElm(ch, insertedVnodeQueue, function(ch, isRearrange) {
                                            if (isRearrange) {
                                                // console.log(velm,'??????????????//',ch,oldVnode,vnode)
                                                rearrangePatch(ch, oldVnode, vnode.elm);
                                            } else {
                                                api.appendChild(elm, ch.elm);
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

                                function concatTextExp(exps) {
                                    var texts = [];
                                    exps.forEach(function(exp, index) {
                                        if (exp instanceof Object) {
                                            if (exp.structRes.resData !== undefined) texts.push(exp.structRes.resData);
                                        } else {
                                            texts.push(exp);
                                        }
                                    })
                                    return texts.join('');
                                }

                                exps.forEach(function(exp, index) {
                                    if (exp instanceof Object) {
                                        //收集作用域
                                        var scopes = [vnode.rootScope].concat(vnode.middleScope);
                                        scopes.push(vnode.$scope);

                                        //表达式监听
                                        (exps[index] = syntaxHandle(exp, scopes, {}, true)).readWatch(function(data) {
                                            // console.log('this is text ', data, vnode.$scope);
                                            //检查文本是否以存在 则重新合并文本内容
                                            if (text) {
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
                    oldVnode = vnode.clone();

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
                cbs.init.forEach(function(initHook) {
                    initHook(vnode, initCreate, extraParameters)
                })
            }

            //创建新的虚拟节点
            function addVnodes(parentVnode, before, vnodes, startIdx, endIdx, insertedVnodeQueue, extraParameters) {
                var parentElm = parentVnode.elm;

                vnodes.slice(startIdx, endIdx + 1).forEach(function(ch) {
                    if (ch instanceof Object) {
                        var oldVnode;
                        createElm(ch, insertedVnodeQueue, function(ch, isRearrange) {
                            if (isRearrange) {
                                rearrangePatch(ch, oldVnode, parentElm);
                            } else {
                                api.appendChild(parentElm, ch.elm, before);
                            }
                            oldVnode = ch.clone();
                        }, extraParameters, parentVnode);
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
                    cbs.destroy.forEach(function(destroyHook) {
                        destroyHook(vnode);
                    })

                    if (isDef(vnode.children)) {
                        //触发子元素的销毁钩子
                        vnode.children.forEach(function(children) {
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
                            rm = createRmCb(ch, listeners);

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
                            (function(newStartVnode) {
                                var oldVnode;
                                createElm(newStartVnode, insertedVnodeQueue, function(ch, isRearrange) {
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
                                (function(newStartVnode) {
                                    var oldVnode;
                                    createElm(newStartVnode, insertedVnodeQueue, function(ch, isRearrange) {
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
                if (oldEndIdx === newEndIdx) return;

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
            function patchVnode(oldVnode, vnode, insertedVnodeQueue, extraParameters, parentVnode) {
                var i, hook;

                console.log(oldVnode, '>>>>>>>>>>>>>>>>>', vnode)

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

                        function concatTextExp(exps) {
                            var texts = [];
                            exps.forEach(function(exp, index) {
                                if (exp instanceof Object) {
                                    if (exp.structRes.resData !== undefined) texts.push(exp.structRes.resData);
                                } else {
                                    texts.push(exp);
                                }
                            })
                            return texts.join('');
                        }

                        vnode.rootScope = extraParameters.scope;

                        //继承作用域
                        if (parentVnode) {
                            Object.keys(parentVnode.$scope || {}).length && vnode.middleScope.push(parentVnode.$scope)
                        }

                        //语法解析监听
                        exps.forEach(function(exp, index) {
                            if (exp instanceof Object) {
                                //收集作用域
                                var scopes = [vnode.rootScope].concat(vnode.middleScope);
                                scopes.push(vnode.$scope);
                                //表达式监听
                                (exps[index] = syntaxHandle(exp, scopes, {}, true)).readWatch(function(data) {
                                    // console.log('this is text ', data, vnode.$scope);
                                    //检查文本是否以存在 则重新合并文本内容
                                    if (text) {
                                        text = concatTextExp(exps);
                                        if (vnode.text !== text) {
                                            api.setTextContent(vnode.elm, vnode.text = text);
                                        }
                                    }
                                });
                            }
                        });

                        text = vnode.text = concatTextExp(exps);
                        api.setTextContent(elm, vnode.text)

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
            return function patch(oldVnode, Vnode, scope, filter, parentVnode) {
                scope = scope || {};

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


                            console.log(oldVnode, Vnode, '????-----', parentVnode)
                        } else {
                            parent = api.parentNode(elm)
                        }
                    }

                    //检查是否有父节点
                    if (parentVnode || parent) {
                        if (parentVnode) {
                            if (!parentVnode.elm) parentVnode.elm = parent;
                        }
                        parentVnode = parentVnode || {
                            elm: parent
                        };
                        //更新子节点
                        updateChildren(parentVnode, oldVnode.innerVnode, Vnode.innerVnode, insertedVnodeQueue, extraParameters);
                        //移除旧元素
                        // removeVnodes(parent, [oldVnode], 0, 0);
                    } else {
                        Vnode.elm = [];
                        Vnode.innerVnode.forEach(function(ch) {
                            createElm(ch, insertedVnodeQueue, function(ch, isRearrange) {
                                Vnode.elm = Vnode.elm.concat(ch.elm)
                            }, extraParameters, Vnode)

                        })
                    }

                    //常规情况
                } else {
                    if (Vnode instanceof Array) {

                        elm = oldVnode.elm;
                        parent = api.parentNode(elm);

                        //创建新节点
                        Vnode.forEach(function(Vnode) {

                            var oldVnode;
                            //创建新节点
                            createElm(Vnode, insertedVnodeQueue, function(ch, isRearrange) {
                                if (isRearrange) {
                                    rearrangePatch(ch, oldVnode, parent);
                                } else {
                                    //新增节点到父元素容器中
                                    api.insertBefore(parent, Vnode.elm, api.nextSibling(elm));
                                }
                                oldVnode = ch.clone();
                            }, extraParameters);
                        })

                        if (parent !== null) {
                            //移除旧元素
                            removeVnodes(parent, [oldVnode], 0, 0);
                        }

                    } else {
                        if (!(Vnode instanceof Object)) return oldVnode;

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
                            if (Object.keys(Vnode.rootScope).length) {
                                Object.keys(scope).forEach(function(key) {
                                    Vnode.$scope[key] = scope[key];
                                })
                            } else {
                                Vnode.rootScope = scope;
                            }
                            //节点修补
                            patchVnode(oldVnode, Vnode, insertedVnodeQueue, extraParameters);
                        } else {
                            elm = oldVnode.elm;
                            parent = api.parentNode(elm);

                            //创建新节点
                            createElm(Vnode, insertedVnodeQueue, function(ch, isRearrange) {
                                var _oldVnode;
                                if (parent !== null) {
                                    if (isRearrange) {
                                        rearrangePatch(ch, _oldVnode, parent);
                                    } else {
                                        //新增节点到父元素容器中
                                        api.insertBefore(parent, Vnode.elm, api.nextSibling(elm));
                                        //移除旧元素
                                        removeVnodes(parent, [oldVnode], 0, 0);
                                    }
                                    _oldVnode = ch.clone();
                                }
                            }, extraParameters);
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
                            compExample.watchCreate(function() {
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
                    compExample.watchRender(function() {
                        initCall();
                        isInitCall = true;
                    })
                } else {
                    isInitCall = true;
                }

                //指令检查
                Object.keys(attrsMap).forEach(function(attrName) {
                    var directorieExample,
                        directorieClass = directorieMange.get(attrName);

                    //检查是否是指令
                    if (directorieClass) {
                        directorieExample = directorieClass(vnode, extraParameters);
                        //存入实例队列
                        handleExampleQueue.push(directorieExample);
                        //观察指令渲染
                        directorieExample.watchRender(function() {
                            if (isInitCall) initCall();
                        })
                    } else {
                        //如果不是指令则写入属性
                        attrs[attrName] = attrsMap[attrName].value;
                    }
                })

                if (handleExampleQueue.length) {
                    //根据优先级摆放处理队列
                    handleExampleQueue = handleExampleQueue.sort(function(before, after) {
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
            isVnode: isVnode,
            domApi: htmlDomApi,
            node2vnode: emptyNodeAt
        };

    }, {
        "../../../inside/lib/observer": 9,
        "./componentMange": 3,
        "./directiveMange": 4,
        "./syntaxHandle": 6
    }],
    9: [function(require, module, exports) {
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
                key = (String(key) || '').replace(/^\[([^.\]]+)\]|^\.?([^.\[\]]+)/, function(str, arrKey, objKey) {
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
                //监听数据读取的回调集合
                this.listensRead = [];
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
                        //标识有数据
                        this.isData = this.targetData !== undefined;
                    }
                } else {
                    this.targetData = parentListen;
                    //标识有数据
                    this.isData = parentListen !== undefined;
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

                //检查是否变化
                if (!isEqual) {
                    //标识有数据
                    this.isData = true;

                    //还原旧数据的属性
                    //检查当前数据属性 后面是否修改
                    if (this.topListen && oldParentData !== this.parentData && Object.getOwnPropertyDescriptor(oldParentData, this.nowKey) && Object.getOwnPropertyDescriptor(oldParentData, this.nowKey).set !== this.prevDefineProperty.set) {
                        this.topListen.berforDefineProperty = this.prevDefineProperty;
                    } else {
                        if (oldParentData) this.prevDefineProperty && Object.defineProperty(oldParentData, this.nowKey, this.prevDefineProperty);
                    }

                    //触发监听
                    this.listens.forEach(function(fn) {
                        fn(newData, oldData);
                    });

                    //触发数据读取监听
                    this.listensRead.forEach(function(fn) {
                        fn(newData, oldData);
                    });
                    this.listensRead = [];

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

            //添加监听
            listenStruct.prototype.addRead = function(fn) {
                this.listensRead.indexOf(fn) !== -1 || this.listensRead.push(fn);
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

            //删除read监听
            listenStruct.prototype.removeRead = function(fn) {
                if (typeof fn === "function") {
                    var index = this.listensRead.indexOf(fn);
                    return index === -1 ? false : this.listensRead.splice(this.listens.indexOf(fn), 1)[0];
                } else {
                    this.listensRead = [];
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
                var $this = this;
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

                //检查数据 是否需要归原
                if (!this.isData) {
                    delete this.parentData[this.nowKey];
                }

                //销毁子节点
                this.child && Object.keys(this.child).forEach(function(key) {
                    $this.child[key].destroy();
                });

                //删除当前对象所有属性
                Object.keys(this).forEach(function(key) {
                    delete $this[key];
                })
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

            /**
             * 数据读取
             * @param key
             * @param fn
             */
            observerProxy.prototype.read = function(key, fn) {

                var resData,
                    parentListen = this.listen,
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
                        resData = parentListen.targetData;
                        //检查是否有数据 并触发回调
                        if (parentListen.isData) {
                            fn(resData);
                        } else {
                            parentListen.addRead(fn);
                        }
                    }
                    return nextKey;
                });

                return resData;
            }

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

            /**
             * 读取并监听数据
             * @param key
             * @param fn
             */
            observerProxy.prototype.readWatch = function(key, fn) {
                var resData,
                    parentListen = this.listen,
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
                        resData = parentListen.targetData;
                        //检查是否有数据 并触发回调
                        if (parentListen.isData) fn(resData);
                    }
                    return nextKey;
                });

                return resData;
            }

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

            //删除数据读取监听
            observerProxy.prototype.removeRead = function(key, fn) {
                var parentListen = this.listen;
                recursionKey(key, function(nowKey, nextKey) {
                    if (nowKey) {
                        parentListen = parentListen.getChild(nowKey)
                    }
                    if (!(nowKey && nextKey)) {
                        parentListen && parentListen.removeRead(fn);
                    }
                    return nextKey;
                })
            }

            //监听销毁
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
             * 根据key读取数据
             * @param key
             * @param fn
             */
            observer.prototype.read = function(key, fn) {
                return observerProxyStroage[this.sourceId].read(key, fn);
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
             * 读取并监听数据
             * @param watchKey
             * @param watchFn
             */
            observer.prototype.readWatch = function(watchKey, watchFn) {
                return observerProxyStroage[this.sourceId].readWatch(watchKey, watchFn);
            }

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
             * 移除数据读取监听
             * @param key
             * @param fn
             */
            observer.prototype.unRead = function(key, fn) {
                observerProxyStroage[this.sourceId].removeRead(key, fn);
            }

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


            //多数据监听
            function multipleOb(objs) {
                //检查是否监听对象
                if (objs instanceof multipleOb || objs instanceof observer) return objs;
                objs = objs.reverse();

                //存放资源数据
                observerProxyStroage[this.sourceId = uid()] = {
                    resource: objs,
                    ob: objs.reduce(function(arr, val) {
                        arr.push(new observer(val));
                        return arr;
                    }, [])
                };
            }

            //数据读取
            multipleOb.prototype.read = function(key, fn) {
                var resData,
                    objs = observerProxyStroage[this.sourceId];

                function remove() {
                    objs.ob.forEach(function(ob) {
                        ob.unRead(key)
                    })
                }

                objs.ob.forEach(function(ob) {
                    ob.read(key, function(res) {
                        resData = res;
                        remove();
                        fn.call(this, res)
                    })
                })
            };

            //数据监听
            multipleOb.prototype.watch = function(watchKey, watchFn) {
                var objs = observerProxyStroage[this.sourceId];
                objs.ob.forEach(function(ob) {
                    ob.watch(watchKey, watchFn);
                });
            };

            //数据监听并读取
            multipleOb.prototype.readWatch = function(watchKey, watchFn) {
                var isRead,
                    watchQueue = [],
                    objs = observerProxyStroage[this.sourceId];

                function remove(index) {
                    var ob;
                    //移除监听队列
                    while (watchQueue.length > index) {
                        ob = watchQueue[index];
                        //移除队列
                        watchQueue.pop();
                        ob.unRead(watchKey);
                        ob.unWatch(watchKey);
                    }
                }

                objs.ob.forEach(function(ob, index) {
                    if (isRead) return;

                    watchQueue.push(ob);
                    //监听数据
                    ob.readWatch(watchKey, function(resData) {
                        watchFn.call(this, resData);
                        if (isRead) return;
                        remove(index + 1);
                        isRead = true;
                    });
                });

            };

            //移除监听
            multipleOb.prototype.unWatch = function(watchKey, watchFn) {
                var objs = observerProxyStroage[this.sourceId];
                objs.ob.forEach(function(ob) {
                    ob.unWatch(watchKey, watchFn);
                });
            };

            //获取对应的数据
            multipleOb.prototype.get = function(key) {
                var i = ~0,
                    resData,
                    objs = observerProxyStroage[this.sourceId],
                    l = objs.ob.length;

                while (++i < l) {
                    if (resData = objs.ob[i].get(key)) {
                        return resData;
                    }
                }
            };

            //销毁数据监听
            multipleOb.prototype.destroy = function() {
                var $this = this,
                    objs = observerProxyStroage[this.sourceId];
                objs.ob.forEach(function(ob) {
                    ob.destroy();
                });

                //删除当前对象所有属性
                Object.keys(this).forEach(function(key) {
                    delete $this[key];
                })

                delete observerProxyStroage[this.sourceId];
            };

            return function(obj, multiple) {
                if (multiple === true && obj instanceof Array) {
                    return new multipleOb(obj);
                } else {
                    return new observer(obj);
                }
            };
        }(), this);
    }, {}],
    10: [function(require, module, exports) {
        /**
         * Created by xiyuan on 17-5-9.
         */
        (function(vf) {
            if (typeof define === "function" && define.cmd) {
                define(function() {
                    return vf;
                })
            } else {
                this.vf = vf();
            }
        })(function() {
            return require('./engine/exports');
        })
    }, {
        "./engine/exports": 1
    }]
}, {}, [10]);