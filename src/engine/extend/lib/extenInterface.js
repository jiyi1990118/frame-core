/**
 * Created by xiyuan on 17-6-8.
 */

var serverEngine=require('../../server/index');

var lib=require('../../../inside/lib/exports');

function extendInterface() {

}

extendInterface.prototype.lib=lib;

extendInterface.prototype.server = function (option) {
    return serverEngine.serverExec(option)
}


module.exports=extendInterface;