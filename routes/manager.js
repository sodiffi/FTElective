var express = require('express');
var router = express.Router();
const mModule = require("./util/module")
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid');
var util = require("./util/util")

//助教畫面
router.get("/manage", async (req, res, next) => res.render("manage"))
//助教登入頁
router.get("/", async (req, res, next) => res.render("mLogin"))

// 助教登入
router.post('/', async (req, res, next) => {
    try {
        // 驗證使用者，並將驗證成功回傳
        await mModule.loginA(req.body).then(async (isLogin) => {
            if (isLogin) {
                let user_id = req.body.id
                // 設定密鑰
                const SECRET = uuidv4()
                // 建立 Token
                var token = jwt.sign({ _id: user_id }, SECRET, { expiresIn: '1 day' })
                // 存回資料庫
                await mModule.signAuth({ id: user_id, token: token }).then(isSave => {
                    res.send(util.ret(isLogin, "登入成功", { token: token }))
                }, error => {
                    res.send(util.ret(isLogin, "登入失敗", { error: error }))
                })
            }
            else {
                res.send(util.ret(isLogin, "登入失敗", { error: "IsLogin=false" }))
            }
            // 回傳該用戶JWT
        }, error => {
            res.send(util.ret(isLogin, "登入失敗", { errorMsg: "loginAerror", error: error }))
        })

    } catch (err) {
        res.status(400).send()
    }
});



// 助教查詢
router.get("/list", async (req, res, next) => {
    if (util.checkAuth(req)) {
        await mModule.aRecord().then(data => {
            res.send(util.ret(true, "查詢成功", data))
        }, error => res.send(util.ret(false, "查詢失敗"))
        )
    } else {
        res.send(util.ret(false, "查詢失敗"))
    }
})

router.get("/token", async (req, res, next) => res.send("ok"))

router.post("/list", async (req, res, next) => {
    if (util.checkAuth(req)) {
        var body = req.body
        await mModule.aCheck(req.body).then(async (data) => {
            if (req.body.hasCert) {
                for (var key in body) {
                    if (String(key).includes("cert_ids")) {
                        if (!Array.isArray(body[key])) {
                            body[key] = [body[key]]
                        }
                        body["cert_ids"] = body[key]
                    }
                    if (String(key).includes("cert_values")) {
                        if (!Array.isArray(body[key])) {
                            body[key] = [body[key]]
                        }
                        body["cert_values"] = body[key]
                    }
                }
                await mModule.aCheckCert(body.cert_ids, body.cert_values).then(data => {
                    res.send(util.ret(true, "審核成功", data))
                }, () => {
                    res.send(util.ret(false, "審核失敗"))
                })
            } else {
                res.send(util.ret(true, "審核成功", data))
            }
        }, () => {
            res.send(util.ret(false, "審核失敗"))
        })
    } else {
        res.send(util.ret(false, "審核失敗"))
    }
})

module.exports = router;