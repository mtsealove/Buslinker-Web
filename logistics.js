const auth = require('./auth');
const Ok = {
    Result: true
};
const Not = {
    Result: false
};
const sql = require('./sql');

exports.startLogistics = (app) => {

    app.get('/Logistics/ItemList', (req, res) => {
        const user = auth.getUser(req);
        var date = req.query.Date;
        if (!date) {
            date = getDate();
        }

        if (user.userID) {
            sql.getRouteItem(date, user.userID, (route) => {
                console.log(route);
                sql.getLogiItemList(user.userID, date, (itemRs)=>{
                    //console.log(itemRs);
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
            console.log(cluster[0]);
            var fs=require('fs');
            //fs.writeFileSync('test.json', JSON.stringify(cluster));

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

    app.get('/Logistics/', (req, res)=>{
        const user=auth.getUser(req);
        var start=req.query.start;
        var end=req.query.end;
        if(!start) {
            var d=new Date();
            start=d.getFullYear()+'-'+(d.getMonth()+1)+'-1';
            end=d.getFullYear()+'-'+(d.getMonth()+2)+'-1';
        }
        
        if(user.userID) {
            sql.getLogiFee(start, end, user.userID, (logi)=>{
                sql.getOwnerFee(start, end, user.userID, null, (owner)=>{
                    res.render('./Logi/index', {user: user, logi:logi, owner:owner});
                    console.log(logi);
                });
            })
        } else {
            res.redirect('/');
        }
    });

    app.get('/Logistics/ajax/ItemCnt', (req, res)=>{
        var month=req.query.month;
        var date=req.query.date;
        const user=auth.getUser(req);
        sql.getLogiCnt(user.userID, month, date, (rs)=>{
            res.json(rs);
        });
    });

    app.get('/Logistics/Calculate', (req, res)=>{
        const user=auth.getUser(req);
        var start=req.query.start;
        var end;
        if(!start) {
            start=getDate();
            start=start.substring(0,8)+'01';
            console.log(start);
        }
        end=start.split('-')[0]+'-'+(parseInt(start.split('-')[1])+1)+'-01';
        if(user.userID) {
            var total=[];
            var date=new Date();
            for(var i=1; i<=12; i++) {
                var str=date.getFullYear()+'-';
                if(i<10) {
                    str+='0';
                }
                str+=i+'-01';
                total.push({
                    Ym:str,
                    price:0
                });
            }
            sql.getLogiFee(start, end, user.userID, (logi)=>{
                console.log(logi);
                sql.getLogiGraph(user.userID, null, null, (graph)=>{
                    console.log(graph);
                    sql.getOwnerFee(start, end, user.userID, null, (owner)=>{
                        for(var i=0; i<total.length; i++) {
                            for(var j=0; j<graph.take.length; j++) {
                                if(total[i].Ym==graph.take[j].Ym) {
                                    total[i].price+=graph.take[j].Total*((100-logi[0].Commission)/10);
                                }
                            }
                            for(var j=0; j<graph.delivery.length; j++) {
                                if(total[i].Ym==graph.delivery[j].Ym) {
                                    total[i].price-=graph.delivery[j].LogiPrice;
                                }
                            }
                            for(var j=0; j<graph.run.length; j++) {
                                if(total[i].Ym==graph.run[j].Ym) {
                                    total[i].price-=graph.run[j].RunFee*10;
                                }
                            }
                        }    
                        console.log(total);
                        res.render('./Logi/calculate', {user:user, owner:owner, logi: logi, total: total, month:start});
                    });
                });
            });
        } else {    
            res.redirect('/');
        }
    });

    app.get('/Logistics/Status', (req, res)=>{
        const user=auth.getUser(req);
        if(user.userID) {
            sql.getStatus(getDate(), null, user.userID, (timeline)=>{
                console.log(timeline);
                res.render('./Logi/status', {user:user, timeline:timeline});
            });
        } else {
            res.redirect('/');
        }
    })
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