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

    return result

}

/**
 * @param {Array} data - The date
 * @param {Array} tolows - The tolow
 * @param {String} forcheck - The id
 */
function toLows(data, tolows, forcheck) {
    let result = []
    let check = -1
    let resu = data[0]
    let lows = {}
    data.forEach((item, index) => {
        if (check != item[forcheck] & index != 0) {

            tolows.forEach(tolow => {
                if (lows[tolow] != []) {
                    resu[tolow] = lows[tolow]
                }
            })
            result.push(resu)
        }
        if (index == 0 | check != item[forcheck]) {
            check = item[forcheck]
            tolows.forEach(tolow => lows[tolow] = [])
            resu = item
        }

        tolows.forEach(tolow => {
            if (tolow in item) {
                lows[tolow].push(item[tolow])
            }
        })
        if (index == data.length - 1) {

            tolows.forEach(tolow => {
                if (lows[tolow] != []) {
                    resu[tolow] = lows[tolow]
                }
            })
            result.push(resu)
        }
    })
    return result

}


//----------------------------------
// 學生登入
//----------------------------------
var login = async function (newData) {

    var result = 0;
    await query(`select *,concat(s.system,s.grade)not in ("五專1","五專2","五專3","五專4","四技1","四技2","四技3","進二技1","日二技1","碩士班1")  as "graduates" from student as s where id= "${newData.id}" and psw= "${newData.psw}"`)
        .then(
            (data) => {
                if (Array.isArray(data)) {
                    result = { isLogin: data.length > 0, d: data }
                }
            }, () => result = -1
        );

    return result;
}
// 助教登入
//----------------------------------
var loginA = async function (newData) {
    var result = false;
    await query(`select * from manager where id= "${newData.id}" and psw= "${newData.psw}" `)
        .then(
            (data) => {
                if (Array.isArray(data)) {
                    result = data.length > 0
                }
            }, () => result = false
        )

    return result;
}

// 助教登入(存回token)
//----------------------------------
var signAuth = async function (newData) {
    return await query(`update manager set token= "${newData.token}" where id ="${newData.id}"`)
        .then(() => true, () => false);


}

// 助教驗證
//----------------------------------
var checkAuth = async function (newData) {
    var result;

    await query('select  token from manager  where id ="?"', newData.id)
        .then(
            (data) => result = true
            , (error) => result = false
        );

    return result;
}

// 學生選課紀錄
//----------------------------------
var record = async function (s_id) {
    var result;

    await query(`select e.*,concat(time," ") as time ,r.name as r_name ,s.name as s_name , c.id as c_id, c.certUrl as c_url, c.checked as c_value from eletive as e left join status as s on s.id=e.status_id left join reason as r on r.id=e.reason_id left join cert as c on e.id=c.e_id where s_id= "${s_id}" order by time desc`)
        .then(
            (data) => result = toLows(data, ["c_url", "c_id", "c_value"], "id")
            , (error) => result = -1
        );

    return result;
}

// 助教選課紀錄
//----------------------------------
var aRecord = async function () {
    var result;

    await query(`select e.*,concat(time," ") as time ,r.name as r_name ,s.name as s_name ,st.system,st.grade,st.name as "st_name",st.class , c.id as c_id, c.certUrl as c_url, c.checked as c_value from eletive as e join status as s on s.id=e.status_id join reason as r on r.id=e.reason_id join student as st on e.s_id=st.id left join cert as c on e.id=c.e_id where st.class ="測" order by time desc`)
        .then(
            (data) => result = toLows(data, ["c_url", "c_id", "c_value"], "id")
            , (error) => result = -1
        );
    return result;
}

// 師長證明下載
//----------------------------------
var cData = async function (cData) {
    var result;
    await query(`SELECT * FROM cert  where e_id ="${cData.id}"`)
        .then(
            (data) => result = data
            , (error) => result = -1
        );
    return result;
}
// 助教審核
//----------------------------------
var aCheck = async function (cData) {
    var result;

    await query(`update eletive set status_id=${cData.status_id} , remark="${cData.remark || " "}" where id=${cData.id}`)
        .then(
            (data) => result = data
            , (error) => result = -1
        );

    return result;
}
/**助教師長證明審核
 * @param {Array} ids - The
 * @param {Array} values - The tolow
 */
var aCheckCert = async function (ids, values) {
    var result;
    var s_sql = ""
    console.log(Array.isArray(ids), Array.isArray(values))
    if (ids.length == values.length) {
        ids.every(async (id, index) => {
            await query(` update cert set checked="${values[index]}" where id="${id}"; `).then((data) => {
                result = data
            }, (error) => {
                result = -1
                return false

            })
        })

    }
    return result
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
    let updateSqls = []
    if ("applyUrl" in eData && eData.applyUrl.length > 6) { updateSqls.push(`applyUrl = "${eData.applyUrl}"`) }
    if ("reportUrl" in eData && eData.reportUrl.length > 6) { updateSqls.push(`reportUrl = "${eData.reportUrl}"`) }
    // let updateSql = [` ${"applyUrl" in eData && eData.applyUrl.length > 6 ? "applyUrl = \"" + eData.applyUrl + "\"" : ""}`, ` ${"reportUrl" in eData && eData.reportUrl.length > 6 ? "applyUrl = " + eData.reportUrl : ""}`].join(" , ")
    let updateSql = updateSqls.join(" , ")

    if ("certUrl" in eData) {

        let addCert = "insert into cert(e_id,certUrl) values"
        let urls = eData.certUrl
        if (Array.isArray(urls)) {
            urls.forEach(item => {
                addCert += ` (${eData.id},"${eData.remotePath}/${item.filename}") ,`
            })
            addCert = addCert.substr(0, addCert.length - 1)

            await query(addCert).then(() => {
                result = 0;
            })
        } else {
            result = 0
        }

    }
    if (updateSql.length > 10) {

        await query(`update eletive set ${updateSql}  where id=${eData.id}`)
            .then((data) => {
                result = 0;
            }, (error) => {

                result = -1;
            });
    } else {

    }
    var result;


    return result;
}

//----------------------------------

//匯出
module.exports = {
    login, eletive, record, loginA, signAuth, checkAuth, aRecord, aCheck, rEletive, cData, aCheckCert
}