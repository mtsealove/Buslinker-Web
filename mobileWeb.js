exports.startApp = (app) => {
    const sql = require('./sqlMobile');
    const socketio = require('socket.io');

    const Ok = {
        Result: true
    };
    const Err = {
        Result: false
    };

    app.all('/*', function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
    });
    // login
    app.post('/mobile/Login', (req, res) => {
        const id = req.body['ID'];
        const pw = req.body['Password'];
        const cat = req.body['Cat'];
        const token = req.body['Token'];

        sql.Login(id, pw, cat, token, (result) => {
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
    app.get('/mobile/Driver/QR', (req, res) => {
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
                    Code: '0'
                });
            }
        });

    });

    // ask
    app.post('/mobile/Ask', (req, res) => {
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


    app.get('/mobile/Driver/My', (req, res) => {
        const id = req.query.ID;

        const date = getDate();
        sql.getDriverMy(id, date, (my) => {
            // console.log(my);
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

    app.get('/mobile/Pt/My', (req, res) => {
        const id = req.query.ID;
        sql.getPtMy(id, getDate(), (rs) => {
            // console.log(rs);
            res.json(rs);
        });
    });

    app.get('/mobile/Pt/Cnt', (req, res) => {
        const id = req.query.ID;
        sql.getPtCnt(id, getDate(), (rs) => {
            res.json(rs);
        });
    });

    app.post('/mobile/Pt/Action', (req, res) => {
        const id = req.body['ID'];
        const action = req.body['Action'];
        sql.updateAction(id, action, getDate(), (rs) => {
            if (rs) {
                res.json(Ok);
            } else {
                res.json(Err);
            }
        });
    });

    app.get('/mobile/Driver/Timeline', (req, res) => {
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

    app.get('/mobile/Pt/Timeline', (req, res) => {
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

    app.post('/mobile/Driver/Update/Location', (req, res) => {
        const id = req.body['ID'];
        const latitude = req.body['Latitude'];
        const longitude = req.body['Longitude'];
        const date = getDate();
        // console.log(id);
        // console.log(latitude);
        // console.log(longitude);

        sql.UpdateLocation(id, date, latitude, longitude, (result) => {
            if (result) {
                res.json(Ok);
            } else {
                res.json(Err);
            }
        })
    });

    app.get('/mobile/Driver/Calendar', (req, res) => {
        const id = req.query.ID;
        sql.getDriverCalendar(id, (calendar) => {
            res.json(calendar);
        })
    });

    app.get('/mobile/Pt/Calendar', (req, res) => {
        const id = req.query.ID;
        sql.getPtCalendar(id, (calendar) => {
            // console.log(calendar)
            res.json(calendar);
        });
    });
    app.get('/mobile/Driver/Mail', (req, res) => {
        const id = req.query.ID;
        sql.sendMail(id, (code) => {
            res.json(code);
        })
    });
    app.post('/mobile/Driver/Update/Password', (req, res) => {
        const id = req.body['ID'];
        const pw = req.body['Password'];

        sql.updatePassword(id, pw, (result) => {
            if (result) {
                res.json(Ok);
            } else {
                res.json(Err);
            }
        });
    });

    app.post('/mobile/Pt/Commute', (req, res) => {
        const id = req.body['ID'];
        const qr = req.body['Code'];
        console.log('commute');
        // console.log(id);
        // console.log(qr);        
        sql.checkQrCode(id, getDate(), qr, (result) => {
            if (result) {
                res.json(Ok);
            } else {
                res.json(Err);
            }
        });
    });

    // 출퇴근 여부 반환
    app.get('/mobile/Commute', (req, res) => {
        const id = req.query.ID;
        sql.getCommute(id, (commute) => {
            if (commute) {
                res.json(Ok);
            } else {
                res.json(Err);
            }
        });
    });


    var io = socketio.listen(server);
    var hash = [];
    var match = [];
    io.on('connect', socket => {
        console.log('connteced');
        socket.to(socket.id).emit("socket_id", socket.id);
        console.log(socket.id);

        socket.on('create', (data) => {
            console.log(data.RouteID);
            hash[socket.id] = data.RouteID;
            console.log(hash[socket.id]);
            const max = data.Max;
            sql.getRouteCnt(data.RouteID, (rs) => {
                if (rs) {
                    console.log(rs);
                    const gu = rs[0].Gu
                    // if not create
                    if (match[gu]) {

                    } else {
                        match[gu] = [];
                        for (var i = 0; i < rs.length; i++) {
                            match[gu].push({
                                RouteID: rs[i].RouteID,
                                PTID: null,
                                Level: 0,
                                Max: 4,
                                SocketID: null,
                                Ready: false,
                                Name: '미입장',
                                Profile: null
                            });
                        }
                    }
                    // update
                    for (var i = 0; i < match[gu].length; i++) {
                        if (data.RouteID == match[gu][i].RouteID) {
                            match[gu][i].PTID = data.PTID;
                            match[gu][i].SocketID = socket.id;
                            match[gu][i].Level++;
                            match[gu][i].Ready = true;
                            match[gu][i].Name = data.Name;
                            match[gu][i].Profile = data.Profile;
                        }
                    }
                    // check all ready 
                    var ready = true;
                    for (var i = 0; i < match[gu].length; i++) {
                        for (var j = 0; j < i; j++) {
                            if (match[gu][i].Level != match[gu][j].Level) {
                                ready = false;
                                break;
                            }
                        }
                    }

                    console.log(match);
                    for (var i = 0; i < match[gu].length; i++) {
                        io.to(match[gu][i].SocketID).emit('ready', match[gu]);
                    }
                    if (ready) {
                        for (var i = 0; i < match[gu].length; i++) {
                            match[gu][i].Ready = false;
                        }
                    }
                    var allDone = true;
                    for (var i = 0; i < match[gu].length; i++) {
                        if (match[gu][i].Max != match[gu][i].Level) {
                            allDone = false;
                        }
                    }
                    if (allDone) {
                        match[gu] = null;
                    }
                }
            });
        });
    });


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
