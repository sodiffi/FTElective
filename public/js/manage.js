const fileRoot = "127.0.0.1:3000/"
const rootUrl = document.location.origin

var token = localStorage.getItem("token")
var forSaveId = ""
var forSaveItem = ""

function isImg(str) {
    var index = str.lastIndexOf(".");
    var ext = str.substr(index + 1);
    return ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', ' psd ', ' svg ', ' tiff '].includes(ext.toLowerCase())
}

function tableReload(forInit) {
    $.ajax({
        url: `${rootUrl}/ma/list`,
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    }).then(res => {
        res = JSON.parse(res)
        $('#tt').on('click', 'tbody tr', function () {
            let table = new DataTable('#tt');
            var row = table.row($(this)).data();
            let ruleFileName = forSaveItem["applyUrl"]
            let toOpen = `../${ruleFileName}`
            $('.dropdown.multiple').dropdown("clear")
            $("#ff").attr("src", toOpen)
            forSaveId = row["id"]
            forSaveItem = row
            $("#showStudent").html(`
    <tr>
    <th>申請人</th>
    <th>學號</th>
    <th>學制</th>
    <th>班級</th>
    <th>年級</th>
    <th>申請時間</th>
    <th>事由</th>
    <th>審核狀態</th>
    </tr> <tr>
    <td>${row["st_name"]}</td>
    <td>${row["s_id"]}</td>
    <td>${row["system"]}</td>
    <td>${row["class"]}</td>
    <td>${row["grade"]}</td>
    <td>${row["time"]}</td>
    <td>${row["r_name"]}</td>
    <td>${row["s_name"]}</td>
    </tr>`)
            if (String(row["reportUrl"]).length < 5) {
                $("#erDown").addClass("disabled")
            } else {
                $("#erDown").removeClass("disabled")
            }
            let hasCert = row["c_url"]
            $("#rEcF > p ").html("")
            if (Array.isArray(hasCert)) {
                hasCert.forEach((cartItem, index) => {
                    if (cartItem) {
                        $("#rEcF > p").append(`<div>
                        <a class="ui button   ecDown"  name="${cartItem}"                          
                        href="${fileRoot}/${cartItem}" target="_blank" >下載</a>
                        <div class="field">
                                    <div class="ui radio checkbox">
                                        <input type="radio" name="c_no_${row["c_id"][index]}"   value="1">
                                        <label for="no">有效</label>
                                    </div>
                                </div>
                        <div class="field">
                            <div class="ui radio checkbox">
                                <input type="radio" name="c_no_${row["c_id"][index]}"   value="2">
                                <label for="no">無效</label>
                            </div>
                        </div>
                        </div>`)
                    }
                })
            }
            $("#eCheck").modal({ onApprove: () => { } }).modal("show")
        });

        $('#tt').DataTable({
            fixedHeader: true,
            responsive: true,
            data: res["d"],
            lengthMenu: [[25, 50, -1], ['25', '50', '全部']],
            destroy: true,
            buttons: ['pageLength'],
            columns: [
                { data: 'st_name' },
                { data: 's_id' },
                { data: 'system' },
                { data: 'class' },
                { data: 'grade' },
                { data: 'time' },
                { data: 'r_name' },
                { data: 's_name' }
            ],
            initComplete: forInit,
        });

    })
}

function toMail(s_id, check) {
    const mailData = {
        success: {
            subject: "助教審核通過",
            body: "<p>您的選課或減修申請已被核准，請登入本系選課系統查看結果，如有問題請再與系辦聯絡</p>"
        },
        error: {
            subject: "助教審核未通過",
            body: "<p>您的選課申請因故未被核準，請登入本系統或收email查看原因</p>"
        }
    }
    let toSend = check ? mailData.success : mailData.error
    // console.log("before mail")
    Email.send({
        SecureToken: "d356adce-f0d7-4c4d-98f9-3f784e2c8bf6",
        To: `${s_id}@ntub.edu.tw`,
        From: "ningpaiyi@gmail.com",
        Subject: toSend.subject,
        Body: toSend.body,
    })

}
$(() => {
    $('#tt thead tr')
        .clone(true)
        .addClass('filters')
        .appendTo('#tt thead');
    $('.dropdown.multiple').dropdown()
    tableReload(function () {
        var api = this.api();
        // For each column
        api.columns().eq(0).each(function (colIdx) {
            // Set the header cell to contain the input element
            var cell = $('.filters th').eq(
                $(api.column(colIdx).header()).index()
            );
            var title = $(cell).text();
            $(cell).html(' <div class="ui form"><input type="text" placeholder="' + title + '" class="searchInput"/></div>');

            // On every keypress in this input
            $('input', $('.filters th').eq($(api.column(colIdx).header()).index()))
                .off('keyup change')
                .on('compositionend', (e) => {
                    e.stopPropagation();
                    // Get the search value
                    $(this).attr('title', $(this).val());
                    var regexr = '({search})'; //$(this).parents('th').find('select').val();
                    var cursorPosition = this.selectionStart;
                    // Search the column for that value
                    api.column(colIdx)
                        .search(
                            this.value != '' ?
                                regexr.replace('{search}', '(((' + this.value + ')))') :
                                '',
                            this.value != '',
                            this.value == ''
                        ).draw();

                    $(this).focus()[0].setSelectionRange(cursorPosition, cursorPosition);
                });
        });
    })
});
$("#send").on("click", () => {
    let v = $('[name=checkE]:checked').val() === "yes"
    let remark = $("#remark").val()
    let remarkText = $("#remarkText").val()
    let status = $("[name='checkE']:checked").val()
    let checkE_no = $(".dropdown.multiple").dropdown("get value")
    if (status === "3") {
        if (Array.isArray(checkE_no)) {
            let tempStatus = 0
            tempStatus += (checkE_no.includes("apply") ? 3 : 0)
            tempStatus += (checkE_no.includes("AF") ? 4 : 0)
            tempStatus += (checkE_no.includes("AX") ? 5 : 0)
            if ([3, 4, 5, 7, 8, 9, 12].includes(tempStatus)) {
                status = tempStatus
            }
        }
    }
    remark = v ? "" : (remark == "其他" ? remarkText : "")
    let hasCert = $("[name^='c_no_']")
    var cert_id = []
    var cert_val = []
    if (hasCert) {
        hasCert.each(item => {
            if (hasCert[item].checked) {
                cert_id.push(String(hasCert[item].name).split("c_no_")[1])
                cert_val.push(hasCert[item].value)
            }
        })
    }
    hasCert = cert_id.length == cert_val.length

    $.ajax({
        url: `${rootUrl}/ma/list`,
        method: "POST",
        data: {
            "id": forSaveId,
            "status_id": status,
            "remark": remark,
            "hasCert": hasCert,
            "cert_ids":cert_id,
            "cert_values":cert_val
        },
        headers: {
            "Authorization": "Bearer " + token
        },
        success: (res) => {
            res = JSON.parse(res)
            todo = res.success ? () => {
                toMail(forSaveItem["s_id"], v)
                $("#eCheck").modal("hide", true)
                tableReload()
            } : () => { }
            $('body').toast({
                message: res.message,
                showProgress: 'bottom',
                onRemove: todo,
                displayTime: 1500
            });
        }
    })
})

$(".downloadFile").on("click", e => {
    let fileTarget = e.target.name
    let ruleFileName = forSaveItem[fileTarget]
    let toOpen = `../${ruleFileName}`

    $("#ff").attr("src", toOpen)
    window.setTimeout(() => $("#ff")[0].contentWindow.print(), 3000)

    // window.open(toOpen)
})
window.onresize = () => {
    $("#tt").css("width", "calc( 100vw - 150px )")
}
$("#logout").on("click", () => {
    localStorage.clear()
    document.location.href = document.location.href.split("/manage")[0]
})
$("input[name='checkE']").on("click", (event) => {
    if (event.target.value === "3") {
        $("#checkE_no").removeClass("disabled")
    }
    else {
        $("#checkE_no").addClass("disabled")
    }
})