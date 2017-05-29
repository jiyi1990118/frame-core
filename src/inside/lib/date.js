/**
 * Created by xiyuan on 17-3-7.
 */
"use strict";

/**
 * 时间转换
 * @param date
 * @param layout
 * @returns {*}
 */
function convert(date,layout) {

    if(typeof date === 'number' || typeof date === 'string'){
        date=new Date(Number(date));
    }

    if(!(date instanceof Date)){
        date=new Date();
    }

    if (typeof layout === "string") {
        date = format(date, layout)
    }
    return date;
};

//获取时间戳
function timestamp(date) {
    return convert(date).getTime();
};

//获取年份
function getFullYear(data) {
    return convert(data).getFullYear();
};

//获取月份
function getMonth(data) {
    return convert(data).getMonth() + 1
};

//获取日
function getDate(data) {
    return convert(data).getDate();
};

//获取时
function getHours(data) {
    return convert(data).getHours();
};

//获取分
function getMinutes(data) {
    return convert(data).getMinutes();
};

//获取秒
function getSeconds(data) {
    return convert(data).getSeconds();
};

/*java时间戳转换*/
function format(data, layout) {
    var time = convert(data);
    var year = time.getFullYear()
    var month = time.getMonth() + 1
    var date = time.getDate()
    var hours = time.getHours()
    var minutes = time.getMinutes() >= 10 ? time.getMinutes() : time.getMinutes();
    var seconds = time.getSeconds()
    if (typeof layout !== "string") {
        layout = year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
    } else {
        layout = layout.replace(/yy/i, year)
        layout = layout.replace(/y/i, String(year).slice(-2))
        layout = layout.replace(/mm/i, month > 9 ? month : '0' + month)
        layout = layout.replace(/m/i, month)
        layout = layout.replace(/dd/i, date > 9 ? date : '0' + date)
        layout = layout.replace(/d/i, date)
        layout = layout.replace(/hh/i, hours > 9 ? hours : '0' + hours)
        layout = layout.replace(/h/i, hours)
        layout = layout.replace(/ii/i, minutes > 9 ? minutes : '0' + minutes)
        layout = layout.replace(/i/i, minutes)
        layout = layout.replace(/ss/i, seconds > 9 ? seconds : '0' + seconds)
        layout = layout.replace(/s/i, seconds)
    }
    return layout;
};

/*添加秒*/
function addMinutes(date, minutes) {
    date = convert(date);
    date.setMinutes(date.getMinutes() + minutes);
    return date;
};

/*获取当前月份有多少天*/
function getMonthCountDate(date) {
    date = convert(date);
    date=new Date(date.getTime());
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    return date.getDate();
};

/*获取第几周*/
function getNowWeek(nowDate) {
    nowDate = convert(nowDate);
    var startDate = new Date(nowDate.getTime());
    startDate.setMonth(0);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    var countDay = (nowDate.getTime() - startDate.getTime()) / 1000 / 60 / 60 / 24 + 1,
        tmpDay = countDay - (8 - startDate.getDay());

    return (tmpDay > 0 ? Math.ceil(tmpDay / 7) : 0) + 1;
};

module.exports={
    convert:convert,
    timestamp:timestamp,
    getFullYear:getFullYear,
    getMonth:getMonth,
    getDate:getDate,
    getHours:getHours,
    getMinutes:getMinutes,
    getSeconds:getSeconds,
    format:format,
    addMinutes:addMinutes,
    getMonthCountDate:getMonthCountDate,
    getNowWeek:getNowWeek
}
