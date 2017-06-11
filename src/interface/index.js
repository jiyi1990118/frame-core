/**
 * Created by xiyuan on 17-6-11.
 */

var object=require('../inside/lib/object');

var commData=require('../inside/config/lib/commData');

module.exports={
    //虚拟dom
    vdom:require('../engine/view/lib/vdom'),
    //内置方法库
    lib:require('../inside/lib/exports'),
    //获取自定义配置
    getConf:function (key) {
        return object.get(commData.customUseConf,key)
    }
}