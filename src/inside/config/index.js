/**
 * Created by xiyuan on 17-5-29.
 */
var loadUrlConf=require('./lib/loadUrlConf');

var commData=require('./lib/commData');


module.exports={
    loadUrlConf:loadUrlConf,
    appConf:commData.appConf,
    insideConf:commData.insideConf
}