function inputPhoneNumber(obj) {
    var number = obj.value.replace(/[^0-9]/g, "");
    var phone = "";
    if (number.length < 4) {
        return number;
    } else if (number.length < 7) {
        phone += number.substr(0, 3);
        phone += "-";
        phone += number.substr(3);
    } else if (number.length < 11) {
        phone += number.substr(0, 3);
        phone += "-";
        phone += number.substr(3, 3);
        phone += "-";
        phone += number.substr(6);
    } else {
        phone += number.substr(0, 3);
        phone += "-";
        phone += number.substr(3, 4);
        phone += "-";
        phone += number.substr(7);
    }
    obj.value = phone;
}

function checkPassword(pw) {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const sp = '~!@#$%^&*()_+=-[{]}<,.>/?:';
    var upperB = false, lowerB = false, spB = false;

    for (var i = 0; i < upper.length; i++) {
        if (pw.indexOf(upper.charAt(i)) != -1) {
            upperB = true;
            break;
        }
    }
    for (var i = 0; i < lower.length; i++) {
        if (pw.indexOf(lower.charAt(i)) != -1) {
            lowerB = true;
            break;
        }
    }

    for (var i = 0; i < sp.length; i++) {
        if (pw.indexOf(sp.charAt(i)) != -1) {
            spB = true;
            break;
        }
    }

    if (upperB && lowerB && spB && pw.length >= 10) {
        return true;
    } else {
        return false;
    }
}

function checkEmail(email) {
    if (email.indexOf('@') == -1) {
        return false;
    } else if (email.indexOf('.com') == -1 && email.indexOf('.kr') == -1 && email.indexOf('.net')) {
        return false;
    } else if (email.length < 5) {
        return false;
    } else {
        return true;
    }
}