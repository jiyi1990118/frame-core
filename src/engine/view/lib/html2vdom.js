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

var string = require('../../../inside/lib/string');

//语法解析
var syntaxStruct = require('./syntaxStruct');

var HTMLParser = (function () {
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

        var index, chars, match, stack = [], last = html, lastTag;

        var specialReplacer = function (all, text) {
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
                var attrs = [], match, name, value;

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
    var obj = {}, items = str.split(",");
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

    HTMLParser(string.HTMLDecode(htmlStr), {
        //标签节点起始
        start: function (tagName, attrs, unary) {
            nowStruct = vdom.vnode(
                tagName,
                {
                    attrsMap: attrs.reduce(function (attrs, current) {
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
                },
                []
            )

            structLevel.push(nowStruct)
            if (unary) {
                this.end();
            }
        },
        //标签节点结束
        end: function () {
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
        chars: function (text) {
            //空字符直接忽略
            if (/^\s+$/.test(text))return

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
                undefined,
                {
                    exps: exps,
                    textExpString:expStr
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
            if (/^\s+$/.test(dom.textContent))return;
            vnode = vdom.vnode(undefined, undefined, undefined, dom.textContent, dom)
            break;
        //Element
        case 1:
            vnode = vdom.node2vnode(dom);
        //DocumentFragment
        case 11:
            vnode = vnode || [];
            dom.childNodes.forEach(function (node) {
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
