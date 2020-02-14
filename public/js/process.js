$(function () {
    $('#owner-div').hide();
    $('#bus-div').hide();
    $('.tab-item').click(function () {
        const filter = $(this).attr('data-filter');
        $('.tab-item').removeClass('tab-active');
        $(this).addClass('tab-active');
        $('#logistic-div').fadeOut(400);
        $('#owner-div').fadeOut(400);
        $('#bus-div').fadeOut(400);
        const top=$('.main').scrollTop();
        setTimeout(function () {
            switch (filter) {
                case '0':
                    $('#logistic-div').fadeIn(400);
                    break;
                case '1':
                    $('#owner-div').fadeIn(400);
                    break;
                case '2':
                    $('#bus-div').fadeIn(400);
                    break;
            }
            fnMove(top);
        }, 400);
        
    });
});

function fnMove(top) {
    setTimeout(function(){
        $('.main').animate({scrollTop : top}, 300);
    }, 400);
}