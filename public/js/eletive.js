var recordData = []
const fileRoot = "http://yusiang.unaux.com/fteFile/"
var forSaveId = ""
var forSaveItem = ""

function isImg(str) {
    var index = str.lastIndexOf(".");
    var ext = str.substr(index + 1);
    return ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', ' psd ', ' svg ', ' tiff '].indexOf(ext.toLowerCase()) !== -1
}

function detail(index) {
    // console.log("enter detail")
    // console.log(recordData[index])
    item = recordData[index]
    forSaveItem = item
    forSaveId = item["id"]
    let title = item["r_name"] + " - " + item["time"]
    let isRemove = item["reason_id"] == 2
    let hasReport = String(item["reportUrl"]).length < 5
    let hasCert = String(item["certUrl"]).length < 5
    $("#rER").attr("disabled", isRemove)
    $("#rEC").attr("disabled", isRemove)
    if (item["status_id"] != 2) {
        $(".forResend").addClass("reSendNo")
    } else {
        $(".forResend").removeClass("reSendNo")
        if (item["reason_id"] == 2) {
            $("#ecPrview").addClass("disabled")
            $("#ecDown").addClass("disabled")
            $("#erPrview").addClass("disabled")
            $("#erDown").addClass("disabled")
            $("#rErF").addClass("disabled")
            $("#rEcF").addClass("disabled")

        } else {
            $("#rErF").removeClass("disabled")
            $("#rEcF").removeClass("disabled")
            if (hasReport) {
                $("#erPrview").addClass("disabled")
                $("#erDown").addClass("disabled")
            } else {
                $("#erPrview").removeClass("disabled")
                $("#erDown").removeClass("disabled")
            }
            if (hasCert) {
                $("#ecPrview").addClass("disabled")
                $("#ecDown").addClass("disabled")
            } else {
                $("#ecPrview").removeClass("disabled")
                $("#ecDown").removeClass("disabled")
            }
        }
    }
    $("#rETitle").html(title)
    $("#rERemark").html(item["status_id"] == 2 ? (String(item["remark"]).trim() !== "" ? `<h3>退件備註： ${item["remark"]} </h3>` : "") + "<h3>若需要重新上傳文件，請於下方點選瀏覽按鈕選擇檔案，並點選送出</h3>" : "")
    let iframeUrl = isImg(item["applyUrl"]) ? `${fileRoot}/${item["applyUrl"]}` : `https://docs.google.com/viewer?url=${fileRoot}/${item["applyUrl"]}&embedded=true`
    let iframeItem = isImg(item["applyUrl"]) ? `<img src=${iframeUrl}>` : ` <iframe src="${iframeUrl}" style="border: none; height: 500px;" id="view"></iframe>`
    // console.log(iframeUrl)
    // $("#toView").html(iframeItem)
    $("#rEModal").modal("show")

}

function toast(res, todo) {
    $('body').toast({
        message: res.message,
        showProgress: 'bottom',
        onRemove: todo

    });
}

function tableReload() {
    $.ajax({
        url: `./eletive/list?s_id=${localStorage.getItem("s_id")}`,
        method: "GET",
        success: (res) => {
            res = JSON.parse(res)
            recordData = res["d"]
            if (res.success) {
                let recordRoot = document.getElementById("record")
                recordRoot.innerHTML = ""
                for (let index in res["d"]) {
                    let item = res["d"][index]
                    recordRoot.innerHTML += (` <tr onclick=detail(${index})>
    <td>${item["time"]}       </td>
    <td>${item["r_name"]}      </td>
    <td>${item["s_name"]}      </td>
    </tr>`)
                }
            }

        },
        error: (error) => {
            console.log(error)
        }
    })
}

function toMail(s_id, re) {
    const mailData = {
        apply: {
            subject: re ? "退件後重傳成功" : "送出申請成功",
            body: "<p>1.您的選課申請已被送出，請於二個工作天後登入系統查看是否核准，或需再補件<br />2.若選修外系課程在本系送出後仍需等待外系助教確認後才能得知申請是否被核准。</p>",
        },
    }
    Email.send({
        SecureToken: "d356adce-f0d7-4c4d-98f9-3f784e2c8bf6",
        To: `${s_id}@ntub.edu.tw`,
        From: "ningpaiyi@gmail.com",
        Subject: mailData.apply.subject,
        Body: mailData.apply.body,
    }).then(
        message => console.log(message)
    );
}
$("body").ready(() => {
    let g = localStorage.getItem("graduates")
    if (g == "true") $("#tab").append(' <a class="item" data-tab="remove"><b>減修</b></a>');
    $('.menu .item').tab();
    tableReload()

})

// 加選處理
$("#pushApply").click(() => {

    $("#pushModal").modal({
        onApprove: function () {
            $('body').toast({
                message: '加選、退選、減修申請只能上傳一次，請同學再次確認後再上傳',
                displayTime: 0,
                actions: [{
                    text: '確認送出',
                    icon: 'check',
                    class: 'green',
                    click: function () {
                        $('body').toast({ message: '資料送出中...' });
                        let pushEA = document.getElementById("pushEA").files[0]
                        let pushER = document.getElementById("pushER").files[0] || ""
                        let pushEC = document.getElementById("pushEC").files[0] || ""
                        let formData = new FormData()
                        let s_id = localStorage.getItem("s_id")
                        // console.log("formdata")
                        formData.append("ea", pushEA)
                        formData.append("er", pushER)
                        formData.append("ec", pushEC)
                        formData.append("s_id", s_id)
                        formData.append("reason", 0)
                        $.ajax({
                            url: "./eletive",
                            "method": "POST",
                            contentType: false,
                            processData: false,
                            mimeType: "multipart/form-data",
                            data: formData,
                            success: (res) => {
                                res = JSON.parse(res)
                                toMail(s_id, false)
                                toast(res, tableReload)


                            },
                            error: (error) => {
                                console.log(error)
                            }
                        })
                    }
                }, {
                    icon: 'ban',
                    class: 'icon red',
                    text: "取消",
                }]
            })
                ;
        }
    }).modal('show')


})

// 退選處理
$("#pullApply").click(() => {

    $("#pullModal").modal({
        onApprove: function () {
            $('body').toast({
                message: '加選、退選、減修申請只能上傳一次，請同學再次確認後再上傳',
                displayTime: 0,
                actions: [{
                    text: '確認送出',
                    icon: 'check',
                    class: 'green',
                    click: function () {
                        $('body').toast({ message: '資料送出中...' });
                        let pushEA = document.getElementById("pullEA").files[0]
                        let pushER = document.getElementById("pullER").files[0] || ""
                        let pushEC = document.getElementById("pullEC").files[0] || ""
                        let formData = new FormData()
                        let s_id = localStorage.getItem("s_id")
                        formData.append("ea", pushEA)
                        formData.append("er", pushER)
                        formData.append("ec", pushEC)
                        formData.append("s_id", s_id)
                        formData.append("reason", 1)
                        $.ajax({
                            url: "./eletive",
                            "method": "POST",
                            contentType: false,
                            processData: false,
                            mimeType: "multipart/form-data",
                            data: formData,
                            success: (res) => {
                                res = JSON.parse(res)
                                toMail(s_id, false)
                                toast(res, tableReload)
                            }
                        })
                    }
                }, {
                    icon: 'ban',
                    class: 'icon red',
                    text: "取消"
                }]
            })
                ;
        }
    }).modal('show')
})

// 減修處理
$("#removeApply").click(() => {
    $("#removeModal").modal({
        onApprove: function () {
            $('body').toast({
                message: '加選、退選、減修申請只能上傳一次，請同學再次確認後再上傳',
                displayTime: 0,
                actions: [{
                    text: '確認送出',
                    icon: 'check',
                    class: 'green',
                    click: function () {
                        $('body').toast({ message: '資料送出中...' });
                        let removeA = document.getElementById("removeA").files[0]
                        let formData = new FormData()
                        let s_id = localStorage.getItem("s_id")
                        formData.append("ea", removeA)
                        formData.append("s_id", s_id)
                        formData.append("reason", 2)
                        $.ajax({
                            url: "./eletive",
                            "method": "POST",
                            contentType: false,
                            processData: false,
                            mimeType: "multipart/form-data",
                            data: formData,
                            success: (res => {
                                res = JSON.parse(res)
                                toMail(s_id, false)
                                toast(res, tableReload)
                            })
                        })
                    }
                }, {
                    icon: 'ban',
                    class: 'icon red',
                    text: "取消"
                }]
            })
                ;
        }
    }).modal('show')
})

// 重新加退選處理
$("#rESend").click(() => {
    let rEA = document.getElementById("rEA").files[0]
    let rER = document.getElementById("rER").files[0] || ""
    let rEC = document.getElementById("rEC").files[0] || ""
    let formData = new FormData()
    let s_id = localStorage.getItem("s_id")
    formData.append("ea", rEA)
    formData.append("er", rER)
    formData.append("ec", rEC)
    formData.append("s_id", s_id)
    formData.append("id", forSaveId)
    formData.append("re", true)
    $.ajax({
        url: "./eletive",
        "method": "POST",
        contentType: false,
        processData: false,
        mimeType: "multipart/form-data",
        data: formData,
        success: (res) => {        
            res = JSON.parse(res)
            toMail(s_id, true)
            toast(res, tableReload)
        }

    })
})
$(".prview").click(e => {
    let fileTarget = e.target.name
    let ruleFileName = forSaveItem[fileTarget]
    // console.log(isImg(ruleFileName))
    let iframeUrl = isImg(ruleFileName) ? fileRoot + ruleFileName : `https://docs.google.com/viewer?url=${fileRoot}${ruleFileName}&embedded=true`
    // $("#toView").html(`    <iframe src="${iframeUrl}" style="border: none; height: 500px;" id="view"></iframe>`)
})
$(".downloadFile").click(e => {
    let fileTarget = e.target.name
    let ruleFileName = forSaveItem[fileTarget]
    let toOpen = isImg(ruleFileName) ? fileRoot + ruleFileName : `https://docs.google.com/viewer?url=${fileRoot}${ruleFileName}`
    window.open(toOpen)
})
$(".downloadSample").click(e => {
    // console.log("enter smapl")
    let fileTarget = e.target.name
    let toOpen = `https://docs.google.com/viewer?url=${fileRoot}${fileTarget}`
    // console.log(toOpen)
    window.open(toOpen)
})
$("#logout").click(() => {
    localStorage.clear()
    document.location.href = document.location.href.split("/eletive")[0]
})