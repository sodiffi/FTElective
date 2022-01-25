var express = require('express');
var router = express.Router();
const multer = require('multer')
var mime = require('mime-types');
const ftp = require("basic-ftp")
const { v4: uuidv4 } = require('uuid');
const fs = require('fs')
var util = require("./util/util")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let s = Date.now()
    let r = String(s).slice(0, 7)
    const path = `./uploads/${req.params.s_id}-${r}`
    fs.mkdirSync(path, { recursive: true })
    cb(null, path)
  },
  filename: function (req, file, cb) {
    let ext = mime.extension(file.mimetype);
    cb(null, file.fieldname + uuidv4() + '_' + Date.now() + "." + ext)
  }
})
const upload = multer({ dest: 'uploads/', storage: storage })
const mModule = require("./util/module")
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.render("eletive")
})

router.get("/list", function (req, res, next) {
  s_id = req.query.s_id
  if (s_id) {
    mModule.record(req.query.s_id).then(D => {
  
      res.send(util.ret(true, "查詢成功", D))
    })
  } else {
    res.send(util.ret(false, "連線失敗"))
  }

})

const cpUpload = upload.fields([{ name: 'ea' }, { name: 'er' }, { name: 'ec' }, { name: "re" }])
router.post('/:s_id', cpUpload, async (req, res, next) => {

  let d = new Date().toISOString().split("T")[0]
  let t = new Date().toLocaleTimeString("tw", { city: 'TAIWAN', timeZone: 'Asia/Taipei', hour12: false },)
  
  let folderPath = ""
  if (req.body.re) {
    if (req.files["ea"] != undefined) folderPath = req.files["ea"][0].destination
    if (req.files["er"] != undefined) folderPath = req.files["er"][0].destination
    if (req.files["ec"] != undefined) folderPath = req.files["ec"][0].destination
  } else {
    folderPath = req.files["ea"][0].destination
  }
  let remotePath = String(folderPath).split("./uploads/")[1]
  let eData = {
    s_id: req.params.s_id,
    reason: req.body.reason || 0,
    applyUrl: req.files["ea"] != undefined ? `${remotePath}/${req.files["ea"][0].filename}` : "",
    reportUrl: req.files["er"] != undefined ? `${remotePath}/${req.files["er"][0].filename}` : "",
    certUrl: req.files["ec"] != undefined ? req.files["ec"] : "",
    time: `${d} ${t}`,
    remotePath: remotePath
  }
  if (!req.body.re) {
    mModule.eletive(eData).then(D => {
      res.send(util.ret(true, "申請成功"))

    }, error => {
      let errMsg = "申請失敗"
      if (error.sqlMessage == "請勿重複申請") {
        errMsg += "，請勿重複申請，請到選課紀錄檢查是否有申請紀錄未通過，並點選未通過的紀錄上傳須補件項目"
      }

      res.send(util.ret(true, errMsg))
    })
  } else {
    eData.id = req.body.id
    mModule.rEletive(eData).then(D => {

      res.send(util.ret(true, "重新申請成功"))

    }, (error) => {

      res.send(util.ret(false, "重新申請失敗"))

    })
  }


}, error => {
  res.send(util.ret(true, "申請失敗"))
  
})
  // const client = new ftp.Client()

  // try {
  //   await client.access({
  //     host: "sv46.byethost46.org",
  //     user: "yusiang",
  //     password: "h;9]L7FO4oL8tc",
  //     secure: false
  //   })

  //   await client.ensureDir("/public_html/fteFile/")
  //   await client.cd("/public_html/fteFile/")
  //   console.log(folderPath, remotePath, req.files["ec"] != undefined, req.files["ec"])
  //   await client.uploadFromDir(String(folderPath), remotePath).then(resd => {
     

  // }
  // catch (err) {
  //   console.log(err)
  // }

  // client.close()
// })


module.exports = router;
