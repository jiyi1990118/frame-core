/**
 * Created by xiyuan on 15-12-4.
 */
$rootElement = $element(window.document);

//根路径
$routeManage.rootPath = $path.cwd;

//根文件
$routeManage.rootFile = $path.file(window.location.href);

//根文件名
$routeManage.rootFileName = $path.fileName(window.location.href);

//项目根路径
$routeManage.rootProjectPath = $path.cwd+($routeManage.rootFile?$routeManage.rootFile+'/':'');

//根路径与项目路径间隔
$routeManage.rootIntervalPath=$routeManage.rootProjectPath.replace($routeManage.rootPath,'');

//路由HASH监听开关
$routeManage.hashListener=true;

//路由记录
$routeManage.history = {
    prev: {
        url: ''
    },
    now: {
        url: ''
    },
    isBack:null
};

var prevInfo = $routeManage.history.prev;
var nowInfo = $routeManage.history.now;

/*路径处理*/
function getPathNormalize(type) {
    var href;
    switch (type){
        case 'html5':
            href = decodeURI(window.location.href.replace($routeManage.rootPath, ''));
            break;
        case 'hash':
            href = decodeURI(window.location.hash.replace(/\#\!\/*/, ''));
            break;
    }
    return href;
};

/*路由监视 （需要在配置加载完毕后执行）*/
$routeManage.routeWatch = function () {

    //检查当前路由模式
    switch ($configStroage.routeModel) {
        case '/':
        case '//':
        case '\\':
        case 'html5':
            $configStroage.html5Mode = {};
            /*监听当窗口历史记录改变。（html5模式的地址）*/
            window.addEventListener('popstate', function (event) {
                //此处做了兼容,避免项目路径与根路径不一样
                $routeManage.assign(getPathNormalize($configStroage.routeModel).replace($routeManage.rootIntervalPath,''));
            }, false);
            break;
        default:
            $configStroage.routeModel = 'hash';
            /*监听当前文档hash改变。（当前hash模式的地址）*/
            window.addEventListener('hashchange', function (e) {
                //检查是否是点击跳转页面的
                if($routeManage.hashListener ){
                    $routeManage.assign(getPathNormalize($configStroage.routeModel));
                }else{
                    $routeManage.hashListener=true;
                }
            }, false);

    }
};

/**
 * 返回上一页
 */
$routeManage.back=function () {
    $routeManage.history.isBack =true;
    window.history.back();
};

/**
 * 页面刷新
 */
$routeManage.refresh=function (url) {
    url=url|| getPathNormalize($configStroage.routeModel);
    //检查当前路由模式
    switch ($configStroage.routeModel) {
        case '/':
        case '//':
        case '\\':
        case 'html5':
            url=getPathNormalize($configStroage.routeModel).replace($routeManage.rootIntervalPath,'')
            break;
    }
    $routeManage.redirect(url,{},true,true);
};

/**
 * 页面重定向
 * @param pagePath
 * @param arg
 */
$routeManage.redirect=function (pagePath,arg,isBack,refresh) {
    pagePath=pagePath.replace(/^\//,'');
    var routeInfo,
        argIndex=0,
        postArg,
        argValue,
        argLen=arguments.length;

    while (++argIndex<argLen && argIndex < 3){
        argValue=arguments[argIndex];
        switch (typeof argValue ){
            case 'object':
                postArg=argValue;
                break;
            default:
                isBack=!!argValue;
                break;
        }
    }

    $routeManage.history.isBack =isBack;

    //路由DNS获取匹配到的路由信息
    $routeManage.assign(pagePath, function (routeInfo) {

        //并检查是否和上一次路径重复
        if(!routeInfo  && !refresh)return;

        pagePath = routeInfo.path;

        //检查当前模式
        if (!$configStroage.html5Mode) {
            //通知hash监听器当前跳转不需要做处理
            $routeManage.hashListener = false;
            $url.hash('!/' + pagePath);

        } else {
            var pageUrl = $path.resolve(pagePath, $routeManage.rootProjectPath);
            //添加新的历史记录
            window.history.pushState({
                "target": pagePath
            }, null, pageUrl);
        }

    },refresh)

};

/*监听点击事件（主要用来监控当前点击的节点是否a标签 页面跳转）*/
window.document.addEventListener('click', function (event) {
    var element = $element(event.target),
        nowInfoUrl=nowInfo.url,
        routeInfo;

    //检查当前点击是否在a标签范围内(主要作用获取a元素)
    while (element.nodeName() !== 'a') {
        if (element[0] === $rootElement[0] || !(element = $element(element.parent())) || !element[0]) return;
    }

    if(element.attr('target'))return

    //检查是否空href,并且包含isBack 则返回上一页
    if(!element.attr('href')){
        element.attr('isBack') !== null &&  window.history.back();
        $routeManage.history.isBack=true;
        return
    }

    //检查是否需要进行重定向
    if (element.attr('rewrite') )return;

    //检查属性标识是否回退
    $routeManage.history.isBack = element.attr('isBack') === null ? false:true;

    //阻止默认的a标签跳转事件
    event.preventDefault();

    //获取跳转的地址
    var href = decodeURI($path.normalize(element.attr('href')).replace(/^\.?[\/\\]/, ''))/*.replace($configStroage.routeSuffix,'')*/;

    //页面重定向
    $routeManage.redirect(href,$routeManage.history.isBack);

}, false);




