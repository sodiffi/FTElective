var express = require('express');
var router = express.Router();
const mModule = require("./util/module")
const jwt = require('jsonwebtoken')
const path = require('path');
const { v4: uuidv4 } = require('uuid');

var util = require("./util/util")

// 助教登入
router.post('/', async (req, res, next) => {
    try {
        // 驗證使用者，並將驗證成功回傳 
        await mModule.loginA(req.body).then(async(isLogin) => {
            console.log("isLogin", isLogin)
            if (isLogin) {
                let user_id = req.body.id
                // 設定密鑰
                const SECRET = uuidv4()
                // 建立 Token
                var token = jwt.sign({ _id: user_id }, SECRET, { expiresIn: '1 day' })
                // console.log(token,user_id)
                // 存回資料庫
                await mModule.signAuth({ id: user_id, token: token }).then(isSave=>{
                    res.send(util.ret(isLogin, "登入成功", { token: token }))
                },error=>{
                    res.send(util.ret(isLogin, "登入失敗"))
                })

            }
            else {
                res.send(util.ret(isLogin, "登入失敗" ))
            }
            // 回傳該用戶JWT
            // res.send(util.ret(isLogin, "登入成功", { token: token }))
        })

    } catch (err) {
        console.log(err)
        res.status(400).send()
    }
});

router.get("/manage", async (req, res, next) => {

    res.render("manage")
})

router.get("/", async (req, res, next) => {

    res.render("mLogin")
})

router.get("/list", async (req, res, next) => {
    if (util.checkAuth(req)) {
     await mModule.aRecord().then(data=>{
         console.log(data)
        res.send(util.ret(true, "查詢成功", data))
     },error=>{
        res.send(util.ret(false, "查詢失敗"))
     })
    }else{
        res.send(util.ret(false, "查詢失敗"))
    }
  
})

module.exports = router;