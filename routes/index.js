var express = require('express');
var router = express.Router();
const multer = require('multer')
var mime = require('mime-types');
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    let ext = mime.extension(file.mimetype);
    cb(null, file.fieldname + '-' + Date.now() + "." + ext)
  }
})
const upload = multer({ dest: 'uploads/', storage: storage })
const mModule = require("./util/module")
// router.use(multer({dest:'./uploads/'}));
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});
router.post('/', function (req, res, next) {
  console.log(req.body)
});

router.get("/eletive", function (req, res, next) {
  res.render("eletive")
})

router.get("/eletive/list", function (req, res, next) {
  s_id = req.query.s_id
  if (s_id) {
    mModule.record(req.query.s_id).then(D => {
      res.send(JSON.stringify({ data: D }))
    })
  } else {
    res.send("error")
  }

})

const cpUpload = upload.fields([{ name: 'ea' }, { name: 'er' }, { name: 'ec' }, { name: "s_id" }])
router.post('/eletive', cpUpload, (req, res, next) => {
  console.log("here is router")
  // console.log(req.files["ea"][0].filename)
  let eData = {
    s_id: req.body.s_id,
    reason: req.body.reaseon,
    applyUrl: req.files["ea"][0].filename,
    reportUrl: req.files["er"] != undefined ? req.files["er"][0].filename : "",
    certUrl: req.files["ec"] != undefined ? req.files["ec"][0].filename : "",
    // reportUrl: "",
    // certUrl: "",
  }
  mModule.eletive(eData).then(D => {
    res.send("ok2")
  }, (error) => {
    res.send("error2")
  })
  // res.send("ok")
})



module.exports = router;
