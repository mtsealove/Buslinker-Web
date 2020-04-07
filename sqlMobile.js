const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'buslinker2.cirok2goa354.us-east-2.rds.amazonaws.com',
    user: 'buslinker',
    password: 'Fucker0916!',
    database: 'Buslinker2',
    timezone: '+09:00'
});
const crypto = require('./cryto');
const fcm = require('./FCM');

connection.connect();

//part time
exports.Login = (id, pw, cat, token, callback) => {
    const query = `select ID, Name, ProfilePath from Members where ID='${id}' and Password='${crypto.Chipe(pw)}' and MemberCat=${cat}`;
    connection.query(query, (error, results) => {
        if (error) {
            console.error(error);
        } else {
            if (results[0]) {
                const tokenQuery = `update Members set Token='${token}' where ID='${id}'`;
                connection.query(tokenQuery, (e1) => {
                    if (e1) {
                        console.error(e1);
                    }
                });
                callback(results[0]);
            } else {
                callback(null);
            }
        }
    });
}

exports.CreateAsk = (id, message, callback) => {
    const query = `insert into MemberAsk set MemberID='${id}', Message='${message}'`;
    connection.query(query, (error, results, fields) => {
        if (error) {
            console.error(error);
            callback(false);
        } else {
            callback(true);
        }
    });
}

exports.getDriverMy = (id, date, callback) => {
    const query = `select R.* from Route R
    join Timeline T 
    on R.RouteID=T.RouteID
    where T.RunDate='${date}' and T.DriverID='${id}'`;

    const profileQuery = `select ProfilePath from Members where ID='${id}'`;

    connection.query(query, (e, my) => {
        if (e) {
            console.error(e);
            callback(null);
        } else {
            connection.query(profileQuery, (e1, profileRs) => {
                if (e1) {
                    callback(null);
                } else {
                    if(my[0]) {
                        my[0].Profile = profileRs[0].ProfilePath;
                    } else{
                        my[0]={
                            Profile: profileRs[0].ProfilePath
                        }
                    }
                    callback(my[0]);
                }
            });

        }
    })
}

exports.UpdateQr = (DriverID, QR, callback) => {
    const updateQuery = `update Members set QR='${QR}' where ID='${DriverID}'`;
    connection.query(updateQuery, (e0) => {
        if (e0) {
            console.error(e0);
            callback(false);
        } else {
            callback(true);
        }
    });

    // remove code after 1 minute
    setTimeout(() => {
        const removeQuery = `update Members set QR=null where ID='${DriverID}'`;
        connection.query(removeQuery, (e1) => {
            if (e1) {
                console.error(e1);
            }
        });
    }, 60000);
}

exports.getDriverTimeline = (date, driverID, callback) => {
    const routeQuery = `select TTTTT.*, LLLLL.Name LogiName from 
    (select TTTT.*, PPPP.Name PTName, PPPP.Phone PTPhone from 
    (select TTT.Num, TTT.Locations, TTT.Name, TTT.PTID, TTT.Logi, CCC.Name Corp from 
    (select BB.Num, TT.* from 
    (select R.*, T.BusID, T.PTID from Route R
    join Timeline T 
    on R.RouteID=T.RouteID
    where T.RunDate='${date}' and T.DriverID='${driverID}') TT
    left outer join Bus BB
    on TT.BusID=BB.ID) TTT
    left outer join Members CCC
    on TTT.CorpID=CCC.ID) TTTT
    left outer join Members PPPP
    on TTTT.PTID=PPPP.ID) TTTTT 
    left outer join Members LLLLL
    on TTTTT.Logi=LLLLL.ID`;

    connection.query(routeQuery, (e0, route) => {
        if (e0) {
            callback(null);
        } else {
            if (route[0]) {
                const locations = route[0].Locations;
                const timeLineQuery = `select * from Location where LocID in(${locations}) order by RcTime asc`;
                // console.log(timeLineQuery);
                connection.query(timeLineQuery, (e1, timeline) => {
                    if (e1) {
                        callback(null);
                    } else {
                        // console.log(timeline);
                        callback({
                            route: route[0],
                            timeline: timeline
                        });
                    }
                });
            } else {
                callback({
                    route: null,
                    timeline: null
                });
            }
        }
    });
}

exports.getPtTimeline = (date, ptid, callback) => {
    const routeQuery = `select TTTTT.*, LLLLL.Name LogiName from 
    (select TTTT.*, PPPP.Name DriverName, PPPP.Phone DriverPhone from 
    (select TTT.RouteID, TTT.Num, TTT.Locations, TTT.Name, TTT.DriverID, TTT.Logi, CCC.Name Corp from 
    (select BB.Num, TT.* from 
    (select R.*, T.BusID, T.DriverID from Route R
    join Timeline T 
    on R.RouteID=T.RouteID
    where T.RunDate='${date}' and T.PTID='${ptid}') TT
    left outer join Bus BB
    on TT.BusID=BB.ID) TTT
    left outer join Members CCC
    on TTT.CorpID=CCC.ID) TTTT
    left outer join Members PPPP
    on TTTT.DriverID=PPPP.ID) TTTTT 
    left outer join Members LLLLL
    on TTTTT.Logi=LLLLL.ID`;

    connection.query(routeQuery, (e0, route) => {
        if (e0) {
            callback(null);
        } else {
            if (route[0]) {
                const locations = route[0].Locations;
                const timeLineQuery = `select * from Location where LocID in(${locations}) order by RcTime asc`;
                
                connection.query(timeLineQuery, (e1, timeline) => {
                    if (e1) {
                        callback(null);
                    } else {
                        //console.log(timeline);
                        callback({
                            route: route[0],
                            timeline: timeline
                        });
                    }
                });
            } else {
                callback({
                    route: null,
                    timeline: null
                });
            }
        }
    });
}

exports.UpdateLocation = (id, date, lat, lng, callback) => {
    const query = `update Timeline set Lat=${lat}, Lng=${lng} 
    where RunDate='${date}' and DriverID='${id}'`;

    connection.query(query, (e0) => {
        if (e0) {
            console.error(e0);
            callback(false);
        } else {
            callback(true);
        }
    });
}

exports.getDriverCalendar = (id, callback) => {
    const query = `select date_format(RunDate, '%Y-%m-%d') RunDate from Timeline where DriverID='${id}'`;
    connection.query(query, (e0, results) => {
        if (e0) {
            console.error(e0);
            callback(null);
        } else {
            callback(results);
        }
    });
}

exports.getPtCalendar = (id, callback) => {
    const query = `select date_format(RunDate, '%Y-%m-%d') RunDate from Timeline where PTID='${id}'`;
    connection.query(query, (e0, results) => {
        if (e0) {
            console.error(e0);
            callback(null);
        } else {
            callback(results);
        }
    });
}
const nodemailer = require('nodemailer');
let transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mtsealove0927@gmail.com',
        pass: 'lamoarhslpvuyohr'
    }
})

exports.sendMail = (id, callback) => {
    const query = `select count(*) cnt from Members where ID='${id}'`;

    connection.query(query, (e0, rs) => {
        if (e0) {
            callback(null);
        } else {
            const cnt = rs[0].cnt;
            if (cnt == 0) {
                callback(null);
            } else {
                const num = '0123456789';
                var verify = '';
                for (var i = 0; i < 4; i++) {
                    verify += num[(Math.floor(Math.random() * 10))];
                }
                let mailOptions = {
                    from: 'BusLinker',    // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
                    to: id,                     // 수신 메일 주소
                    subject: '버스링커 비밀번호 찾기 인증번호입니다.',   // 제목
                    text: `인증번호는 ${verify} 입니다.`  // 내용
                };
                transport.sendMail(mailOptions, (e1, info) => {
                    if (e1) {
                        console.error(e1);
                        callback(null);
                    } else {
                        callback({ code: verify });
                    }
                })
            }
        }
    })
}

exports.updatePassword = (id, pw, callback) => {
    const query = `update Members set Password='${crypto.Chipe(pw)}' where ID='${id}'`;
    connection.query(query, (e0) => {
        if (e0) {
            console.error(e0);
            callback(false);
        } else {
            callback(true);
        }
    });
}

exports.checkQrCode = (id, date, qr, callback) => {
    const query = `select QR from Members where ID in (
        select DriverID from Timeline where RunDate='${date}' and PTID='${id}')`;

    connection.query(query, (e0, qrRs) => {
        // console.log(qrRs);
        if (e0) {
            console.error(e0);
            callback(false);
        } else {
            if (qrRs[0].QR) {
                if (qrRs[0].QR == qr) {
                    const getQuery = `select Commute from Members where ID='${id}'`;
                    connection.query(getQuery, (e1, commuteRs) => {
                        if (e1) {
                            callback(false);
                        } else {
                            var commute = false;
                            if (commuteRs[0].Commute) {
                                commute = false;
                            } else {
                                commute = true;
                            }
                            const updateQuery = `update Members set Commute=${commute} where ID in(
                                select DriverID from Timeline where Rundate='${date}')
                                or ID='${id}'`;
                            connection.query(updateQuery, (e2) => {
                                if (e2) {
                                    console.error(e2);
                                    callback(false);
                                } else {
                                    const tokenQuery = `select Token from Members where ID in(
                                        select DriverID from Timeline where RunDate='${date}' and PTID='${id}')`;
                                    connection.query(tokenQuery, (e3, tokenRs) => {
                                        if (e3) {
                                            callback(false);
                                        } else {
                                            const token = tokenRs[0].Token;
                                            fcm.sendDriverCommute(token, commute);
                                            var action='운행 종료';
                                            if(commute) {
                                                action='출근 운행중';
                                            } 
                                            updateAction(id, action, getDate(), (updateRs)=>{
                                                if(updateRs) {
                                                    callback(true);
                                                } else {
                                                    callback(false);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    })
                } else {
                    callback(false);
                }
            } else {
                callback(false);
            }
        }
    });
}

exports.getCommute = (id, callback) => {
    const query = `select Commute from Members where ID='${id}'`;

    connection.query(query, (e0, rs) => {
        if (e0) {
            callback(false);
        } else {
            if (rs[0].Commute) {
                callback(true);
            } else {
                callback(false);
            }
        }
    });
}

exports.getPtMy = (id, date, callback) => {
    const routeQuery = `select R.Name, T.ListID, T.LogiList from Route R
    join Timeline T 
    on R.RouteID=T.RouteID
    where T.RunDate='${date}' and T.PTID='${id}'`;
    // console.log(routeQuery);

    connection.query(routeQuery, (e0, route) => {
        if (e0) {
            console.error(e0);
            callback(null);
        } else {
            const profileQuery = `select ProfilePath from Members where ID='${id}'`;
            connection.query(profileQuery, (e2, profileRs) => {
                if (e2) {
                    callback({
                        RouteName: route[0].Name
                    });
                    console.error(e2);
                } else {
                    if (route[0] != null && route[0].ListID) {
                        var ids=``;
                        if(route[0].LogiList) {
                            ids=`${route[0].LogiList}`;
                        }
                        const idSplit=route[0].ListID.split('|');
                        // console.log(idSplit);
                        var listIDs=[];
                        for(var i=0; i<idSplit.length; i++) {
                            try {
                                var id=parseInt(idSplit[i]);
                                if(!isNaN(id)) {
                                    listIDs.push(id);    
                                }
                            } catch {
                            }
                        }
                        if(ids=='') {
                            for(var i=0; i<listIDs.length; i++) {
                                ids+=listIDs[i];
                                if(i!=listIDs.length-1) {
                                    ids+=',';
                                }
                            }
                        } else {
                            for(var i=0; i<listIDs.length; i++) {
                                ids+=','+listIDs[i];
                            }
                        }
                        
                        const cntQuery = `select count(*) cnt from Item where ListID in (${ids})`;
                        // console.log(cntQuery);
                        connection.query(cntQuery, (e1, cntRs) => {
                            if (e1) {
                                console.error(e1);
                                callback({
                                    RouteName: route[0].Name
                                });
                            } else {
                                callback({
                                    RouteName: route[0].Name,
                                    ItemCnt: cntRs[0].cnt,
                                    ProfilePath: profileRs[0].ProfilePath
                                });
                            }
                        });
                    } else if (route[0]) {
                        callback({
                            RouteName: route[0].Name,
                            ProfilePath: profileRs[0].ProfilePath
                        });
                    } else {
                        callback({
                            ProfilePath: profileRs[0].Profile
                        });
                    }
                }
            });
        }
    });
}

exports.getPtCnt=(id, date, callback)=>{
    var result={
        Owner:0,
        Logi:0
    };
    const logiQuery=`select IL.Cnt from 
    (select LogiList from Timeline where PTID='${id}' and RunDate='${date}') T
    join (select I.ListID, count(ItemID) Cnt from Item I join ItemList L on I.ListID=L.ListID group by I.ListID) IL
    on T.LogiList=IL.ListID`;

    const ownerQuery=`select ListID from Timeline where PTID='${id}' and RunDate='${date}'`;
    connection.query(logiQuery, (e1, logiRs)=>{
        if(e1) {
            console.error(e1);
            callback(result);
        } else {
            if(logiRs[0]&&logiRs[0].Cnt) {
                result.Logi=logiRs[0].Cnt;
            }
            connection.query(ownerQuery, (e0, rs)=>{
                if(e0) {
                    callback(null);
                    console.error(e0);
                } else {
                    if(rs[0]&&rs[0].ListID) {
                        const split=rs[0].ListID.split('|');
                        var ids=[];
                        for(var i=0; i<split.length; i++) {
                            var id=parseInt(split[i]);
                            if(!isNaN(id)) {
                                ids.push(id);
                            }
                        }
                        var idStr='';
                        for(var i=0; i<ids.length; i++) {
                            idStr+=ids[i];
                            if(i!=ids.length-1) {
                                idStr+=',';
                            }
                        }
                        const listQuery=`select sum(Cnt) Cnt from 
                        (select I.ListID, count(ItemID) Cnt from Item I 
                        join ItemList L on I.ListID=L.ListID group by I.ListID) IL where ListID in(${idStr})`;
                        connection.query(listQuery, (e2, ownerRs)=>{
                            if(e2) {
                                console.error(e2);
                                callback(result);
                            } else {
                                if(ownerRs[0].Cnt) {
                                    result.Owner=ownerRs[0].Cnt;
                                }
                                callback(result);
                            }
                        });
                    } else {
                        callback(result);
                    }
                }
            });
        }
    });
}

exports.getRouteCnt=(routeId, callback)=>{
    const query=`select Gu, RouteID from Route where Gu=
    (select Gu from Route where RouteID=${routeId})`;
    connection.query(query, (e0, rs)=>{
        if(e0) {
            console.error(e0);
            callback(null);
        } else {
            callback(rs);
        }
    });
}

exports.updateAction=(ptId, action, date, callback)=>{
    const query=`update Timeline set Action='${action}'
    where RunDate='${date}' and PTID='${ptId}'`;
    connection.query(query, (e0)=>{
        if(e0){
            console.error(e0);
            callback(false);
        } else {
            callback(true);
        }
    });
}

function updateAction(ptId, action, date, callback){
    const query=`update Timeline set Action='${action}'
    where RunDate='${date}' and PTID='${ptId}'`;
    connection.query(query, (e0)=>{
        if(e0){
            console.error(e0);
            callback(false);
        } else {
            callback(true);
        }
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