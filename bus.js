const auth = require('./auth');
const Ok = {
    Result: true
};
const Not = {
    Result: false
};
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });
const sql = require('./sql');
exports.startBus = (app) => {
    // Bus
    app.get('/Bus/Status', (req, res) => {
        const user = auth.getUser(req);
        if (user.userID) {
            res.render('./Bus/status', { user: user });
        } else {
            res.redirect('/');
        }
    });

    // show route list
    app.get('/Bus/Manage/Route', (req, res) => {
        const user = auth.getUser(req);
        if (user.userID) {
            sql.getRoute('asc', 'true', user.userID, (routeList) => {
                console.log(routeList);
                res.render('./Bus/manageRoute', { user: user, routes: routeList });
            })
        } else {
            res.redirect('/');
        }
    });

    // set driver and bus for rouete
    app.get('/Bus/Manage/Route/Schedule', (req, res) => {
        const routeID = req.query.routeID;
        const user = auth.getUser(req);
        if (user.userID) {
            sql.getDrivers(user.userID, (drivers) => {
                sql.getBus(user.userID, null, null, (bus) => {
                    sql.getTimeline(routeID, user.userID, (timeline) => {
                        res.render('./Bus/manageSchedule', { user: user, bus: bus, drivers: drivers, timeline: timeline, routeID: routeID });
                    });
                });
            })
        } else {
            res.redirect('/');
        }
    });

    app.post('/Bus/Manage/Timeline', (req, res) => {
        console.log(req.body);
        const routeID = req.body['routeID'];
        const reqBus = req.body['bus'];
        const reqDriver = req.body['driver'];
        const reqRemove = req.body['remove'];
        var bus = [];
        var driver = [];
        var removes = [];

        // check inputed data is array
        if (Array.isArray(reqBus)) {
            bus = reqBus;
        } else if (reqBus) {
            bus.push(reqBus);
        }

        if (Array.isArray(reqDriver)) {
            driver = reqDriver;
        } else if (reqDriver) {
            driver.push(reqDriver);
        }

        if (Array.isArray(reqRemove)) {
            removes = reqRemove;
        } else if (reqRemove) {
            removes.push(reqRemove);
        }

        sql.updateTimeLine(routeID, driver, bus, removes, (result) => {
            if (result) {
                res.json(Ok);
            } else {
                res.json(Not);
            }
        });

    });

    app.get('/Bus/Manage/Driver', (req, res) => {
        const user = auth.getUser(req);
        if (user.userID) {
            sql.getDrivers(user.userID, (results) => {
                res.render('./Bus/manageDriver', { driverList: results, user: user });
            });
        } else {
            res.redirect('/');
        }
    });

    app.get('/Bus/Manage/Resource', (req, res) => {
        var order = req.query.order;
        var asc = req.query.asc;
        const user = auth.getUser(req);
        const corp = user.userID;
        if (user.userID) {
            sql.getBus(corp, order, asc, (bus) => {
                sql.getDrivers(user.userID, (drivers) => {
                    res.render('./Bus/manageResource', { busList: bus, user: user, driverList: drivers });
                })
            });
        } else {
            res.redirect('/');
        }
    });

    // show each schedule
    app.get('/Bus/View/Schedule', (req, res) => {
        if (req.session.userID) {
            const driver = req.query.driver;
            const bus = req.query.bus;
            const part = req.query.part;
            if (driver) {
                sql.getDriverEvent(driver, (event) => {
                    console.log(event);
                    res.render('./Bus/viewSchedule', { event: event, cat: 'driver' });
                });
            } else if (bus) {
                sql.getBusEvent(bus, (event) => {
                    console.log(event);
                    res.render('./Bus/viewSchedule', { event: event, cat: 'bus' });
                });
            } else if (part) {
                sql.getPartTimeEvent(part, (event) => {
                    res.render('./Bus/viewSchedule', { event: event, cat: 'part' });
                });
            } else {
                res.redirect('/');
            }
        }
    });

    // driver sign up form 
    app.get('/Bus/Manage/Create/Driver', (req, res) => {
        const user = auth.getUser(req);
        const corp = user.userID;
        if (user.userID) {
            sql.getBus(corp, null, null, (results) => {
                res.render('./Bus/createDriver', { buslist: results, user: user });
            });
        } else {
            res.redirect('/');
        }
    });

    // create driver
    const signUpDriver = upload.fields([{ name: 'profile', maxCount: 1 }, { name: 'license', maxCount: 1 }]);
    app.post('/Bus/Manage/Create/Driver', signUpDriver, (req, res) => {
        var profilePath = '', licensePath = '';
        // profile maybe not selected
        if (req.files['profile']) {
            profilePath = (req.files['profile'][0]).path;
        }
        if (req.files['license']) {
            licensePath = (req.files['license'][0]).path;
        }

        const name = req.body['name'];
        const id = req.body['id'];
        const pw = req.body['pw'];
        const phone = req.body['phone'];

        const corp = req.session.userID;

        sql.createDriver(corp, name, id, pw, phone, 0, profilePath, licensePath, (result) => {
            if (result) {
                res.send(`<script>alert('회원가입이 완료되었습니다');location.href='/Bus/Manage/Driver';</script>`);
            } else {
                res.send(`<script>alert('오류가 발생하였습니다');history.go(-1);</script>`);
            }
        });
    });

    // remove driver by ajax
    app.post('/Bus/Manage/Remove/Driver', (req, res) => {
        const corp = req.session.userID;
        const id = req.body['id'];
        sql.removeDriver(corp, id, (result) => {
            if (result) {
                res.json(Ok);
            } else {
                res.json(Not);
            }
        });
    });

    // create bus by ajax
    app.post('/Bus/Manage/Create/Bus', (req, res) => {
        const corp = req.session.userID;
        const num = req.body['num'];
        sql.createBus(corp, num, (result) => {
            if (result) {
                res.json(Ok);
            } else {
                res.json(Not);
            }
        })
    });

    // remove bus by ajax
    app.post('/Bus/Manage/Remove/Bus', (req, res) => {
        const id = req.body['id'];
        sql.removeBus(id, (result) => {
            if (result) {
                res.json(Ok);
            } else {
                res.json(Not);
            }
        });
    })

    app.get('/Bus/Get/Drivers', (req, res) => {

    });

    app.get('/Bus/Calculate', (req, res) => {
        const user = auth.getUser(req);
        var end = req.query.end;
        if (user.userID) {
            if (!end) {
                var date = new Date();
                end = date.getFullYear() + '-';
                if (date.getMonth() + 1 < 9) {
                    end += '0';
                }
                end += (date.getMonth() + 2) + '-01';
            }
            var total = [];
            var year = new Date().getFullYear();
            for (var i = 1; i <= 12; i++) {
                var str = year + '-';
                if (i < 10) {
                    str += '0';
                }
                str += i + '-01';
                total.push({
                    Ym: str,
                    price: 0
                });
            }
            sql.getBusGraph(user.userID, (graph) => {
                sql.getLogiGraph(null, null, user.userID, (run) => {
                    for (var i = 0; i < total.length; i++) {
                        for (var j = 0; j < graph.length; j++) {
                            if (total[i].Ym == graph[j].Ym) {
                                total[i].price += graph[j].RunFee;
                            }
                        }
                        for (var j = 0; j < run.run.length; j++) {
                            if (total[i].Ym == run.run[j].Ym) {
                                total[i].price += run.run[j].RunFee * 9;
                            }
                        }
                    }
                    console.log('total');
                    console.log(total);
                    res.render('./Bus/calculate', { user: user, total: total });
                });
            });
        } else {
            res.redirect('/');
        }
    });
}