/**
 * Created by xiyuan on 17-6-3.
 */

var URL=require('../../../inside/lib/url');

/**
 * 获取路由路径信息
 * @param requestUrl
 * @returns {{url: *, path: (string|XML), realPath: *, parameter: *, parameterUrl: string}}
 */
function getRoutePathInfo(requestUrl) {

    //提取GET类型参数
    var urlGetParameter = URL.toObject(requestUrl),
        urlGetString = '',
        //提取GET参数字符
        href = requestUrl.replace(/\?[\w\W]*/, function (str) {
            urlGetString = str;
            return '';
        }).replace(/[\/\\]*$/, '');

    return {
        //页面地址
        url:requestUrl,
        //路径
        path:href,
        //真实地址
        realPath:requestUrl,
        //路径中的参数
        parameter:urlGetParameter,
        parameterUrl:urlGetString
    }
}

/*路径处理*/
function getNowPath(type) {
    var href;
    switch (type){
        case 'html5':
            href = decodeURI(window.location.href.replace(routeData.rootPath, ''));
            break;
        case 'hash':
            href = decodeURI(window.location.hash.replace(/\#\!\/*/, ''));
            break;
    }
    return href;
};

module.exports={
    getRoutePathInfo:getRoutePathInfo,
    getNowPath:getNowPath
};