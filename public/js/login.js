$(function () {
    $('#login-btn').click(function () {
        login();
    });

    $('#input_pw').keydown(function (key) {
        if (key.keyCode == 13) {
            login();
        }
    });
    $('#input_email').focus();
});

//login method
function login() {
    if ($('#input_email').val() == '') {
        alert('메일을 입력하세요');
        return;
    } else if ($('#input_pw').val() == '') {
        alert('비밀번호를 입력하세요');
        return;
    } else {
        //login by ajax async
        $.ajax({
            url: "/Login",
            type: "post",
            data: {
                email: $('#input_email').val(),
                pw: $('#input_pw').val()
            },
            dataType: "json",
            success: function (data) {
                //login success
                if (data.userName) {
                    alert('환영합니다 ' + data.userName + ' 님');
                    // move to each other page
                    switch (data.userCat) {
                        case 1:
                            location.href = '/Manager';
                            break;
                        case 2:
                            location.href = '/Bus/Status';
                            break;
                            case 3:
                                location.href='/Owner/ItemList';
                                break;
                    }
                } else {
                    alert('아이디와 비밀번호를 확인하세요');
                }
            },
            error: function (err) {
            }
        });
    }
}