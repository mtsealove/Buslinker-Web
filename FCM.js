const FCM = require('fcm-node');
// const serverKey = 'AAAApir3_f0:APA91bHA37Jj6CAyEWW-4Tk_6EXDgefahRuj6bZWs6782c-tj9nwfn-HHyMI9pi_Har7oj7KoJTlT0Fv0mfMguuU0R-QcHEMxGmHYnngSquX3Q-n7FgRF-HP4qJmKtTIsrwf2ZS0oalp';
const serverKey=`AAAA1ilNsl4:APA91bENxQuCCDu4qOC8ecPAg7LLlgK8tqqsbiyoAK_uoi1PJHustUqyXIg3qcyqgO9Tnpq6ua-BS7-uFIMhPhnHvZN-CAcSX3BW1rMatCmisxQDxo7pj3ylXfk_APMIxqPQG9jP9Uxe`;
const fcm = new FCM(serverKey);

exports.sendDriverSchedule = (token, dates) => {
    var dateStr = dates[0];
    if (dates.length > 2) {
        dateStr += '등 ' + dates.length + '건';
    }
    var message = {
        to: token,
        notification: {
            title: '스케줄 변경',
            body: '스케줄이 변경되었습니다.',
        },

        data: {  //you can send only notification or only data(or include both)
            action: 'schedule',
            message: '스케줄이 변경되었습니다.\n변경일: ' + dateStr
        }
    };

    fcm.send(message, function (err, response) {
        if (err) {
            console.error(err);
            console.log('fcm error');
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}

exports.sendDriverCommute = (token, action) => {
    var actionStr = "";
    var title = "";
    if (action) {
        actionStr = "start"
        title = "출근"
    } else {
        actionStr = "end"
        title = "퇴근";
    }
    var message = {
        to: token,
        notification: {
            title: title,
            body: '출퇴근 알림',
        },

        data: {  //you can send only notification or only data(or include both)
            action: actionStr,
        }
    };

    fcm.send(message, function (err, response) {
        if (err) {
            console.error(err);
            console.log('fcm error');
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}

const ptServerKey = 'AAAAPLqc2pw:APA91bHQd8iIQbvCVT1dm_kOE91D7pqxH3Rxr37wwPYwaquSPGzcEh8UvXEujA1IFan2U5TuB4Ibk2NUoLAs0Ic3GVindl_IH7p1rbs852Y9scBIi4FMrd_VkGxW812vz3mLht4H3yH7';
const ptFcm = new FCM(ptServerKey);
exports.sendPtSchedule = (token, dates) => {
    var message = {
        to: token,

        data: {  //you can send only notification or only data(or include both)
            action: 'schedule',
            message: '스케줄이 변경되었습니다.\n변경일: ' + dates
        }
    };

    ptFcm.send(message, function (err, response) {
        if (err) {
            console.error(err);
            console.log('fcm error');
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}