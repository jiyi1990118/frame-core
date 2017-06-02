/**
 * Created by xiyuan on 17-6-2.
 */

var getSource=require('../../../inside/source/getSource');
var sourcePathNormal=require('../../../inside/source/sourcePathNormal');

function viewSourc(viewInfo,originInfo,callback) {

    var viewPathInfo=sourcePathNormal(viewInfo.view,originInfo,'view');

    getSource(viewPathInfo, {
        mode:'view',
        suffix:viewInfo.tplSuffix,
        isAjax:viewInfo.requireType === 'ajax'
    },function (source) {
        if(source === false){
            log.error('视图文件 ['+this.responseURL+']缺失！');
            return;
        }
        //资源回调
        callback(source);
    })
}

module.exports=viewSourc;