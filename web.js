exports.startApp = (port) => {
    const express = require('express');
    const body_parser = require('body-parser');
    const cookie_parser = require('cookie-parser');
    const session = require('express-session');
    const app = express();
    const sql = require('./sql');
    const manager = require('./manager');
    const bus = require('./bus');
    const owenr = require('./owner');
    const mobileWeb = require('./mobileWeb');
    const auth = require('./auth');
    const logistics = require('./logistics');
    const https = require('https');
    const http = require('http');
    const fs = require('fs');

    app.set('view engine', 'ejs');
    app.set('views', './Views');
    app.use(body_parser.json({ limit: '150mb' }));
    app.use(body_parser.urlencoded({ extended: true, limit: '150mb', parameterLimit: 1000000 }));
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
    app.use(cookie_parser());
    
    /*
    app.use((req, res, next) => {
        if (!req.secure) {
            res.redirect('https://www.buslinker.kr' + req.url);
        } else {
            next();
        }
    });
    */

    app.use((req, res, next) => {
        req.setTimeout(1200000, () => {
            let err = new Error('Req Timeout');
            next(err);
        });
        res.setTimeout(1200000, () => {
            let err = new Error('Res Timeout');
            next(err);
        });
        next();
    });

    manager.startManager(app);
    bus.startBus(app);
    owenr.startOwner(app);
    logistics.startLogistics(app);
    mobileWeb.startApp(app);

    // index page
    app.get('/', (req, res) => {
        res.render('index', { user: auth.getUser(req) });
    });

    // intro page
    
    app.get('/Introduction', (req, res) => {
        res.render('intro', { user: auth.getUser(req) });
    })
    

    // ask page
    app.get('/Ask', (req, res) => {
        const cat = req.query.cat;
        var catKr = '';
        switch (cat) {
            case 'convention':
                catKr = '제휴 문의';
                break;
        }
        sql.getSubjects((results) => {
            res.render('ask', { user: auth.getUser(req), subjects: results, cat: catKr });
        })
    });

    app.get('/Faq', (req, res) => {
        sql.getFaq(1, (all) => {
            sql.getFaq(2, (logi) => {
                sql.getFaq(3, (bus) => {
                    sql.getFaq(4, (owner) => {
                        res.render('faq', { user: auth.getUser(req), all: all, logi: logi, bus: bus, owner: owner });
                    });
                });
            });
        });
    });

    app.get('/Rule/:rule', (req, res) => {
        const rule = req.params.rule;
        const user = auth.getUser(req)
        res.render('rules', { user: user, rule: rule });
    })

    // create ask
    app.post('/Ask', (req, res) => {
        const name = req.body['name'];
        const email = req.body['email'];
        const subject = req.body['subject'];
        const message = req.body['message'];

        const nodemailer = require('nodemailer');
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'buslinker1@gmail.com',  // gmail 계정 아이디를 입력
                pass: 'fybacakztlgksplq'          // gmail 계정의 비밀번호를 입력
            }
        });

        let mailOptions = {
            from: 'buslinker1@gmail.com',    // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
            to: 'buslinker1@gmail.com',                     // 수신 메일 주소
            subject: 'Buslinker 문의 - ' + subject,   // 제목
            text: '발신자: ' + name + '\n' + '내용: ' + message + '\n회신 메일: ' + email // 내용
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                res.send('<script>alert("오류가 발생하였습니다"); history.go(-1)</script>');
            }
            else {
                res.send('<script>alert("문의사항이 전송되었습니다.");location.href="/Ask";</script>');
            }
        });
    })

    // login page
    app.get('/Login', (req, res) => {
        if (auth.getUser(req).userID) {  //already logined
            res.send('<script>alert("잘못된 접근입니다");history.go(-1)</script>');
        } else {
            const id = req.cookies.id;
            const pw = req.cookies.pw;
            res.render('login', { id: id, pw: pw });
        }
    });

    // login ajax
    app.post('/Login', (req, res) => {
        const email = req.body['email'];
        const pw = req.body['pw'];
        const keep = req.body['keep'];
        console.log('keep: ' + keep);
        console.log(typeof (keep));

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
                if (keep == 'true') {
                    res.cookie('id', email);
                    res.cookie('pw', pw);
                } else {
                    res.cookie('id', '');
                    res.cookie('pw', '');
                }


                // return to client
                res.json(user);
            } else {
                console.log('login failed');
                const user = {};
                res.json(user);
            }
        });
    });

    app.get('/Notice', (req, res) => {
        var page = req.query.page;
        var title = req.query.query;
        if (!page) {
            page = 1;
        }
        sql.getNoticeList(page, title, (notice) => {
            sql.getNotciePage((page) => {
                res.render('notice', { user: auth.getUser(req), notice: notice, pageList: page });
            })
        })

    });

    app.get('/Notice/Create', (req, res) => {
        const user = auth.getUser(req);
        if (user.userCat == 1) {
            res.render('create_notice', { user: user });
        } else {
            res.send(`<script>alert('권한이 없습니다.');location.href='/';</script>`);
        }
    });

    app.get('/Notice/Detail', (req, res) => {
        const ID = req.query.ID;
        const user = auth.getUser(req);
        sql.getNotice(ID, (notice) => {
            res.render('notice_detail', { user: user, notice: notice });
        });
    });

    app.get('/Download', (req, res) => {
        const ogName = req.query.OgName;
        const path = 'public/uploads/notice/' + req.query.Path;
        res.download(path, ogName);
    })

    const multer = require('multer');
    const upload = multer({ dest: 'public/uploads/notice' });
    app.post('/Notice/Create', upload.single('attach'), (req, res) => {
        console.log(req.body);
        console.log(req.file);
        const user = auth.getUser(req);

        const title = req.body['title'];
        const contents = req.body['contents'];
        var ogFileName = null;
        var file = null;
        if (req.file) {
            ogFileName = req.file.originalname;
            file = req.file.filename;
        }

        sql.createNotice(title, contents, getDateTime(), user.userID, ogFileName, file, (rs) => {
            if (rs) {
                res.send(`<script>alert('공지사항이 등록되었습니다.');location.href='/Notice';</script>`)
            } else {
                res.send(`<script>alert('오류가 발생하였습니다.');</script>`)
            }
        });
    });

    // logout
    app.get('/Logout', (req, res) => {
        req.session.destroy();
        res.send(`<script>alert('로그아웃 되었습니다.');location.href='/'</script>`);
    });

    app.get('/ajax/Sector', (req, res) => {
        const route = req.query.route;
        sql.getSectorList(route, (sector) => {
            res.json(sector);
        });
    });


    // server
    /*
    const options = { // letsencrypt로 받은 인증서 경로
        ca: fs.readFileSync('/etc/letsencrypt/live/www.buslinker.kr/fullchain.pem'),
        key: fs.readFileSync('/etc/letsencrypt/live/www.buslinker.kr/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/www.buslinker.kr/cert.pem')
    };
    

    http.createServer(app).listen(80);
    https.createServer(options, app).listen(443);
    */

    // local
    
    app.listen(port, () => {
        console.log('web server runings on: ' + port);
    });
    



}

function getDateTime() {
    var date = new Date();
    var str = date.getUTCFullYear() + '-';
    if (date.getMonth() < 9) {
        str += '0';
    }
    str += (date.getMonth() + 1) + '-';
    if (date.getDate() < 10) {
        str += '0';
    }
    str += date.getDate() + ' ';
    if (date.getHours() < 10) {
        str += '0'
    }
    str += date.getHours() + ':';
    if (date.getMinutes() < 10) {
        str += '0';
    }
    str += date.getMinutes() + ':';
    if (date.getSeconds()) {
        str += '0';
    }
    str += date.getSeconds();
    return str;
}