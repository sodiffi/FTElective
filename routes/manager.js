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
        await mModule.loginA(req.body).then(async (isLogin) => {
            console.log("isLogin", isLogin)
            if (isLogin) {
                let user_id = req.body.id
                // 設定密鑰
                const SECRET = uuidv4()
                // 建立 Token
                var token = jwt.sign({ _id: user_id }, SECRET, { expiresIn: '1 day' })
                // console.log(token,user_id)
                // 存回資料庫
                await mModule.signAuth({ id: user_id, token: token }).then(isSave => {
                    res.send(util.ret(isLogin, "登入成功", { token: token }))
                }, error => {
                    console.log(error)
                    res.send(util.ret(isLogin, "登入失敗", { error: error }))
                })

            }
            else {
                // console.log()
                res.send(util.ret(isLogin, "登入失敗", { error: "IsLogin=false" }))
            }
            // 回傳該用戶JWT
            // res.send(util.ret(isLogin, "登入成功", { token: token }))
        }, error => {
            console.log(error)
            res.send(util.ret(isLogin, "登入失敗", { errorMsg: "loginAerror", error: error }))
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
// 助教查詢
router.get("/list", async (req, res, next) => {
    if (util.checkAuth(req)) {
        await mModule.aRecord().then(data => {
            res.send(util.ret(true, "查詢成功", data))
        }, error => {
            res.send(util.ret(false, "查詢失敗"))
        })
    } else {
        res.send(util.ret(false, "查詢失敗"))
    }

})

router.get("/token", async (req, res, next) => {
    let code = req.params.code
    // const oauth2Client = new google.auth.OAuth2(
    //     "507719225227-q8k956pm99sblk8sj4fd81u3vrn51uia.apps.googleusercontent.com",
    //     "LL_rTu1AbvSg3p5opLg6GbV_",
    //     ["https://7fb1-115-43-165-47.ngrok.io/ma/token"]
    // );
    // const { tokens } = await oauth2Client.getToken(code)
    console.log(code)
    // oauth2Client.setCredentials(tokens);
    res.send("ok")
})
router.post("/list", async (req, res, next) => {

    // mail.start()
    if (util.checkAuth(req)) {

        await mModule.aCheck(req.body).then(data => {
            res.send(util.ret(true, "審核成功", data))
        }, error => {
            res.send(util.ret(false, "審核失敗"))
        })
    } else {
        res.send(util.ret(false, "審核失敗"))
    }

})

module.exports = router;