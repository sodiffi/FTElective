'use strict';

//引用mysql模組
var mysql = require('mysql2');
var fs = require('fs');
var path = require('path');
const serverCa = [fs.readFileSync(path.resolve("./routes/util/DigiCertGlobalRootCA.crt.pem"), "utf8")];
//建立資料庫連接池
var pool  = mysql.createPool({
    user: "root",
    password: "root",
      host: '127.0.0.1',
          database: 'fet',   
//   user: "adadadmin",
//   password: "adadMinad9",
//     host: 'fet.mysql.database.azure.com',
//     database: 'eletive'     ,
    ssl: {
        rejectUnauthorized: false,
        ca: serverCa
    }
});

//產生可同步執行query物件的函式
function query(sql, value) {
    return new Promise((resolve, reject) => {
        pool.query(sql, value, function (error, results, fields) {
            if (error){
                reject(error);
            }else{
                resolve(results);
            }
        });
    });
}

//匯出
module.exports = query;