$(function () {
    setMainHeight();
    $(window).resize(setMainHeight);

    $('.main').scroll(function () {
        var current = $(this).scrollTop();
        var height = $('#contents').height();
        var outer = $('.main').innerHeight();
        const total = height - outer;
        const percent=(current/total)*100;
        $("#indicator").css('width', percent+'%');

    })
});

function setMainHeight() {
    var height = $(window).height();
    height -= 70;
    $('.main').css('height', height);
}