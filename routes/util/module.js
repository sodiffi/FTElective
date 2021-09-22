'use strict';

//引用操作資料庫的物件
const query = require('./asyncDB');
/**
 * @param {Array} data - The date
 * @param {String} tolows - The tolow
 * @param {String} forcheck - The id
 */
function toLow(data, tolows, forcheck) {
    let result = []
    let check = -1
    let tolow = []
    let resu = data[0]
    data.forEach((item, index) => {
        //換資料ㄌ
        if (item[forcheck] != check) {
            //如果不是第一筆或如果是最後一筆
            if (check != -1) {
                resu[tolows] = tolow
                result.push(resu)
                tolow = []
            }

            resu = item
            check = item[forcheck]

        }
        if (tolows in item && item[tolows] != "")
            tolow.push(item[tolows])
    })
    if (tolow != undefined) resu[tolows] = tolow
    result.push(resu)
    // console.log(result)
    return result

}

//----------------------------------
// 學生登入
//----------------------------------
var login = async function (newData) {
    var result = 0;
    await query(`select *,concat(system,grade) in ( "日五專5","日五專6","日五專7","日四技4","日四技5","日四技6","進二技2","進二技3","日二技4","日二技2","日二技3","碩士班4","碩士班3","碩士班2") as "graduates" from student where id= "${newData.id}" and psw= "${newData.psw} "`)
        .then((data) => {
            if (Array.isArray(data)) {
                result = { isLogin: data.length > 0, d: data }
            }
        }, (error) => {
            result = -1;
        });

    return result;
}
// 助教登入
//----------------------------------
var loginA = async function (newData) {
    var result = false;
    await query(`select * from manager where id= "${newData.id}" and psw= "${newData.psw}" `)
        .then((data) => {
            if (Array.isArray(data)) {
                result = data.length > 0
            }

        }, (error) => {
            console.log(error)
            result = false;
        })

    return result;
}

// 助教登入(存回token)
//----------------------------------
var signAuth = async function (newData) {
    var result;

    await query(`update manager set token= "${newData.token}" where id ="${newData.id}"`)
        .then((data) => {
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

    await query(`select e.*,concat(time," ") as time ,r.name as r_name ,s.name as s_name , c.certUrl as c_url from eletive as e join status as s on s.id=e.status_id join reason as r on r.id=e.reason_id left join cert as c on e.id=c.e_id where s_id= "${s_id}" order by time desc`)
        .then((data) => {
            result = data = toLow(data, "c_url", "id")
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

    await query(`select e.*,concat(time," ") as time ,r.name as r_name ,s.name as s_name ,st.system,st.grade,st.name as "st_name",st.class , c.certUrl as c_url from eletive as e join status as s on s.id=e.status_id join reason as r on r.id=e.reason_id join student as st on e.s_id=st.id left join cert as c on e.id=c.e_id where st.class !="測" order by time desc`)
        .then((data) => {

            result = data = toLow(data, "c_url", "id")
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

    await query(`update eletive set status_id=${cData.status_id} , remark="${cData.remark || " "}" where id=${cData.id}`)
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
    var result = -1;

    // if(eData.certUrl==undefined)
    await query(`insert into eletive(s_id,reason_id,applyUrl,reportUrl,time) values("${eData.s_id}", "${eData.reason}", "${eData.applyUrl}", "${eData.reportUrl}" ,"${eData.time}")`)
        .then(async (data) => {
            if (eData.certUrl) {

                await query(`select * from eletive where s_id="${eData.s_id}" order by id desc limit 1 `).then(async (selectData) => {
                    let addCert = "insert into cert(e_id,certUrl) values"
                    let urls = eData.certUrl
                    if (Array.isArray(urls)) {
                        urls.forEach(item => {
                            addCert += ` (${selectData[0].id},"${eData.remotePath}/${item.filename}") ,`
                        })
                        addCert = addCert.substr(0, addCert.length - 1)
                        await query(addCert).then(() => {
                            result = 0;
                        })
                    } else {
                        result = 0
                    }

                })
            } else {
                return 0;
            }
        });

    return result;
}

// 重新加退選申請
//----------------------------------
var rEletive = async function (eData) {
    var result;
    await query(`update eletive set applyUrl="${eData.applyUrl}", reportUrl= "${eData.reportUrl}", certUrl="${eData.certUrl}" where id=${eData.id}`)
        .then((data) => {
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
    login, eletive, record, loginA, signAuth, checkAuth, aRecord, aCheck, rEletive
}