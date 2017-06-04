/**
 * Created by xiyuan on 17-5-29.
 */
var loadUrlConf=require('./lib/loadUrlConf');

var commData=require('./lib/commData');

var object=require('../../inside/lib/object');


module.exports={
    loadUrlConf:loadUrlConf,
    appConf:commData.appConf,
    insideConf:commData.insideConf,
    getCoustomConf:function (key) {
        return object.get(commData.customUseConf,key)
    }
}