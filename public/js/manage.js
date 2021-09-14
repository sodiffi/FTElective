const fileRoot = "http://yusiang.unaux.com/fteFile/"
const rootUrl = document.location.origin

var token = localStorage.getItem("token")
var forSaveId = ""
var forSaveItem = ""

function isImg(str) {
    var index = str.lastIndexOf(".");
    var ext = str.substr(index + 1);
    return ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', ' psd ', ' svg ', ' tiff '].indexOf(ext.toLowerCase()) !== -1
}
$(document).ready(function () {
    $.ajax({
        url: `${rootUrl}/ma/list`,
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    }).then(res => {
        res = JSON.parse(res)
        // console.log(res["d"][0])
        // res["d"].map(item => console.log(item))
        $('#tt thead tr')
            .clone(true)
            .addClass('filters')
            .appendTo('#tt thead');
        $('#tt').on('click', 'tbody tr', function () {
            let table = new DataTable('#tt');
            var row = table.row($(this)).data();
            let iframeUrl = isImg(row["applyUrl"]) ? fileRoot + row["applyUrl"] : `https://docs.google.com/viewer?url=${fileRoot}${row["applyUrl"]}&embedded=true`
            // $("#view").attr("src", iframeUrl)
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
                $("#erPrview").addClass("disabled")
                $("#erDown").addClass("disabled")
            } else {
                $("#erPrview").removeClass("disabled")
                $("#erDown").removeClass("disabled")
            }
            if (String(row["certUrl"]).length < 5) {
                $("#ecPrview").addClass("disabled")
                $("#ecDown").addClass("disabled")
            } else {
                $("#ecPrview").removeClass("disabled")
                $("#ecDown").removeClass("disabled")
            }

            $("#eCheck").modal({
                onApprove: function () { }
            }).modal("show")
        });
        $('#tt').DataTable({
            fixedHeader: true,
            responsive: true,
            data: res["d"],
            lengthMenu: [
                [25, 50, -1],
                ['25', '50', '全部']
            ],
            buttons: [
                'pageLength', 'copy', 'excel', 'pdf'
            ],
            columns: [{
                data: 'st_name'
            }, {
                data: 's_id'
            }, {
                data: 'system'
            }, {
                data: 'class'
            }, {
                data: 'grade'
            }, {
                data: 'time'
            }, {
                data: 'r_name'
            }, {
                data: 's_name'
            }],
            initComplete: function () {
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
                        .on('keyup change', function (e) {
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
            },
        });
        new $.fn.dataTable.Buttons(table, {
            dom: 'Bfrtip',
            buttons: [
                'copy', 'excel', 'pdf'
            ]
        });
    })

});
$("#send").click(() => {
    // console.log($("#yes").val())
    // console.log($("#no").val())
    let v = $('[name=checkE]:checked').val() === "yes"

    console.log(v)
    let remark = $("#remark").val()
    console.log(remark)
    let remarkText = $("#remarkText").val()
    console.log(remarkText)
    remark = remark == "其他" ? remarkText : remark + "<br/>" + remarkText

    $.ajax({
        url: `${rootUrl}/ma/list`,
        method: "POST",
        data: {
            "id": forSaveId,
            "status_id": v ? 1 : 2,
            "remark": remark
        },
        headers: {
            "Authorization": "Bearer " + token
        },
        success: (res) => {
            res = JSON.parse(res)
            todo = res.success ? () => {
                $("#eCheck").modal("hide", true)
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
$(".prview").click(e => {
    let fileTarget = e.target.name
    let ruleFileName = forSaveItem[fileTarget]
    let iframeUrl = isImg(ruleFileName) ? fileRoot + ruleFileName : `https://docs.google.com/viewer?url=${fileRoot}${ruleFileName}&embedded=true`
    // $("#view").attr("src", iframeUrl)
})
$(".downloadFile").click(e => {
    let fileTarget = e.target.name
    let ruleFileName = forSaveItem[fileTarget]
    // console.log(`${fileRoot}/${ruleFileName}`)
    let toOpen = isImg(ruleFileName) ? fileRoot + ruleFileName : `https://docs.google.com/viewer?url=${fileRoot}${ruleFileName}`
    window.open(toOpen)
})
window.onresize = () => {
    // console.log("here")
    $("#tt").css("width", "calc( 100vw - 150px )")
}
$("#logout").click(() => {
    localStorage.clear()
    document.location.href = document.location.href.split("/manage")[0]
})