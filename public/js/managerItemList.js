$(function () {
    setTotal();
    setDate();
    showDate();
    setToggle();
    $('#modal').hide();
    $('.close').click(function () {
        $('#modal').fadeOut(300);
    });
    setLink();
});

function setTotal() {
    const cnts = $('.cnt');
    var total = 0;
    for (var i = 0; i < cnts.length; i++) {
        total += (Number)($(cnts[i]).text());
    }
    var ogTxt = $('#total-cnt').text()
    $('#total-cnt').text(ogTxt + total + '상자');
}

function setDate() {
    $('#select-date').change(function () {
        var date = $(this).val();
        location.href = `?date=${date}`;
    });
}
function showDate() {
    $('#select-date').children('option[value=<%=current%>]').attr('selected', 'selected');
}
function setToggle() {
    $('.extend-table').click(function () {
        var logi = $(this).data('logi');
        $(`tr[data-logi='${logi}']`).fadeToggle(300);
    });
}
function setLink() {
    $('.position').click(function () {
        const listID = $(this).data('list');
        const url = `/Manager/Sector?ListID=${listID}`;
        $('#iframe').attr('src', url);
        $('#modal').fadeIn(300);
    });
}