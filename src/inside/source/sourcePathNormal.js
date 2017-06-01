/**
 * 转换真实资源路径
 * Created by xiyuan on 17-6-1.
 */

var appConf=require('../config/lib/commData').appConf;

/**
 * 转换真实资源路径
 * @param url
 * @param mode
 * @param isAjax
 */
function sourcePathNormal(url,mode,isAjax) {

    //模式目录名称
    var modePath=appConf.system.moduleDirName[mode];

    url.replace('@',modePath);

    if(isAjax){
        url.replace(':','/');
    }




}


module.exports = sourcePathNormal;