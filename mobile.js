exports.startApp = (port) => {
    const express = require('express');
    const body_parser = require('body-parser');
    const session = require('express-session');
    const app = express();
    const sql = require('./sqlMobile');

    const Ok = {
        Result: true
    };
    const Err = {
        Result: false
    };

    app.use(body_parser.json());
    app.use(body_parser.urlencoded({ extended: true, limit: '150mb' }));
    app.use(session({
        key: 'sid',
        secret: 'secret',
        resave: 'false',
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 10  //로그인 유지 시간(10시간)
        }
    }));

    // login
    app.post('/Login', (req, res) => {
        const id = req.body['ID'];
        const pw = req.body['Password'];
        const cat = req.body['Cat'];
        const token = req.body['Token'];
        console.log('login tried');

        sql.Login(id, pw, cat, token, (result) => {
            if (result) {
                const userInfo = {
                    Name: result.Name,
                    ID: result.ID,
                    ProfilePath: result.ProfilePath
                };
                console.log(userInfo);
                res.json(userInfo);
            } else {
                const fail = {
                    Name: null,
                    ID: null,
                    ProfilePath: null
                }
                console.log(fail);
                res.json(fail);
            }
        })
    });
    // create qr code
    app.get('/Driver/QR', (req, res) => {
        const driverID = req.query.ID;
        // creat random qr code
        const str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var qr = '';
        for (var i = 0; i < 16; i++) {
            qr += str[Math.floor(Math.random() * str.length)];
        }
        console.log('QR: ' + qr);
        sql.UpdateQr(driverID, qr, (result) => {
            if (result) {
                res.json({
                    Code: qr
                });
            } else {
                res.json({
                    CodeQR: '0'
                });
            }
        });

    });

    // ask
    app.post('/Ask', (req, res) => {
        const id = req.body['ID'];
        const msg = req.body['Message'];
        sql.CreateAsk(id, msg, (result) => {
            if (result) {
                res.json(Ok);
            } else {
                res.json(Err);
            }
        })
    });


    app.get('/Driver/My', (req, res) => {
        const id = req.query.ID;
        console.log(id);
        const date = getDate();
        sql.getDriverMy(id, date, (my) => {
            console.log(my);
            if (my) {
                res.json(my);
            } else {
                const fail = {
                    Name: null,
                    Locations: null,
                    Profile: null
                }
                res.json(fail);
            }

        });
    });

    app.get('/Pt/My', (req, res)=>{
        const id=req.query.ID;
        sql.getPtMy(id, getDate(), (rs)=>{
            res.json(rs);
        });
    });

    app.get('/Driver/Timeline', (req, res) => {
        const id = req.query.ID;
        var date = req.query.Date;
        if (!date) {
            date = getDate();
        }
        sql.getDriverTimeline(date, id, (result) => {
            if (result) {
                res.json(result);
            } else {
                res.json(null);
            }
        });
    });

    app.get('/Pt/Timeline', (req, res)=>{
        const id = req.query.ID;
        var date = req.query.Date;
        if (!date) {
            date = getDate();
        }

        sql.getPtTimeline(date, id, (result) => {
            if (result) {
                res.json(result);
            } else {
                res.json(null);
            }
        });
    });

    app.post('/Driver/Update/Location', (req, res) => {
        const id = req.body['ID'];
        const latitude = req.body['Latitude'];
        const longitude = req.body['Longitude'];
        const date = getDate();
        console.log(id);
        console.log(latitude);
        console.log(longitude);

        sql.UpdateLocation(id, date, latitude, longitude, (result) => {
            if (result) {
                res.json(Ok);
            } else {
                res.json(Err);
            }
        })
    });

    app.get('/Driver/Calendar', (req, res) => {
        const id = req.query.ID;
        sql.getDriverCalendar(id, (calendar) => {
            res.json(calendar);
        })
    });

    app.get('/Pt/Calendar', (req, res)=>{
        const id=req.query.ID;
        sql.getPtCalendar(id, (calendar)=>{
            console.log(calendar)
            res.json(calendar);
        });
    });
    app.get('/Driver/Mail', (req, res) => {
        const id = req.query.ID;
        sql.sendMail(id, (code) => {
            res.json(code);
        })
    });
    app.post('/Driver/Update/Password', (req, res) => {
        const id = req.body['ID'];
        const pw = req.body['Password'];

        sql.updatePassword(id, pw, (result)=>{
            if(result) {
                res.json(Ok);
            } else {
                res.json(Err);
            }
        });
    });

    app.post('/Pt/Commute', (req, res)=>{
        const id=req.body['ID'];
        const qr=req.body['Code'];
        console.log('commute');
        console.log(id);
        console.log(qr);        
        sql.checkQrCode(id, getDate(), qr, (result)=>{
            if(result) {
                res.json(Ok);
            } else {
                res.json(Err);
            }
        });
    })

    // 출퇴근 여부 반환
    app.get('/Commute', (req, res)=> {
        const id=req.query.ID;
        sql.getCommute(id, (commute)=>{
            console.log("commute: "+commute);
            if(commute){
                res.json(Ok);
            } else {
                res.json(Err);
            }
        });
    });

    app.listen(port, () => {
        console.log('mobile server runnings on: ' + port);
    })
}

function getDate() {
    const d = new Date();
    var dateStr = d.getFullYear() + '-';
    if (d.getMonth() < 9) {
        dateStr += '0';
    }
    dateStr += (d.getMonth() + 1) + '-';
    if (d.getDate() < 10) {
        dateStr += '0';
    }
    dateStr += d.getDate();
    return dateStr;
}