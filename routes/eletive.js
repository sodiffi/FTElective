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
  // let destination = req.files["ea"][0].destination
  // console.log(destination)
  // var eAFile = req.files["ea"][0].filename;
  // var erFile = req.files["er"] !== undefined ? req.files["er"][0].filename : ""
  // var ecFiles = req.files["ec"] !== undefined ? req.files["ec"] : ""

  let folderPath = req.files["ea"][0].destination
  let remotePath = String(folderPath).split("./uploads/")[1]
  // console.log(folderPath)
  // console.log()
  var eaFileCheck = 0
  var erFileCheck = 0
  var ecFileCheck = 0
  const client = new ftp.Client()
  // client.ftp.verbose = true
  try {
    await client.access({
      host: "ftpupload.net",
      user: "unaux_29705433",
      password: "k9uy2e14b2u",
    })
    // console.log(await client.list())
    await client.ensureDir("/htdocs/fteFile/")
    await client.cd("/htdocs/fteFile")
    await client.uploadFromDir(String(folderPath), remotePath).then(resd => {
      let eData = {
        s_id: req.params.s_id,
        reason: req.body.reason || 0,
        applyUrl: `${remotePath}/${req.files["ea"][0].filename}`,
        reportUrl: req.files["er"] != undefined ? `${remotePath}/${req.files["er"][0].filename}` : "",
        certUrl: req.files["ec"] != undefined ? req.files["ec"] : "",
        time: `${d} ${t}`,
        remotePath: remotePath

      }
      if (!req.body.re) {
        mModule.eletive(eData).then(D => {
          console.log(D, "enter no body re")

          res.send(util.ret(true, "申請成功"))

        }, error => console.log(error))
      } else {
        eData.id = req.body.id
        mModule.rEletive(eData).then(D => {

          res.send(util.ret(true, "重新申請成功"))

        }, (error) => {

          res.send(util.ret(false, "重新申請失敗"))

        })
      }

      // console.log("folder path")
    }, error => {
      res.send(util.ret(true, "申請失敗"))
      console.log("folder error", error)
    }
    )
    // await client.uploadFrom(`./uploads/${}/${eAFile}`, eAFile).then(res => {
    //   eaFileCheck = 1
    // }, error => {
    //   eaFileCheck = -1
    // })
    // if (erFile !== "") {
    //   await client.uploadFrom(`./uploads/${erFile}`, erFile).then(res => {
    //     erFileCheck = 1
    //   }, error => {
    //     erFileCheck = -1
    //   })
    // } else { erFileCheck = 1 }

    // if (ecFiles !== "") {
    //   if (Array.isArray(ecFiles)) {
    //     let size = ecFiles.length - 1
    //     ecFiles.forEach(async (v, i) => {
    //       await client.uploadFrom(`./uploads/${v.filename}`, v.filename).then(res => {
    //         if (i == size) ecFileCheck = 1
    //       }, error => {
    //         console.log(error, "here error")
    //         ecFileCheck = -1
    //       })
    //     })
    //   }


    // } else { ecFileCheck = 1 }
    // console.log("here ", eaFileCheck, ecFileCheck, erFileCheck, eaFileCheck == ecFileCheck == erFileCheck == 1)
    // if (eaFileCheck == ecFileCheck == erFileCheck == 1) {
    //   console.log("enter if")


    // } else {

    //   res.send(util.ret(true, "申請失敗"))
    // }
  }
  catch (err) {
    console.log(err)
  }

  client.close()
})


module.exports = router;
