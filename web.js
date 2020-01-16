exports.startApp = (port) => {
    const express = require('express');
    const body_parser = require('body-parser');
    const session = require('express-session');
    const app = express();
    const sql = require('./sql');

    app.set('view engine', 'ejs');
    app.set('views', './Views');
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
                    userCat: results.MemberCat
                };
                // save user info into session
                req.session.userName = user.userName;
                req.session.userID = user.userID;
                req.session.userCat = user.userCat;
                // return to client
                res.json(user);
            } else {
                console.log('login failed');
                const user = {};
                res.json(user);
            }
        });
    });

     // Bus
     app.get('/Bus/Status', (req, res) => {
        res.render('./Bus/status');
    });

    app.get('/Bus/Manage/Route', (req, res)=> {
        res.render('./Bus/manageRoute');
    });

    app.get('/Bus/Get/Drivers', (req, res)=> {

    })

    // Manager
    //sign up choose
    app.get('/Manager/SignUp', (req, res)=> {
        res.render('./Manager/signup');
    })

    //sign up
    app.get('/Manager/SignUp/Form', (req, res)=> {
        const Cat=req.query.MemberCat;
        res.render('./Manager/signup_form', {MemberCat:Cat});
    });

    app.listen(port, () => {
        console.log('web server runings on: ' + port);
    })
}

 // get user info from session
 function getUser(req) {
    var id = req.session.userID;
    var name = req.session.userName;
    var cat = req.session.userCat;
    if (!id) {
        id = '';
        cat = '';
        name = '';
    }
    const info = {
        userID: id,
        userName: name,
        userCat: cat
    }
    return info;
}