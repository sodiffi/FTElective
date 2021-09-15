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

const cpUpload = upload.fields([{ name: 'ea' }, { name: 'er' }, { name: 'ec' }, { name: "s_id" }, { name: "re" }])
router.post('/', cpUpload, async (req, res, next) => {
  // var data = {
  //   service_id: 'service_in7sbab',
  //   template_id: 'template_ghtcrrk',
  //   user_id: 'user_rGDbLCZzIXTlUw1VYrz2L',
  //   template_params: {
  //     to_email: "10656010@ntub.edu.tw",
  //     to_name: "user_name",
  //     message: "omg_msg",
  //   },accessToken:"87781964717aefb739f63b95526ee3c9"
  // };

  // console.log(JSON.stringify(data))
  // fetch('//api.emailjs.com/api/v1.0/email/send', {
  //   method: 'POST',
  //   body: JSON.stringify(data) ,
  //   headers: {
  //     "Content-Type": "application/json"
  //   },
  // }).then(function (response) {
  //   console.log('SUCCESS!', response);
  // }, (error)=> {
  //   console.log('FAILED...', error);
  // });

  // var mailTransport = nodemailer.createTransport('SMTP', {
  //   service: 'Gmail',
  //   auth: {
  //     user: "ningpaiyi@gmail.com",
  //     pass: "Pca2QH5Ym",
  //   },
  // });
  // let testAccount = await nodemailer.createTestAccount();
  // let info = await testAccount.sendMail(
  //   {
  //     from: 'Meadowlark Travel <ningpaiyi@gmail.com>',
  //     to: 'Cythilya <10656010@ntub.edu.tw>',
  //     subject: 'Hi :)',
  //     html: '<h1>Hello</h1><p>Nice to meet you.</p>',
  //   },
  //   function (err) {
  //     if (err) {
  //       console.log('Unable to send email: ' + err);
  //     }
  //   },
  // );  console.log("Message sent: %s", info.messageId);

  // let d = new Date().toISOString().split("T")[0]
  // let t = new Date().toLocaleTimeString("tw", { city: 'TAIWAN', timeZone: 'Asia/Taipei', hour12: false },)
  // var eAFile = req.files["ea"][0].filename;
  // var erFile = req.files["er"] !== undefined ? req.files["er"][0].filename : ""
  // var ecFile = req.files["ec"] !== undefined ? req.files["ec"][0].filename : ""
  // // console.log(req.files["re"])
  // var eaFileCheck = 0
  // var erFileCheck = 0
  // var ecFileCheck = 0
  // const client = new ftp.Client()
  // client.ftp.verbose = true
  // try {
  //   await client.access({
  //     host: "ftpupload.net",
  //     user: "unaux_29705433",
  //     password: "k9uy2e14b2u",
  //   })
  //   // console.log(await client.list())
  //   await client.ensureDir("/htdocs/fteFile")
  //   await client.cd("/htdocs/fteFile")
  //   await client.uploadFrom(`./uploads/${eAFile}`, eAFile).then(res => {
  //     eaFileCheck = 1
  //   }, error => {
  //     eaFileCheck = -1
  //   })
  //   if (erFile !== "") {
  //     await client.uploadFrom(`./uploads/${erFile}`, erFile).then(res => {
  //       erFileCheck = 1
  //     }, error => {
  //       erFileCheck = -1
  //     })
  //   } else { erFileCheck = 1 }

  //   if (ecFile !== "") {
  //     await client.uploadFrom(`./uploads/${ecFile}`, ecFile).then(res => {
  //       ecFileCheck = 1
  //     }, error => {
  //       ecFileCheck = -1
  //     })
  //   } else { ecFileCheck = 1 }
  //   // console.log("here ", eaFileCheck, ecFileCheck, erFileCheck, eaFileCheck == ecFileCheck == erFileCheck == 1)
  //   if (eaFileCheck == ecFileCheck == erFileCheck == 1) {
  //     // console.log()
  //     let eData = {
  //       s_id: req.body.s_id,
  //       reason: req.body.reason || 0,
  //       applyUrl: req.files["ea"][0].filename,
  //       reportUrl: req.files["er"] != undefined ? req.files["er"][0].filename : "",
  //       certUrl: req.files["ec"] != undefined ? req.files["ec"][0].filename : "",
  //       time: `${d} ${t}`

  //     }
  //     if (!req.body.re) {
  //       mModule.eletive(eData).then(D => {


  //       })
  //     } else {
  //       eData.id = req.body.id
  //       mModule.rEletive(eData).then(D => {
  //         res.send(util.ret(true, "重新申請成功"))

  //       }, (error) => {
  //         res.send(util.ret(false, "重新申請失敗"))

  //       })
  // }
  // 
  // 
  // }
  // }
  // catch (err) {
  //   console.log(err)
  // }
  // client.close()

})


module.exports = router;
