/**
 * Created by xiyuan on 17-5-29.
 */

'use strict';
//消息在粗粒度级别上突出强调应用程序的运行过程。
function info(msg) {
    console.info(msg);
}

//警告出现潜在错误的情形
function warn(msg) {
    console.warn(msg);
}

//虽然发生错误事件，但仍然不影响系统的继续运行。
function error(msg) {
    console.error(msg);
}

//与DEBUG 相比更细致化的记录事件消息。
function trace(msg) {
    console.dir(msg)
}

//调试日志
function debug(msg) {
    console.log(msg)
}

//致命的错误
function fatal(msg) {
    throw msg;
}

module.exports={
    info:info,
    warn:warn,
    error:error,
    trace:trace,
    debug:debug,
    fatal:fatal
}