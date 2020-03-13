const auth = require('./auth');
const Ok = {
    Result: true
};
const Not = {
    Result: false
};
const sql = require('./sql');

exports.startLogistics = (app) => {
    app.get('/Logistics', (req, res) => {
        res.render('./Logi/index', { user: auth.getUser(req) });
    });

    app.get('/Logistics/ItemList', (req, res) => {
        const user = auth.getUser(req);
        var date = req.query.Date;
        if (!date) {
            date = getDate();
        }

        if (user.userID) {
            sql.getRouteItem(date, user.userID, (route) => {
                sql.getLogiItemList(user.userID, date, (itemRs)=>{
                    console.log(itemRs);
                    res.render('./Logi/itemList', { user: user, route: route, current: date, items: itemRs });
                });
            });
        } else {
            res.redirect('/');
        }
    });

    app.post('/Logistics/ajax/ItemList', (req, res) => {
        const startTime=new Date().getTime();
        console.log(startTime);
        const ids = req.body['id'];
        const names = req.body['name'];
        const addrs = req.body['addr'];
        const des_names = req.body['des_name'];
        const des_phones = req.body['des_phone'];
        const user=auth.getUser(req);
        var date=req.body['date'];
        if(!date) {
            date=getDate();
        }

        const items = [];
        for (var i = 0; i < ids.length; i++) {
            items.push({
                id: ids[i],
                name: names[i],
                addr: addrs[i],
                des_name: des_names[i],
                des_phone: des_phones[i]
            });
        }
        const cluster = [{ gu: '', Items: [] }];

        sql.getDong(items, (itemsRs) => {
            for (var i = 0; i < itemsRs.length; i++) {
                var index = null;
                // check cluster already exist
                var gu = itemsRs[i].gu;
                for (var j = 0; j < cluster.length; j++) {
                    if (gu == cluster[j].gu) {
                        index = j;
                    }
                }
                // gu already exist
                if (index != null) {
                    var dongIndex = null;
                    var dong = itemsRs[i].dong;
                    // check dong exist
                    for (var j = 0; j < cluster[index].Items.length; j++) {
                        if (dong == cluster[index].Items[j].dong) {
                            dongIndex = j;
                            break;
                        }
                    }
                    // dong exist
                    if (dongIndex == null) {
                        cluster[index].Items.push({
                            dong: dong,
                            Items: [itemsRs[i]]
                        });
                    } else {
                        //dong not exist
                        cluster[index].Items[dongIndex].Items.push(itemsRs[i]);
                    }
                } else {
                    // gu not exist
                    cluster.push({
                        gu: itemsRs[i].gu,
                        Items: [
                            {
                                dong: itemsRs[i].dong,
                                Items: [itemsRs[i]]
                            }
                        ]
                    });
                }
            }
            cluster.reverse();
            cluster.pop();
            cluster.reverse();

            sql.createLogiItemList(user.userID, date, cluster, (result)=>{
                if(result) {
                    console.log('success');
                    res.json(Ok);
                    const endTime=new Date().getTime();
                    console.log(endTime);
                    const time=endTime-startTime
                    console.log('time: '+time);
                } else {
                    console.log('fail');
                    res.json(Not);
                }
            });
        });
    });

    app.get('/Logistics/Route', (req, res)=>{
        const user=auth.getUser(req);
        if (user.userID) {
            sql.getLogiRoute('asc', 'true', user.userID, (routeList) => {
                console.log(routeList);
                res.render('./Logi/route', { user: user, routes: routeList });
            })
        } else {
            res.redirect('/');
        }
    });

    app.get('/Logistics/Route/Schedule', (req, res)=>{
        const routeID=req.query.route;
        sql.getTimelineShort(routeID, (timeline)=>{
            res.render('./Logi/schedule', {timeline:timeline});
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