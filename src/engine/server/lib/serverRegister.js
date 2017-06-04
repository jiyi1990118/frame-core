/**
 * 服务注册
 * Created by xiyuan on 17-6-4.
 */

var serverComm=require('./serverComm');

function serverRegister(serverType,option) {
    serverComm.serverStroage[serverType]=option;
}


module.exports=serverRegister;