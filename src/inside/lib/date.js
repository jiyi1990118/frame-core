/**
 * Created by xiyuan on 17-3-7.
 */
"use strict";

var log=require('../log/log');

/**
 * 时间转换
 * @param date
 * @param layout
 * @returns {*}
 */
function convert(date,layout) {

    var matchdata
    switch (typeof date){
        case 'number':
            date=new Date(date);
            break;
        case 'string':
            if(matchdata=Number(date)){
                date=new Date(matchdata);
            }else{
                if(matchdata=date.match(/(\d{2,4})?[-\s\\]*(\d{1,2})?[-\s\\]*(\d{1,2})?\s*(\d{1,2})?[-\s\\:]*(\d{1,2})?[-\s\\:]*(\d{1,2})?/)){
                    date=new Date();
                    matchdata[2] && date.setMonth(Number(matchdata[2])-1);
                    matchdata[3] && date.setDate(matchdata[3]);
                    matchdata[4] && date.setHours(matchdata[4]);
                    matchdata[5] && date.setMinutes(matchdata[5]);
                    matchdata[6] && date.setSeconds(matchdata[6]);
                    //检查是否年份
                    matchdata[2] ? date.setFullYear(matchdata[1]):date.setHours(matchdata[1]);
                }else{
                    log.error('时间转换错误 ['+data+']')
                    return date
                }
            }
            break
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
