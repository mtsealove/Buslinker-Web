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
        console.log('login tried');

        sql.Login(id, pw, cat, (result) => {
            if (result) {
                const userInfo = {
                    Name: result.Name,
                    ID: result.ID,
                    ProfilePath: result.ProfilePath
                };
                res.json(userInfo);
            } else {
                const fail = {
                    Name: null,
                    ID: null,
                    ProfilePath: null
                }
                res.json(fail);
            }
        })
    });
    // create qr code
    app.post('/CreateQr', (req, res) => {

    });

    // commute
    app.post('/Commute', (req, res) => {

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
    })

    app.listen(port, () => {
        console.log('mobile server runnings on: ' + port);
    })
}