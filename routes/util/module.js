'use strict';

//引用操作資料庫的物件
const query = require('./asyncDB');

//----------------------------------
// 學生登入
//----------------------------------
var login = async function (newData) {
    var result;

    await query('select * from student where id= ? and psw= ?', newData.id, newData.psw)
        .then((data) => {
            result = 0;
        }, (error) => {
            result = -1;
        });

    return result;
}
// 學生選課紀錄
//----------------------------------
var record = async function (newData) {
    var result;

    await query('select * from eletice where s_id= ?  ?', newData.s_id)
        .then((data) => {
            result = 0;
        }, (error) => {
            result = -1;
        });

    return result;
}
// 加退選申請
//----------------------------------
var eletive = async function (eData) {
    var result;
    // if(eData.certUrl==undefined)
    await query(`insert into eletive(s_id,reason_id,applyUrl,reportUrl,certUrl) values("${eData.s_id}", "${ eData.reason}", "${eData.applyUrl}", "${eData.reportUrl  }", "${eData.certUrl  }")`)
        .then((data) => {
            console.log(data)
            result = 0;
        }, (error) => {
            console.log(error,"erroreee")
            result = -1;
        });

    return result;
}

//----------------------------------

//匯出
module.exports = {
    login, eletive,record
}