var express = require('express');
var router = express.Router();
const path = require('path');
const mModule = require("./util/module")
const util = require("./util/util")

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

// 登入
router.post('/', async (req, res, next) => {
  data = await mModule.login(req.body)
  let msg = data.isLogin ? "登入成功" : "登入失敗"
  res.send(util.ret(data.isLogin, msg, data.d))
});


// 下載檔案
router.get('/download/:fileName', function (req, res) {
  var file = path.join(__dirname, "../uploads/", req.params.fileName)
  res.download(file);
});

// 取師長證明
router.get('/cdata/list', function (req, res) {
  mModule.cData({ "id": req.query.id }).then(resu => {
    res.send(util.ret(resu.success !== -1, resu.success !== -1 ? "查詢成功" : "查詢失敗", resu))
  })
});




module.exports = router;
