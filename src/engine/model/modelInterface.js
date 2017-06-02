/**
 * Created by xiyuan on 17-6-1.
 */

function modelInterface() {
    
}

/**
 * 调用另一个model
 * @param modelPath
 */
modelInterface.prototype.model=function (modelPath) {
    
}


/**
 * 数据监控
 * @param watchKey
 * @param fn
 * @param isRead
 * @returns {modelInterface}
 */
modelInterface.prototype.watch = function (watchKey, fn ,isRead) {

    return this;
};

/**
 * 移除数据监控
 * @param watchKey
 * @param fn
 * @returns {modelInterface}
 */
modelInterface.prototype.unWatch = function (watchKey, fn) {

    return this;
};

/**
 * model数据写入
 * @param key
 * @param data
 */
modelInterface.prototype.write = function (key, data) {

};

/**
 * 自定义提供方法
 * @param methodName
 * @param fn
 */
modelInterface.prototype.method = function (methodName, fn) {

};

/**
 * 服务请求
 * @param option
 */
modelInterface.prototype.server = function (option) {
    
}