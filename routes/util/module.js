'use strict';

//引用操作資料庫的物件
const query = require('./asyncDB');

//----------------------------------
// 學生登入
//----------------------------------
var login = async function (newData) {
    var result = 0;
    console.log(newData.id, newData.psw)
    await query(`select * from student where id= "${newData.id}" and psw= "${newData.psw} "`)
        .then((data) => {
         
            if (Array.isArray(data)) {
                result = data.length
            }
        }, (error) => {
            result = -1;
        });

    return result;
}
// 助教登入
//----------------------------------
var loginA = async function (newData) {
    var result=false;

    await query(`select * from manager where id= "${newData.id}" and psw= "${newData.psw}" `)
        .then((data) => {
            console.log(data,newData)
            if(Array.isArray(data)){
                result=data.length>0
            }
            
        }, (error) => {
            console.log(error)
            result = false;
        });

    return result;
}

// 助教登入(存回token)
//----------------------------------
var signAuth = async function (newData) {
    var result;
    console.log("enter sign auto", newData)

    await query(`update manager set token= "${newData.token}" where id ="${newData.id}"`)
        .then((data) => {
            console.log(data)
            result = true;
        }, (error) => {
            result = false;
        });

    return result;
}

// 助教驗證
//----------------------------------
var checkAuth = async function (newData) {
    var result;

    await query('select  token from manager  where id ="?"', newData.id)
        .then((data) => {
            result = true;
        }, (error) => {
            result = false;
        });

    return result;
}

// 學生選課紀錄
//----------------------------------
var record = async function (s_id) {
    var result;

    await query(`select e.*,concat(time," ") as time ,r.name as r_name ,s.name as s_name from eletive as e join status as s on s.id=e.status_id join reason as r on r.id=e.reason_id where s_id= "${s_id}"`)
        .then((data) => {
            result = data;
        }, (error) => {
            console.log(error)
            result = -1;
        });

    return result;
}

// 助教選課紀錄
//----------------------------------
var aRecord = async function () {
    var result;

    await query(`select e.*,concat(time," ") as time ,r.name as r_name ,s.name as s_name ,st.system,st.grade,st.name as "st_name",st.class from eletive as e join status as s on s.id=e.status_id join reason as r on r.id=e.reason_id join student as st on e.s_id=st.id`)
        .then((data) => {
            result = data;
        }, (error) => {
            console.log(error)
            result = -1;
        });

    return result;
}
// 助教審核
//----------------------------------
var aCheck = async function (cData) {
    var result;

    await query(`update eletive set status_id=${cData.status_id} , remark="${cData.remark||" "}" where id=${cData.id}`)
        .then((data) => {
            result = data;
        }, (error) => {
            console.log(error)
            result = -1;
        });

    return result;
}
// 加退選申請
//----------------------------------
var eletive = async function (eData) {
    var result;
    // if(eData.certUrl==undefined)
    await query(`insert into eletive(s_id,reason_id,applyUrl,reportUrl,certUrl,time) values("${eData.s_id}", "${eData.reason}", "${eData.applyUrl}", "${eData.reportUrl}", "${eData.certUrl}","${eData.time}")`)
        .then((data) => {
            console.log(data)
            result = 0;
        }, (error) => {
            console.log(error, "erroreee")
            result = -1;
        });

    return result;
}

// 重新加退選申請
//----------------------------------
var rEletive = async function (eData) {
    var result;    
    await query(`update eletive set applyUrl="${eData.applyUrl}", reportUrl= "${eData.reportUrl}", certUrl="${eData.certUrl}" where id=${eData.id}`)
        .then((data) => {
            console.log(data)
            result = 0;
        }, (error) => {
            console.log(error, "erroreee")
            result = -1;
        });

    return result;
}

//----------------------------------

//匯出
module.exports = {
    login, eletive, record, loginA, signAuth, checkAuth, aRecord,aCheck,rEletive
}