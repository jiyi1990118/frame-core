/**
 * Created by xiyuan on 15-11-4.
 *
 * 此包管理器依赖的基础包，并以下顺序加载
 * 1. type
 * 2. object
 * 3. url
 * 4. path
 * 5. jsonp
 *
 */

'use strict';

//jsonp模块，用来处理资源获取
var jsonp=require('../lib/net/jsonp');

//路径处理
var path=require('../lib/path');

var log=require('../log/log');

    var REGEXP = {
        network: /^(http|https|file):\/\//i
    },
    fileSuffix = '.js',                 //资源文件后缀
    includeKeyword = 'require',         //包引入关键字
    rootDir = path.dirname(window.location.href); //项目根路径

//根据框架路径配置解析路径
function ConfigResolve(path, masterUrl) {

    //检查路径配置是否加载
    if ($configStroage) {
        var $src = $configStroage.pathList.src,
            paths = $src.paths,
            sort = $configStroage.pathList.maps.sort,
            sortList = $configStroage.pathList.maps.list,
            key, value, i, l, $i, $l, $value, tmpValue, rflag;
        //路径替换
        path = path.replace(/^\s*\{\s*([^\}\s]+)\s*\}/, function (mate, $1) {
            //检查是否匹配到path路径
            key = paths[$1];
            key = key ? (rflag = true, key) : $1;
            //进一步匹配map映射路径
            i = ~0;
            l = sort.length;
            maps:
                while (++i < l) {
                    value = sortList[sort[i]];
                    $i = ~0;
                    $l = value.length;
                    while (++$i < $l) {
                        $value = value[$i];
                        //进行map匹对
                        if (key.match($value.regexp) && ((tmpValue = key.replace($value.regexp, '')) === '' || tmpValue.indexOf('/') === 0)) {
                            key = $value.value + tmpValue;
                            rflag = true;
                            break maps;
                        }
                    }

                }
            //判断在path或map中是否有匹配
            key = rflag ? key : mate;
            return key;
        });
    }
    //路径常规化（绝对地址）
    return this.normalize((/^\//.test(path) && masterUrl ? this.dirname(masterUrl) : '') + path);
}

function dirname(path) {
    return (path.match(/[^?#]*\//) || [''])[0];
};
function normalize(path) {          // 规范化路径
    path = path.replace(/\/[^/]+\/\.\.\//, "/").replace(/([^:/])\/+\//g, "$1/");
    while (path.match(/\/[^/]+\/\.\.\//)) {
        path = path.replace(/\/[^/]+\/\.\.\//, "/")
    }
    return path.replace(/\/\.\//, '/');
};


/*分析代码中的关键字，并解析出依赖的包*/
function analysisDeps(code, keyword, desp) {
    desp = desp || [];
    return desp;
};

//获取资源
function getResources(Package, PackageStroage) {
    var PackageUrl = Package.id;
    //获取jsonp
    jsonp = jsonp || PackageStroage.getPackage('jsonp').exports;
    var tmpInterface = {
        success: null,
        error: null
    };
    var exports = {
        success: function (callback) {
            tmpInterface.success = callback;
            return exports;
        },
        error: function (callback) {
            tmpInterface.error = callback;
            return exports;
        }
    };

    //通过jsonp方式获取包
    jsonp({
        url: PackageUrl,
        jsonpCallback: 'define',
        init: function (callbackFn) {
            callbackFn.amd = 'amd';
        },
        success: function () {
            //返回的数据处理(检查是否有多个回调)
            if (this.many) {
                var arg = arguments, len = arg.length, i = 0, url = this.option.url, masterPath = path.noSuffix(url), defineArg, childrenPath;
                //添加一对多的资源标识
                Package.many = len;
                Package.exports = {};
                while (len > i) {
                    //参数转换
                    defineArg = handel.prototype.resolveDefineArg(arg[i]);
                    defineArg.modelId = defineArg.alias || i.toString();
                    Package.exports[defineArg.modelId.replace(/^:/, '')] = null;
                    //生成真实独立的包
                    new PackageStruct(defineArg.modelId, PackageStroage, defineArg, Package);
                    i++;
                }
            } else {
                tmpInterface.success && tmpInterface.success(handel.prototype.resolveDefineArg(arguments))
            }
        },
        error:function () {
            $log.warning('[包管理器] 资源:'+PackageUrl+'加载失败!');
            tmpInterface.error && tmpInterface.error(handel.prototype.resolveDefineArg(arguments))
        }
    });

    return exports;

};

/*id生成器*/
function makeId() {
    return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/x/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

function DepsMapHandel(This) {
    //处理被依赖模块
    var masterDepsMap = This.masterDepsMap, master;
    while (masterDepsMap[0]) {
        master = masterDepsMap.shift().master;
        master.depPass();
    }
};

/*包插件存储器*/
function $plugins() {
    this.pluginStroage = [];
}

$plugins.prototype.init = function (oldUrl, url, master) {
    var l = this.pluginStroage.length, i = ~0, v,
        path;
    while (++i < l) {
        v = this.pluginStroage[i];
        if (path = v.handlePath.apply(this, arguments)) {
            return {
                getSource: function (This, callback) {
                    return v.handleFn.call(This, path, callback, This, master);
                },
                getPath: path
            }
        }
    }
};
$plugins.prototype.register = function (option) {
    typeof option === "object" ?
        this.pluginStroage.push({
            pluginName: option.name,
            handlePath: option.pathHandle,
            handleFn: option.sourceHandle
        }) : $log.warning('依赖插件配置错误！');

};
//插件接口
var $packagesPlugins = exports.$packagesPlugins = new $plugins();


/*当前包管理器的包对象存储器*/
function PackageStroage() {
    //包信息存储容器（暂时用不上，一般用于查看初始化顺序）
    this.PackageMap = [];

    //包路径容器（值对应PackageMap的索引）
    this.PackageKeysMap = {};

    //包别名容器
    this.PackageAliasMap = {};

    //任务存储容器
    this.taskMap = [];
};

/*添加包到容器中*/
PackageStroage.prototype.addPackage = function (PackageInfo) {
    this.PackageMap.push(PackageInfo);
    this.PackageKeysMap[PackageInfo.id] = PackageInfo;
};

/*添加别名*/
PackageStroage.prototype.addAlias = function (PackageUrl, alias) {
    this.PackageAliasMap[alias] = PackageUrl;
};

/*获取依赖的包*/
PackageStroage.prototype.getPackage = function (PackageUrl, url, packageInfo, master) {

    var packageResult,
        //路径解析（需新增配置解析）
        oldUrl = ConfigResolve(PackageUrl, url),
        //插件执行过滤
        result = $packagesPlugins.init(oldUrl, url, master);

    if (!result) {
        if (url) {
            //此处检查请求的路径
            PackageUrl = REGEXP.network.test(oldUrl) ? oldUrl : path.resolve(oldUrl, /^\//.test(PackageUrl) ? rootDir : path.resolve(url));
        } else {
            PackageUrl = path.resolve(oldUrl)
        }
        PackageUrl = PackageUrl.replace(/\.js$/, '') + '.js';
    }
    //检查存储器中是否已存在
    packageResult = this.PackageKeysMap[oldUrl] || this.PackageKeysMap[PackageUrl] || (oldUrl = this.PackageAliasMap[oldUrl], this.PackageKeysMap[oldUrl]);

    //返回 包对象|包名称|插件回调方法
    return packageResult || (result ? (packageInfo ? result.getSource : result.getPath) : PackageUrl);
};

/*处理并获取依赖的包*/
PackageStroage.prototype.getHandelPackage = function (PackageUrl, master) {
    //检查当前的master包是否在一对多的包中
    var masterUrl = master.many ? path.dirname(master.id).replace(/\/$/, '') : master.id;
    var Package = this.getPackage(PackageUrl, master.desType == 'Package' ? masterUrl : undefined, null, master);

    //初始化包
    Package = typeof Package === "string" ? new PackageStruct(Package, this, null, master) : Package;

    typeof Package === "function" ? Package(function (Package) {
        handel(Package);
    }) : handel(Package);

    function handel(Package) {
        //依赖的包地址
        master.depsKeys.push(Package.id);

        //待加载的包列表
        master.presMap.push(Package.id);

        //检查当前包的状态
        switch (Package.state) {

            //加载失败
            case 4:

            //加载中
            case 1:

            //加载依赖中
            case 3:

                //添加被依赖的包与任务
                Package.masterDepsMap.push({
                    desType: master.desType,
                    master: master
                });

                break;

            //加载成功的状态
            case 2:

                //当前依赖加载通过
                master.depPass();
                break;

        }
    }
};

/*添加任务到容器中*/
PackageStroage.prototype.addTask = function (taskInfo) {
    this.taskMap.push(taskInfo);
};

/*获取任务*/
PackageStroage.prototype.getTask = function (taskId) {
    var tasks = this.taskMap, len = tasks.length, i = 0;
    while (len > i) {
        if (tasks[i].id == taskId) {
            return tasks[i];
        }
        i++;
    }
    return undefined;
};

/*包结构*/
function PackageStruct(PackageUrl, PackageStroage, local, master) {
    var packageResult;
    //检查此包是否存在
    if (typeof (packageResult = PackageStroage.getPackage(PackageUrl, master ? master.id : undefined, this, master)) === "object")return packageResult;
    if (typeof packageResult === "function") {
        var This = this;
        var callbackFn = function (This) {
            return This;
        };
        packageResult(this, function (PackageUrl, source, deps, sourceType) {
            //包ID
            This.id = PackageUrl;
            var thisPackageArg,sourceArray=[],key,len,defineArg;
            for( key in source){
                sourceArray.push(source[key]);
            }

            key=~0;len=sourceArray.length;
            if(len === 1){
                thisPackageArg=handel.prototype.resolveDefineArg(sourceArray[0]);
            }else{
                while (++key<len){
                    defineArg=handel.prototype.resolveDefineArg(sourceArray[key]);
                    defineArg.modelId = defineArg.alias || key.toString();
                    //生成真实独立的包
                    new PackageStruct(defineArg.modelId, PackageStroage, defineArg, This);
                }
                thisPackageArg={
                    alias: "",
                    deps: [],
                    exports: null,
                    modelId: PackageUrl
                }
            }
            This.__constructor__(PackageStroage, PackageUrl,thisPackageArg , sourceType);

            callbackFn = callbackFn(This);
        });
        //返回包对象回调函数
        return function (fn) {
            typeof callbackFn === "function" ? (callbackFn = fn) : fn(callbackFn);
        };
    }

    //处理真实资源路径（一般用在外部引入一文件内包含多个define）
    if (master && local) {
        var _alias = local.alias || '';
        //别名处理
        local.alias = _alias.charAt(0) == ':' ? _alias.slice(1) : '';
        //地址规范化
        PackageUrl = path.noSuffix(master.id) + '/' + PackageUrl.replace(/^:/, '') + fileSuffix;

        //检查master是否一对多
        master.many && (this.many = master);

    } else {
        //检查库中是否有此包
        if (!local && typeof (PackageUrl = PackageStroage.getPackage(PackageUrl)) !== "string")return;
    }

    //构造包结构
    this.__constructor__(PackageStroage, PackageUrl, local);

    return this;
};

/*依赖类型标记*/
PackageStruct.prototype.desType = 'Package';

PackageStruct.prototype.__constructor__ = function (PackageStroage, PackageUrl, local, fileType) {
    this.PackageStroage = PackageStroage;
    //包ID
    this.id = PackageUrl;

    //资源类型
    this.sourceType = fileType || 'js';

    //被依赖的容器
    this.masterDepsMap = [];

    //包依赖的包地址列表
    this.depsKeys = [];

    //依赖待加载的包列表
    this.presMap = [];

    //依赖待加载计数器
    this.presCount = 0;

    //包输出
    this.exports = null;

    //包状态( 加载中:1　-->　加载依赖:3 --> 加载完毕:2 -->加载失败:4 )
    this.state;

    //初始化
    this.init(PackageStroage, local);
};

/*包初始化*/
PackageStruct.prototype.init = function (PackageStroage, local) {
    var self = this;

    //初始化状态是加载中
    this.state = 1;

    //记录到容器中
    PackageStroage.addPackage(this);

    //加载包资源
    local ? self.loadPass(local, PackageStroage) : getResources(this, PackageStroage).success(function (res) {
        self.loadPass(res, PackageStroage);
    }).error(function (res) {
        self.loadPass(res, PackageStroage);
    });
};

/*解析当前包需要的依赖*/
PackageStruct.prototype.loadPass = function (res, PackageStroage) {
    var deps = res.deps;
    var alias = res.alias;
    this.exports = res.exports;

    alias && PackageStroage.addAlias(this.id, alias);

    //检查依赖
    if (deps && deps.length) {

        //更改当前包的状态为加载依赖包中
        this.state = 3;

        var i = 0, len = deps.length, path;

        //依赖计数器
        this.presCount = len;

        while (len > i) {
            path = deps[i];
            if (path == includeKeyword) {
                //解析依赖的包
                deps = analysisDeps(this.exports, includeKeyword, deps);

                //添加代码中的依赖代码计数
                this.presCount = deps.length - (len - this.presCount);

                len = deps.length;
            }
            //处理并获取依赖的包
            PackageStroage.getHandelPackage(path, this);
            i++;
        }
    } else {
        this.exec();
    }
};

/*加载某个依赖包完成处理*/
PackageStruct.prototype.depPass = function () {
    //被依赖计数器
    this.presCount--;
    this.presCount <= 0 && this.exec();
};

/*包依赖全部加载完毕后处理被依赖（任务及被包的依赖）*/
PackageStruct.prototype.exec = function () {
    //更改当前包的状态为加载完毕
    this.state = 2;

    //检查对外提供的数据类型
    if (tools.isFunction(this.exports)) {
        this.exports = taskStruct.prototype.exec.call(this);
    }

    //处理父对象是一对多many
    if (this.many) {
        var master = this.many;
        if (!--master.many) {
            master.state = 2;
            var key, masterUrl = path.noSuffix(master.id);
            for (key in master.exports) {
                master.exports[key] = master.PackageStroage.getPackage(key, masterUrl + '/').exports;
            }
            DepsMapHandel(master);
        }
    } else {
        DepsMapHandel(this);
    }
};

/*任务结构*/
function taskStruct(exports, deps, PackageStroage) {

    this.PackageStroage = PackageStroage;

    //生成任务ID
    this.id = makeId();

    //任务依赖的包地址列表
    this.depsKeys = [];

    //依赖待加载计数器
    this.presCount = 0;

    //任务待加载的包列表
    this.presMap = [];

    //任务执行体
    this.exports = exports;

    //任务初始化
    this.init(PackageStroage, deps);

    return this;
};

/*依赖类型标记*/
taskStruct.prototype.desType = 'task';

/*任务初始化*/
taskStruct.prototype.init = function (PackageStroage, deps) {

    //记录到容器中
    PackageStroage.addTask(this);

    //检查依赖
    if (deps && deps.length > 0) {
        var i = 0, len = deps.length, path;

        //依赖计数器
        this.presCount = len;
        while (len > i) {
            path = deps[i];
            if (path == includeKeyword) {
                //解析依赖的包
                deps = analysisDeps(this.exports, includeKeyword, deps);

                //添加代码中的依赖代码计数
                this.presCount = deps.length - (len - this.presCount);

                len = deps.length;
            }
            PackageStroage.getHandelPackage(path, this);
            i++;
        }
    } else {
        this.exec();
    }
};

/*任务加载某个依赖包完成*/
taskStruct.prototype.depPass = PackageStruct.prototype.depPass;

/*任务执行*/
taskStruct.prototype.exec = function () {
    var deps = [], depsKeys = this.depsKeys, len = depsKeys.length, i = 0;
    while (len > i) {
        deps.push(this.PackageStroage.getPackage(depsKeys[i]).exports);
        i++;
    }
    return this.exports.apply(this, deps);
};

/*处理器*/
function handel() {
    //创建包存储器
    this.stroage = new PackageStroage();
    return this;
};

/*任务创建*/
handel.prototype.initTask = function () {
    var arg = arguments, len = arg.length, v, f, i = 0, deps = [], exports = function () {
    };
    while (len > i) {
        v = arg[i];
        switch (tools.getType(v)) {
            case 'string':
                f || deps.push(v);
                break;
            case 'function':
                exports = v;
                break;
            case 'array':
                f || (deps = v, f = true);
                break;
        }
        i++;
    }

    return new taskStruct(exports, deps, this.stroage);
};

/*对外开放的包结构*/
handel.prototype.PackageStruct = PackageStruct;

/*define参数解析*/
handel.prototype.resolveDefineArg = function (arg) {
    var len = arg.length, len = len > 3 ? 3 : len,
        i = 0, v, exports, deps, modelId;

    while (len > i) {
        v = arg[i];
        switch (tools.getType(v)) {
            case 'string':
                modelId ? (exports = v) : (modelId = v);
                break;
            case 'array':
                deps = v;
                break;
            case 'object':
                exports = v;
                break;
            case 'function':
                exports = v;
                break;
        }
        i++;
    }

    switch (len) {
        case 1:
            exports = exports || modelId || deps;
            break;
        case 2:
            if (modelId) {
                deps && (exports = deps, deps = []);
            }
            break;
    }
    return {
        deps: deps || [],
        alias: modelId,
        exports: exports
    }
};

exports.$$PackagesInterface = handel;


