const mMoudle =require("./module")
function ret(suc,msg,d){
    return JSON.stringify({success:suc,message:msg,d:d})
}
function checkAuth(data){
    // // 設定之密鑰
    // const SECRET = 'thisismynewproject'
    // // 從來自客戶端請求的 header 取得和擷取 JWT
    const token = data.header('Authorization').replace('Bearer ', '')
    console.log(mMoudle.checkAuth(data.body))
    return true
    // 驗證 Token
    // const decoded = jwt.verify(token, SECRET)
}
module.exports={
    ret,checkAuth
}
