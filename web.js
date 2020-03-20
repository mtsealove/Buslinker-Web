exports.startApp = (port) => {
    const express = require('express');
    const body_parser = require('body-parser');
    const cookie_parser=require('cookie-parser');
    const session = require('express-session');
    const app = express();
    const sql = require('./sql');
    const manager = require('./manager');
    const bus = require('./bus');
    const owenr = require('./owner');
    const auth = require('./auth');
    const logistics = require('./logistics');

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

    app.use((req, res, next)=>{
        req.setTimeout(600000, ()=>{
            let err=new Error('Req Timeout');
            next(err);
        });
        res.setTimeout(600000, ()=>{
            let err=new Error('Res Timeout');
            next(err);
        });
        next();
    })

    manager.startManager(app);
    bus.startBus(app);
    owenr.startOwner(app, sql);
    logistics.startLogistics(app);

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
        sql.getSubjects((results) => {
            res.render('ask', { user: auth.getUser(req), subjects: results });
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
        if (auth.getUser(req).userID) {  //already logined
            res.send('<script>alert("잘못된 접근입니다");history.go(-1)</script>');
        } else {
            const id=req.cookies.id;
            const pw=req.cookies.pw;
            res.render('login', {id: id, pw:pw});
        }
    });

    // login ajax
    app.post('/Login', (req, res) => {
        const email = req.body['email'];
        const pw = req.body['pw'];
        const keep=req.body['keep'];
        console.log('keep: '+keep);
        console.log(typeof(keep));

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
                if(keep=='true') {
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

    // logout
    app.get('/Logout', (req, res) => {
        req.session.destroy();
        res.send(`<script>alert('로그아웃 되었습니다.');location.href='/'</script>`);
    });

    app.get('/ajax/Sector', (req, res)=>{
        const route=req.query.route;
        sql.getSectorList(route, (sector)=>{
            res.json(sector);
        });
    });

    app.listen(port, () => {
        console.log('web server runings on: ' + port);
    });
}