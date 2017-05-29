
"use strict";

var utf8=require('./utf8');

var commLib=require('./commLib');

var str2rstr_utf8= utf8.encode;

module.exports=function md5(s) {
    return commLib.rstr2hex(commLib.rstrexports(str2rstr_utf8(s)));
};