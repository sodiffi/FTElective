var express = require('express');
var router = express.Router();
const multer = require('multer')
var mime = require('mime-types');
const ftp = require("basic-ftp")
const { v4: uuidv4 } = require('uuid');
var util = require("./util/util")

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    let ext = mime.extension(file.mimetype);
    cb(null, file.fieldname + uuidv4() + '-' + Date.now() + "." + ext)
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

const cpUpload = upload.fields([{ name: 'ea' }, { name: 'er' }, { name: 'ec' }, { name: "s_id" }])
router.post('/', cpUpload, async (req, res, next) => {
  let d = new Date().toISOString().split("T")[0]
  let t = new Date().toLocaleTimeString("tw", { city: 'TAIWAN', timeZone: 'Asia/Taipei', hour12: false },)

  var eAFile = req.files["ea"][0].filename;
  var erFile = req.files["er"] !== undefined ? req.files["er"][0].filename : ""
  var ecFile = req.files["ec"] !== undefined ? req.files["ec"][0].filename : ""
  console.log(req.files["ec"])
  // res.send("error")
  var eaFileCheck = 0
  var erFileCheck = 0
  var ecFileCheck = 0
  const client = new ftp.Client()
  client.ftp.verbose = true
  try {
    await client.access({
      host: "ftpupload.net",
      user: "unaux_29705433",
      password: "k9uy2e14b2u",
      // secure: true
    })
    console.log(await client.list())
    await client.ensureDir("/htdocs/fteFile")
    await client.cd("/htdocs/fteFile")
    await client.uploadFrom(`./uploads/${eAFile}`, eAFile).then(res => {
      eaFileCheck = 1
    }, error => {
      eaFileCheck = -1
    })
    if (erFile !== "") {
      await client.uploadFrom(`./uploads/${erFile}`, erFile).then(res => {
        erFileCheck = 1
      }, error => {
        erFileCheck = -1
      })
    } else { erFileCheck = 1 }

    if (ecFile !== "") {
      await client.uploadFrom(`./uploads/${ecFile}`, ecFile).then(res => {
        ecFileCheck = 1
      }, error => {
        ecFileCheck = -1
      })
    } else { ecFileCheck = 1 }


    console.log("here ", eaFileCheck, ecFileCheck, erFileCheck,eaFileCheck == ecFileCheck == erFileCheck == 1)
    if (eaFileCheck == ecFileCheck == erFileCheck == 1) {
      console.log()
      let eData = {
        s_id: req.body.s_id,
        reason: req.body.reason || 0,
        applyUrl: req.files["ea"][0].filename,
        reportUrl: req.files["er"] != undefined ? req.files["er"][0].filename : "",
        certUrl: req.files["ec"] != undefined ? req.files["ec"][0].filename : "",
        time: `${d} ${t}`

      }
      mModule.eletive(eData).then(D => {
        res.send(util.ret(true, "申請成功"))

      }, (error) => {
        res.send(util.ret(false, "申請失敗"))

      })
    

    }


  }
  catch (err) {
    console.log(err)
  }
  client.close()
  // c.connect();

  // res.send("ok")
})


module.exports = router;
