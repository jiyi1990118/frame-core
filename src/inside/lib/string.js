'use strict';

/*字符串处理（与PHP的 trim功能相同）*/
String.prototype.ltrim=function(str){
    if(typeof str === "undefined"){
        return this.replace(/^\s*/,'')
    }
    return this.substr(0,str.length) === str && (this.substr(str.length)) || this;
};

String.prototype.rtrim=function(str){
    if(typeof str === "undefined"){
        return this.replace(/\s*$/,'')
    }
    return this.substr(-str.length) === str && (this.substr(0,this.length-str.length)) || this;
};

String.prototype.trim=function(str){
    return this.ltrim(str).rtrim(str);
};

//html编码
function HTMLEncode(str) {
    var s = "";
    if(str.length == 0) return "";
    s    =    str.replace(/&/g,"&amp;");
    s    =    s.replace(/</g,"&lt;");
    s    =    s.replace(/>/g,"&gt;");
    s    =    s.replace(/ /g,"&nbsp;");
    s    =    s.replace(/\'/g,"&#39;");
    s    =    s.replace(/\"/g,"&quot;");
    return   s;
};

//解码html;
function HTMLDecode(str) {
    var s = "";
    if(str.length == 0)   return "";
    s = str.replace(/&amp;/g,"&");
    s = s.replace(/&lt;/g,"<");
    s = s.replace(/&gt;/g,">");
    s = s.replace(/&nbsp;/g," ");
    s = s.replace(/&#39;/g,"\'");
    s = s.replace(/&quot;/g,"\"");
    return   s;
};

//转换为小写
function manualLowercase(s) {
    /* jshint bitwise: false */
    return isString(s)
        ? s.replace(/[A-Z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) | 32);})
        : s;
};

//转换为大写
function manualUppercase(s) {
    /* jshint bitwise: false */
    return isString(s)
        ? s.replace(/[a-z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) & ~32);})
        : s;
};

//转换为小写
function lowercase(string) {return isString(string) ? string.toLowerCase() : string;};

//转换为大写
function uppercase(string) {return isString(string) ? string.toUpperCase() : string;};

//检测字符大小写转换
if ('i' !== 'I'.toLowerCase()) {
    lowercase =manualLowercase;
    uppercase = manualUppercase;
}

//转换为正则字符
function escapeToRegexp(s) {
    return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
    replace(/\x08/g, '\\x08');
};

module.exports = {
    HTMLEncode:HTMLEncode,
    HTMLDecode:HTMLDecode,
    manualLowercase:manualLowercase,
    manualUppercase:manualUppercase,
    lowercase:lowercase,
    uppercase:uppercase,
    escapeToRegexp:escapeToRegexp
}