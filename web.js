exports.startApp = (port) => {
    const express = require('express');
    const body_parser = require('body-parser');
    const session = require('express-session');
    const app = express();
    const sql = require('./sql');
    const multer = require('multer');
    const upload = multer({ dest: 'public/uploads/' });

    const Ok = {
        Result: true
    };
    const Not = {
        Result: false
    };

    app.set('view engine', 'ejs');
    app.set('views', './Views');
    app.use(body_parser.json({limit: '150mb'}));
    app.use(body_parser.urlencoded({ extended: true, limit: '150mb', parameterLimit: 2100 }));
    app.use(session({
        key: 'sid',
        secret: 'secret',
        resave: 'false',
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 10  //로그인 유지 시간(10시간)
        }
    }));
    app.use('/public', express.static('public'));

    // index page
    app.get('/', (req, res) => {
        res.render('index', { user: getUser(req) });
    });

    // intro page
    app.get('/Introduction', (req, res) => {
        res.render('intro', { user: getUser(req) });
    })

    // ask page
    app.get('/Ask', (req, res) => {
        sql.getSubjects((results) => {
            res.render('ask', { user: getUser(req), subjects: results });
        })
    })

    // create ask
    app.post('/Ask', (req, res) => {
        const email = req.body['email'];
        const subject = req.body['subject'];
        const message = req.body['message'];

        sql.createAsk(email, subject, message, (complete) => {
            if (complete) {
                res.send('<script>alert("문의사항이 전송되었습니다.");location.href="/Ask";</script>');
            } else {
                res.send('<script>alert("오류가 발생하였습니다"); history.go(-1)</script>');
            }
        });
    })

    // login page
    app.get('/Login', (req, res) => {
        if (getUser(req).userID) {  //already logined
            res.send('<script>alert("잘못된 접근입니다");history.go(-1)</script>');
        } else {
            res.render('login');
        }
    });

    // login ajax
    app.post('/Login', (req, res) => {
        const email = req.body['email'];
        const pw = req.body['pw'];

        sql.login(email, pw, (results) => {
            if (results) {
                const user = {
                    userID: results.ID,
                    userName: results.Name,
                    userCat: results.MemberCat,
                    profile: results.ProfilePath
                };
                // save user info into session
                req.session.userName = user.userName;
                req.session.userID = user.userID;
                req.session.userCat = user.userCat;
                req.session.profile = user.profile;

                // return to client
                res.json(user);
            } else {
                console.log('login failed');
                const user = {};
                res.json(user);
            }
        });
    });

    // logout
    app.get('/Logout', (req, res) => {
        req.session.destroy();
        res.send(`<script>alert('로그아웃 되었습니다.');location.href='/'</script>`);
    });

    // Bus
    app.get('/Bus/Status', (req, res) => {
        const user = getUser(req);
        if (user.userID) {
            res.render('./Bus/status', { user: user });
        } else {
            res.redirect('/');
        }
    });

    // show route list
    app.get('/Bus/Manage/Route', (req, res) => {
        const user = getUser(req);
        if (user.userID) {
            sql.getRoute('asc', 'true', user.userID, (routeList)=> {
                console.log(routeList);
                res.render('./Bus/manageRoute', { user: user, routes: routeList});
            })
        } else {
            res.redirect('/');
        }
    });

    // set driver and bus for rouete
    app.get('/Bus/Manage/Route/Schedule', (req, res)=> {
        const user= getUser(req);
        sql.getDrivers(user.userID, (drivers)=> {
            sql.getBus(user.userID, null, null, (bus)=> {
                console.log(drivers);
                console.log(bus);
                res.render('./Bus/manageSchedule', {user:user, bus:bus, drivers:drivers});        
            });
        })
    }); 

    app.get('/Bus/Manage/Driver', (req, res) => {
        const user = getUser(req);
        if (user.userID) {
            sql.getDrivers(user.userID, (results) => {
                res.render('./Bus/manageDriver', { driverList: results, user: user });
            });
        } else {
            res.redirect('/');
        }
    });

    // driver sign up form 
    app.get('/Bus/Manage/Create/Driver', (req, res) => {
        const user = getUser(req);
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
        const bus_id = req.body['bus_id'];
        const corp = req.session.userID;

        sql.createDriver(corp, name, id, pw, phone, bus_id, profilePath, licensePath, (result) => {
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

    app.get('/Bus/Manage/Bus', (req, res) => {
        var order = req.query.order;
        var asc = req.query.asc;
        const user = getUser(req);
        const corp = user.userID;
        if (user.userID) {
            sql.getBus(corp, order, asc, (results) => {
                res.render('./Bus/manageBus', { busList: results, user: user });
            });
        } else {
            res.redirect('/');
        }
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

    })

    // Manager

    // index
    app.get('/Manager', (req, res) => {
        const user = getUser(req);
        if (user.userID) {
            res.render('./Manager/index', { user: user });
        } else {
            res.redirect('/');
        }
    });

    //sign up choose
    app.get('/Manager/SignUp', (req, res) => {
        const user = getUser(req);
        if (user.userID) {
            res.render('./Manager/signup', { user: user });
        } else {
            res.redirect('/');
        }
    });

    // create Member
    const cpUpload = upload.fields([{ name: 'profile', maxCount: 1 }, { name: 'biz', maxCount: 1 }]);
    app.post('/Manager/SignUp', cpUpload, (req, res) => {
        console.log(req.files['profile']);
        console.log(req.files['biz']);
        var filePath = __dirname + '/' + (req.files['biz'][0]).path;

        const email = req.body['email'];
        const password = req.body['password'];
        const phone = req.body['phone'];
        const cat = req.body['cat'];
        const center = req.body['center'];
        var ProfilePath = '';
        const garage = req.body['garage'];

        if (req.files['profile'] != null) {
            ProfilePath = (req.files['profile'][0]).path;
        }

        var request = require('request');
        const fs = require('fs');
        const options = {
            url: 'https://ocr.api.friday24.com/business-license',
            headers: {
                'Authorization': 'Bearer kmRN36IXKLDiI6fy7BKz',
                'Content-Type': 'multipart/form-data'
            },
            formData: {
                'file': fs.createReadStream(filePath),
            }
        };

        request.post(options, (error, response, body) => {
            if (error) {
                console.error(error);
            } else {
                const json = JSON.parse(body);
                const name = json.license.corpName;
                const bizNum = json.license.bizNum;
                const bizAddr = json.license.addr;
                const bizClass = json.license.bizClass;
                sql.createMember(name, email, password, cat, phone, ProfilePath, bizNum, bizAddr, bizClass, center, garage, (result) => {
                    if (result) {
                        res.redirect('/Manager/SignUp/Complete');
                    }
                });
            }
        });
    });

    app.get('/Manager/SignUp/Complete', (req, res) => {
        res.render('./Manager/complete');
    });

    //sign up
    app.get('/Manager/SignUp/Form', (req, res) => {
        const user = getUser(req);
        const Cat = req.query.MemberCat;
        if (user.userID) {
            res.render('./Manager/signup_form', { MemberCat: Cat });
        } else {
            res.redirect('/');
        }
    });

    // manage route
    app.get('/Manager/Route', (req, res) => {
        var order=req.query.order;
        var current=req.query.current;
        
        if(!order) {
            order='asc';
        }

        if(!current) {
            current='true';
        } 

        const user = getUser(req);
        if (user.userID) {
            sql.getLogis((logis) => {
                console.log('1');
                sql.getOwners((owners) => {
                    console.log('2');
                    sql.getBusList((bus) => {
                        console.log('3');
                        sql.getRoute(order, current, null,(routes)=> {
                            console.log('4');
                            res.render('./Manager/route', { user: user, logis: logis, owners: owners, bus: bus, routes:routes });
                        }); 
                    });
                });
            });
        } else {
            res.redirect('/');
        }
    });

    //creat route
    app.post('/Manager/Create/Route', (req, res) => {
        const body = req.body;
        console.log(body);
        const alias = body['name'];
        const bus = body['bus'];

        const station = {
            name: body['station-name'],
            addr: body['station-addr'],
            start: body['station-start'],
            end: body['station-end']
        };

        const logi = {
            id: (body['logi-id'].split('-'))[0],
            name:(body['logi-id'].split('-'))[1],
            start: body['logi-start'],
            end: body['logi-end']
        };

        const empty = {
            name: body['empty-name'],
            addr: body['empty-addr'],
            time: body['empty-time']
        };

        const contract = {
            start: body['contract-start'],
            end: body['contract-end']
        };

        const owners = [];

        // is array
        if (Array.isArray(body['owner-id'])) {
            for (var i = 0; i < body['owner-id'].length; i++) {
                owners.push({
                    id: body['owner-id'][i],
                    time: body['owner-time'][i]
                });
            }
        } else {
            owners.push({
                id: body['owner-id'],
                time: body['owner-time']
            });
        }

        sql.createRoute(bus, alias, station, logi, empty, owners, contract, (result)=> {
            if(result) {
                res.send(`<script>alert('운행정보가 등록되었습니다.');location.href='/Manager/Route';</script>`);
            } else {
                res.send(`<script>alert('오류가 발생하였습니다.');</script>`);
            }
        }); 
    });

    // remove route
    app.post('/Manager/Remove/Route', (req, res)=> {
        const id=req.body['id'];
        sql.removeRoute(id, (result)=>{
            if(result) {
                res.json(Ok);
            } else {
                res.json(Not);
            }
        });
    }); 

    //id reuse check ajax
    app.get('/Manager/Reuse', (req, res) => {
        const id = req.query.id;
        sql.checkId(id, (result) => {
            if (result) {
                res.json(Ok);
            } else {
                res.json(Not);
            }
        });
    });

    // manage item list
    app.get('/Manager/ItemList', (req, res)=> {
        res.render('./Manager/itemList', {user: getUser(req)});
    });

    // owner
    app.get('/Owner/ItemList', (req, res)=> {
        const user=getUser(req); 
        var yyyymm=req.query.yymm;
        if(!yyyymm) {
            const date=new Date();
            yyyymm=date.getFullYear()+'-'+date.getMonth()+1;
        }
        sql.getItemList(user.userID, yyyymm, (results)=>{
            console.log(results);
            res.render('./Owner/itemList', {user: user, itemList:results});
        });
    });

    // post item 
    app.post('/Owner/Create/ItemList', (req, res)=> {
        const user=getUser(req);
        const ids=req.body['id'];
        const phones=req.body['phone'];
        const names=req.body['name'];
        const item_names=req.body['item_name'];
        const addrs=req.body['addr'];

        sql.createItemList(user.userID, ids, item_names, names, phones, addrs, (result)=> {
            if(result) {
                console.log('success');
                res.send(`<script>alert('물량이 등록되었습니다.');location.href='/Owner/ItemList';</script>`);
            } else {
                res.send(`<script>alert('오류가 발생하였습니다.');history.go(-1);</script>`);
            }
        })
    });

    // get item list by ajax
    app.get('/Onwer/Get/ItemList', (req, res)=> {
        const listID=req.query.listID;
        const user=getUser(req);

        sql.getItemListDetail(user.userID, listID, (result)=> {
            if(result) {
                res.json(result);
            } 
        }); 
    });

    const xlsx=require('xlsx');
    app.post('/Owner/Upload/Excel', upload.single('item_file'), (req, res)=> {
        console.log(req.file);
        const path=__dirname+'/'+req.file.path;
        let workbook=xlsx.readFile(path);
        let sheetName=workbook.SheetNames[0];
        let worksheet=workbook.Sheets[sheetName];
        const sheetJson=xlsx.utils.sheet_to_json(worksheet);
        console.log(sheetJson);
        res.json(sheetJson);
    }); 

    app.listen(port, () => {
        console.log('web server runings on: ' + port);
    });
}

// get user info from session
function getUser(req) {
    var id = req.session.userID;
    var name = req.session.userName;
    var cat = req.session.userCat;
    var profile = req.session.profile;
    if (!id) {
        id = '';
        cat = '';
        name = '';
        profile = '';
    }
    const info = {
        userID: id,
        userName: name,
        userCat: cat,
        profile: profile
    }
    return info;
}