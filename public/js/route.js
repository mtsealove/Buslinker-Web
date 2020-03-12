function searchAddr(obj) {
    new daum.Postcode({
        oncomplete: function (data) {
            $(obj).val(data.roadAddress);
        }
    }).open();
}


var level = 0;
var bus_name;

$(function () {
    $('select[name=bus]').children('option').click(function () {
        bus_name = $(this).text();
    });
    $('#add-tr').hide();
    $('#add-owner-btn').hide();
    $('#modal').hide();
    $('.popup').hide();
    $('.drop-menu').hide();

    $('#line-logi').hide();
    $('#line-owner').hide();

    $('#add-btn').click(function () {
        $(this).fadeOut(400);
        setTimeout(() => {
            $('#add-tr').show(400);
        }, 400);
    });

    $('#next-btn').click(function () {
        next();
    });

    $('#station-addr').click(function () {
        searchAddr($(this));
    });

    $('#empty-addr').click(function () {
        searchAddr($(this));
    });

    $('#station-btn').click(function () {
        setStation();
    });

    $('#logi-btn').click(function () {
        setLogi();
    });

    $('#empty-btn').click(function () {
        setEmpty();
    });

    $('#owner-btn').click(function () {
        addOwner();
    });

    $('.edit').click(function () {
        $('#modal').fadeIn(400);
        const cat = $(this).data('cat');
        console.log(cat);
        switch (cat) {
            case 0:
                $('#popup-station').show();
                $('#station-name').focus();
                break;
            case 1:
                $('#popup-logi').show();
                $('#logi-id').focus();
                break;
            case 2:
                $('#popup-empty').show();
                $('#empty-name').focus();
                break;
        }
    });

    $('#add-owner-btn').click(function () {
        $('#modal').fadeIn(400);
        $('#popup-owner').show();
        $("#owner-id").focus();
    });

    $('.close').click(function () {
        $('#modal').fadeOut(400);
        $('.popup').hide();
    });

    setDate();
    removeRoute();
    setDrop();
    lastConfirm();
    setPartTime();
    setGu();
});

function setDate() {
    var date = new Date();
    var currentDate = date.getFullYear() + '-';
    var nextDate = (date.getFullYear() + 1) + '-';
    if (date.getMonth() < 11) {
        currentDate += '0';
        nextDate += '0';
    }
    currentDate += (date.getMonth() + 1) + '-';
    nextDate += (date.getMonth() + 1) + '-';
    if (date.getDate() < 10) {
        currentDate += '0';
        nextDate += '0';
    }
    currentDate += date.getDate();
    nextDate += date.getDate();

    $('#contract-start').val(currentDate);
    $('#contract-end').val(nextDate);
}

function setStation() {
    if ($('#station-name').val() == '') {
        alert('이름을 입력하세요');
        return;
    } else if ($('#station-addr').val() == '') {
        alert('주소를 입력하세요');
        return;
    } else if ($('#station-start').val() == '') {
        alert('출발 시간을 선택하세요');
        return;
    } else if ($('#station-end').val() == '') {
        alert('도착 시간을 선택하세요');
        return;
    } else {
        const station1 = $('#station-name').val() + '<br>' + $('#station-start').val();
        const station2 = $('#station-name').val() + '<br>' + $('#station-end').val();
        $('#station1').html(station1);
        $('#station2').html(station2);
        $('#modal').fadeOut(400);
        $('#popup-station').hide();
        //$('#input-name').val($('#station-name').val());
    }
}

function setLogi() {
    if ($('#logi-id').val() == '') {
        alert('물류센터를 선택하세요');
    } else if ($('#logi-start').val() == '') {
        alert('출발 시간을 선택하세요');
        return;
    } else if ($('#logi-end').val() == '') {
        alert('도착 시간을 선택하세요');
        return;
    } else {
        const name = (($('#logi-id').val()).split('-'))[1];
        const logi1 = name + '<br>' + $('#logi-start').val();
        const logi2 = name + '<br>' + $('#logi-end').val();
        $('#logi1').html(logi1);
        $('#logi2').html(logi2);
        $('#modal').fadeOut(400);
        $('#popup-logi').hide();
        LogiName=name;
        setRouteName();
    }
}

function setEmpty() {
    if ($('#empty-name').val() == '') {
        alert('공터 이름을 입력하세요');
        return;
    } else if ($('#empty-addr').val() == '') {
        alert('주소를 입력하세요');
        return;
    } else if ($('#empty-time').val() == '') {
        alert('배송하차 시간을 입력하세요');
        return;
    } else {
        const empty = $('#empty-name').val() + '<br>' + $('#empty-time').val();
        $('#empty').html(empty);
        $('#modal').fadeOut(400);
        $('#popup-empty').hide();
    }
}

function addOwner() {
    if ($('#owner-id').val() == '') {
        alert('화주를 선택하세요');
        return;
    } else if ($('#owner-time').val() == '') {
        alert('시간을 선택하세요');
    } else {
        const id = (($('#owner-id').val()).split('-'))[1];
        const name = (($('#owner-id').val()).split('-'))[0];
        const time = $('#owner-time').val();
        const data = `<div class="vertical destination">
                                    <div class="destination-circle">
                                        <img src="/public/images/edit.png" class="edit">
                                    </div>
                                    <label class="destination-txt" id="empty">${name}<br>${time}</label>
                                    <input hidden name='owner-id' value='${id}'>
                                    <input hidden name='owner-time' value='${time}'>
                                </div>`;
        $('#line-owner').append(data);
        $('#modal').fadeOut(400);
        $('#popup-owner').hide();

        var items = $('#line-owner').children('.destination');
        for (var i = 0; i < items.length; i++) {
            $(items[i]).removeClass('destination-right');
            $(items[i]).removeClass('destination-left');
            for (var j = 0; j < i; j++) {
                var item1 = $(items[i]);
                var item2 = $(items[j]);

                if ($(items[i]).children('input[name=owner-time]').val() < $(items[j]).children('input[name=owner-time]').val()) {
                    item2.insertAfter(item1);
                }
            }
        }
        $(items[0]).addClass('destination-left');
        $(items[items.length - 1]).addClass('destination-right');
    }
}

function lastConfirm() {
    $('#bus-btn').click(function () {
        if (confirm('운행정보를 등록하시겠습니까?')) {
            $('#route-form').submit();
        }
    });
}

function next() {
    switch (level) {
        case 0:
            if ($('#station-name').val() != '') {
                level++;
                $('#line-logi').fadeIn(400);
            } else {
                alert('정류장을 먼저 선택하세요.');
            }
            break;
        case 1:
            if ($('#logi-start').val() != '') {
                level++;
                $('#line-owner').fadeIn(400);
                $('#add-owner-btn').fadeIn(400);
                getOwner();
            } else {
                alert('물류센터를 먼저 선택하세요.');
            }
            break;
        case 2:
            $('#modal').fadeIn(400);
            $('#popup-bus').show();
            break;
    }
}

function removeRoute() {
    $('.remove-btn').click(function () {
        const id = $(this).data('id');
        const name = $(this).data('name');
        if (confirm('경로 ' + name + '을(를) 삭제하시겠습니까?')) {
            $.post('/Manager/Remove/Route', { id: id }, (data) => {
                if (data.Result) {
                    alert('운행경로가 삭제되었습니다.');
                    location.reload();
                } else {
                    alert('오류가 발생하였습니다.');
                }
            });
        }
    });
}

function setDrop() {
    const buttons = $('.drop');
    for (var i = 0; i < buttons.length; i++) {
        const id = $(buttons[i]).data('menu');
        const top = $(buttons[i]).offset().top;
        const left = $(buttons[i]).parent().offset().left;
        $('#' + id).offset({ left: left, top: top + 25 });
    }

    $('.drop').click(function () {
        const id = $(this).data('menu');
        $(`.drop-menu[id!=${id}]`).fadeOut(200);
        $('#' + id).fadeToggle(200);
    });
}

function getOwner() {
    const logi = (($('#logi-id')).val().split('-'))[0];
    $.get('/Manager/ajax/owners', { logi: logi }, function (data) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            html += `<option value='${data[i].Name + '-' + data[i].ID}'>${data[i].Name}</option>`;
        }
        $('#owner-id').html(html);
    });
}

function setPartTime() {
    $('.link-schedule').click(function () {
        const id = $(this).data('id');
        const url = `/Manager/Timeline?RouteID=${id}`;
        const name = $(this).data('name');
        const contract = $(this).data('contract');
        $('#route-name').text(name);
        $('#contract').text(contract);
        $('#manage-pt').show();
        $('#schedule-frame').attr('src', url);
        $('#modal').fadeIn(400);
    });
}

var GuCnt=0;
var Gu='';
var LogiName='';
function setGu() {
    $('#select-gu').change(function() {
        const gu=$(this).val();
        Gu=gu;
        $.get(`/Manager/ajax/Gu/Cnt?gu=${gu}구`, function(data) {            
            GuCnt=data.Cnt+1;
            setRouteName();
        })
    });
}

function setRouteName() {
    var route_name=Gu+'-'+LogiName+'-'+GuCnt
    $('#input-name').val(route_name);
    $('#route-show').text(route_name);
}