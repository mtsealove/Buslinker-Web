const auth = require('./auth');
const Ok = {
    Result: true
};
const Not = {
    Result: false
};
const sql = require('./sql');
exports.startManager = (app) => {
    const multer = require('multer');
    const upload = multer({ dest: 'public/uploads/' });
    // index
    app.get('/Manager', (req, res) => {
        const user = auth.getUser(req);
        if (user.userID) {
            sql.getStatus(getDate(),null, null, (timeline)=>{
                console.log(timeline);
                res.render('./Manager/index', { user: user, timeline:timeline });
            });
        } else {
            res.redirect('/');
        }
    });

    //sign up choose
    app.get('/Manager/SignUp', (req, res) => {
        const user = auth.getUser(req);
        if (user.userID) {
            res.render('./Manager/signup', { user: user });
        } else {
            res.redirect('/');
        }
    });

    // create Member
    const cpUpload = upload.fields([{ name: 'profile', maxCount: 1 }, { name: 'biz', maxCount: 1 }]);
    app.post('/Manager/SignUp', cpUpload, (req, res) => {
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
        const user = auth.getUser(req);
        const Cat = req.query.MemberCat;
        if (user.userID) {
            res.render('./Manager/signup_form', { MemberCat: Cat });
        } else {
            res.redirect('/');
        }
    });

    // manage route
    app.get('/Manager/Route', (req, res) => {
        var order = req.query.order;
        var current = req.query.current;

        if (!order) {
            order = 'asc';
        }

        if (!current) {
            current = 'true';
        }

        const user = auth.getUser(req);
        if (user.userID) {
            sql.getLogis((logis) => {
                sql.getBusList((bus) => {
                    sql.getRoute(order, current, null, (routes) => {
                        res.render('./Manager/route', { user: user, logis: logis, bus: bus, routes: routes });
                    });
                });
            });
        } else {
            res.redirect('/');
        }
    });

    app.get('/Manager/Timeline', (req, res)=>{
        const routeID=req.query.RouteID;
        sql.getTimelineShort(routeID, (timeline)=>{
            sql.getPartTimeMembers((part)=>{
                res.render('./Manager/timeline', {timeline:timeline, part: part, routeID: routeID});
            });
        });
    });

    app.post('/Manager/Timeline', (req, res)=> {
        const routeID=req.body['routeID'];
        var remove=req.body['remove'];
        console.log('remove');
        console.log(remove);
        var part=req.body['part'];
        var removeList=[];
        var partList=[];
        if(Array.isArray(remove)) {
            removeList=remove;
        } else {
            if(remove){
                removeList.push(remove);
            }
        }

        if(Array.isArray(part)) {
            partList=part;
        } else {
            if(part){
                partList.push(part);
            }
        }
        sql.updateTimeLinePt(routeID, removeList, partList, (result)=>{
            if(result) {
                res.send(`<script>alert('정보가 등록되었습니다');location.href='/Manager/TimeLine?RouteID=${routeID}';</script>`);
            } else {
                res.send(`<script>alert('오류가 발생하였습니다.');history.go(-1);</script>`);
            }
        });

    });

    app.get('/Manager/ajax/owners', (req, res) => {
        const logi = req.query.logi;
        sql.getOwners(logi, (result) => {
            res.json(result);
        });
    });

    //creat route
    app.post('/Manager/Create/Route', (req, res) => {
        const body = req.body;
        const alias = body['name'];
        const bus = body['bus'];
        const gu=body['gu'];

        const station = {
            name: body['station-name'],
            addr: body['station-addr'],
            start: body['station-start'],
            end: body['station-end']
        };

        const logi = {
            id: (body['logi-id'].split('-'))[0],
            name: (body['logi-id'].split('-'))[1],
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

        sql.createRoute(bus, alias, station, logi, empty, owners, contract, gu,(result) => {
            if (result) {
                res.send(`<script>alert('운행정보가 등록되었습니다.');location.href='/Manager/Route';</script>`);
            } else {
                res.send(`<script>alert('오류가 발생하였습니다.');</script>`);
            }
        });
    });

    // remove route
    app.post('/Manager/Remove/Route', (req, res) => {
        const id = req.body['id'];
        sql.removeRoute(id, (result) => {
            if (result) {
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
    app.get('/Manager/ItemList', (req, res) => {
        const user = auth.getUser(req);
        var date = req.query.date;
        if (!date) {
            var d = new Date();
            date=d.getFullYear()+'-';
            if(d.getMonth()<9) {
                date+='0';
            }
            date+=(d.getMonth()+1)+'-';
            if(d.getDate()<10){
                date+='0';
            }
            date+=d.getDate();
        }
        console.log(date);
        if (user.userID) {
            sql.getRouteItem(date, null, (route) => {
                res.render('./Manager/itemList', { user: user, route: route, current:date });
            });
        } else {
            res.redirect('/');
        }
    });

    app.get('/Manager/Sector', (req, res)=> {
        const user=auth.getUser(req);
        const listID=req.query.ListID;
        if(user.userID) {
            sql.getItemSector(listID, (sector)=> {
              res.render('./Manager/sector', {sector: sector});
            });
        } else {
            res.redirect('/');
        }
    });

    app.get('/Manager/Calculate', (req, res) => {
        const user = auth.getUser(req);
        var start = req.query.start;
        var end = req.query.end;
        var corp = req.query.corp;
        if (!start) {
            var date = new Date();
            start = date.getFullYear() + '-' + (date.getMonth() + 1) + '-01';
            end = date.getFullYear() + '-' + (date.getMonth() + 2) + '-01';
        }
        if (user.userID) {
            sql.getLogis((logis) => {
                if (!corp) {
                    corp = logis[0].ID;
                }
                sql.getOwnerFee(start, end, corp, null, (ownerFee) => {
                    sql.getBusFee( end, null, (busFee)=>{
                        sql.getLogiFee(start, end, null, (logiFee)=>{
                            res.render('./Manager/calculate', { user: user, ownerFee: ownerFee, start: start, logis: logis, corp: corp, busFee: busFee, logiFee: logiFee });
                        });
                    });
                })
            });

        } else {
            res.redirect('/');
        }
    });
    // manger resource
    app.get('/Manager/Resource', (req, res) => {
        const user = auth.getUser(req);
        if (user.userID) {
            sql.getAllCorpResource((resource) => {
                res.render('./Manager/resource', { user: user, res: resource });
            });
        } else {
            res.redirect('/');
        }
    });

    app.get('/Manager/ajax/Gu/Cnt', (req, res)=>{
        const gu=req.query.gu;
        sql.getGuCnt(gu, (rs)=>{
            res.json({
                Cnt: rs
            })
        });
    });

    app.post('/Manager/ajax/Update/Commission', (req, res)=>{
        const id=req.body['id'];
        const commission=req.body['commission'];
        sql.updateCommission(id, commission, (rs)=>{
            if(rs){
                res.json(Ok);
            } else {
                res.json(Not);
            }
        });
    });

    app.post('/Manager/ajax/Update/AdFee', (req, res)=>{
        const id=req.body['id'];
        const fee=req.body['fee'];

        sql.updateAdFee(id, fee, (rs)=>{
            if(rs) {
                res.json(Ok);
            } else {
                res.json(Not);
            }
        });
    });

    app.post('/Manager/ajax/Update/LogiRunFee', (req, res)=>{
        const id=req.body['id'];
        const fee=req.body['fee'];
        sql.updateLogiRunFee(id, fee, (rs)=>{
            if(rs) {
                res.json(Ok);
            } else {
                res.json(Not);
            }
        });
    });

    app.post('/Manager/ajax/Update/BusFee', (req, res)=>{
        const id=req.body['id'];
        const fee=req.body['fee'];
        sql.updateBusFee(id, fee, (rs)=>{
            if(rs) {
                res.json(Ok);
            } else {
                res.json(Not);
            }
        });
    });

    app.post('/Manager/ajax/Update/DefaultFee', (req, res)=>{
        const id=req.body['id'];
        const fee=req.body['fee'];
        sql.updateDefaultFee(id, fee, (rs)=>{
            if(rs) {
                res.json(Ok);
            } else {
                res.json(Not);
            }
        });
    });
}

function getDate() {
    var date = new Date();
    var str = date.getUTCFullYear() + '-';
    if (date.getMonth() < 9) {
        str += '0';
    }
    str += (date.getMonth() + 1) + '-';
    if (date.getDate() < 10) {
        str += '0';
    }
    str += date.getDate();

    return str;
}