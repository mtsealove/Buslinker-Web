const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'buslinker',
    password: 'Fucker0916!',
    database: 'Buslinker2',
    timezone: 'gmt+9'
});
const crypto = require('./cryto');
const NodeGeocoder = require('node-geocoder');
const options = {
    provider: 'google',
    httpAdapter: 'https', // Default
    apiKey: 'AIzaSyB5lgCJ9HTVukxeQCEHVB1kWXPz_4bxCMs',
    formatter: null
};
const geocoder = NodeGeocoder(options);
const fcm = require('./FCM');

//connection.connect();

// get subjects
exports.getSubjects = function (callback) {
    connection.query('select * from AskSubject', function (error, results, fields) {
        if (error) {
            console.error(error);
        }
        callback(results);
    });
}

// create ask
exports.createAsk = (email, subject, message, callback) => {
    const query = `insert into Ask set Email='${email}', Subject=${subject}, Message='${message}', View=false`;
    connection.query(query, (error, results, fields) => {
        if (error) {
            console.error(error);
            callback(false);
        } else {
            callback(true);
        }
    })
}

// login
exports.login = (id, pw, callback) => {
    const query = `select ID, Name, MemberCat, ProfilePath from Members where ID='${id}' and Password='${crypto.Chipe(pw)}'`;

    connection.query(query, (error, results, fields) => {
        if (error) {
            console.error(error);
        } else {
            if (results[0]) {
                callback(results[0]);
            } else {
                callback(null);
            }
        }
    });
}

// id reuse check
exports.checkId = (id, callback) => {
    const query = `select count(*) as cnt from Members where ID='${id}'`;
    connection.query(query, (error, results, fields) => {
        if (error) {
            console.error(error);
        } else {
            if (results[0].cnt == 0) {
                callback(true);
            } else {
                callback(false);
            }
        }
    });
}

exports.createMember = (Name, ID, Password, MemberCat, Phone, ProfilePath, BizNum, BizAddr, BizClass, CenterAddr, Garage, callback) => {
    var query = `insert into Members set Name='${Name}', ID='${ID}', Password='${crypto.Chipe(Password)}', MemberCat=${MemberCat},
    Phone='${Phone}', ProfilePath='${ProfilePath}', BizNum='${BizNum}', BizAddr='${BizAddr}', BizClass='${BizClass}', CenterAddr='${CenterAddr}'`;

    // if bus corp member
    if (MemberCat == 2) {
        geocoder.geocode(Garage, (e0, res) => {
            if (e0) {
                console.error(e0);
            }
            const garageQuery = `insert into Location set LocName='차고지', LocAddr='${Garage}', Lat=${res[0].latitude}, Lng=${res[0].longitude}, RcTime='00:00:00'`;
            connection.query(garageQuery, (e1, result) => {
                if (e1) {
                    console.error(e1);
                } else {
                    const locIdQuery = `select distinct LocID from Location where LocAddr='${Garage}'`;
                    connection.query(locIdQuery, (e2, results) => {
                        if (e2) {
                            console.error(e2);
                        } else {
                            const locId = results[0].LocID;
                            query += `, Garage=${locId}`;
                            connection.query(query, (e3, results) => {
                                if (e3) {
                                    console.error(e3);
                                    callback(false);
                                } else {
                                    callback(true);
                                }
                            })
                        }
                    })
                }
            })
        });
    } else {
        connection.query(query, (error, results, fields) => {
            if (error) {
                console.error(error);
                callback(false);
            } else {
                callback(true);
            }
        })
    }
}

// create bus
exports.createBus = (corp, num, callback) => {
    const query = `insert into Bus set Corp='${corp}', Num='${num}'`;
    connection.query(query, (error, results) => {
        if (error) {
            console.error(error);
            callback(false);
        } else {
            callback(true);
        }
    })
}

// delete bus
exports.removeBus = (id, callback) => {
    const query = `delete from Bus where id=${id}`;
    connection.query(query, (error, results) => {
        if (error) {
            callback(false);
        } else {
            callback(true);
        }
    });
}

// get bus by corperation
exports.getBus = (corp, order, asc, callback) => {
    var query = `select B.*, M.Name, Phone  from Bus B left outer join Members M on B.DriverID=M.ID where B.Corp='${corp}' `;
    switch (order) {
        case 0:
            query += `order by B.Num ${asc}`;
            break;
        case 1:
            query += `order by D.Name ${asc}`;
            break;
    }

    connection.query(query, (error, results) => {
        if (error) {
            console.error(error);
        } else {
            callback(results);
        }
    });
}

// create bus driver
exports.createDriver = (corp, name, id, pw, phone, busId, profilePath, licensePath, callback) => {
    const query = `insert into Members set Corp='${corp}', MemberCat=6, Name='${name}', ID='${id}',
    Password='${crypto.Chipe(pw)}', Phone='${phone}', busID=${busId}, ProfilePath='${profilePath}', LicensePath='${licensePath}'`;
    connection.query(query, (error, results) => {
        if (error) {
            console.error(error);
            callback(false);
        } else {
            callback(true);
        }
    });
}

exports.getDrivers = (corp, callback) => {
    const query = `select M.Name, M.ID, M.Phone, M.ProfilePath, B.Num 
    from Members M left outer join Bus B
    on M.BusID=B.ID
    where MemberCat=6 and M.Corp='${corp}'`;
    connection.query(query, (error, results) => {
        if (error) {
            console.error(error);
        } else {
            callback(results);
        }
    })
}

exports.removeDriver = (corp, id, callback) => {
    const query = `delete from Members where Corp='${corp}' and ID='${id}'`;
    connection.query(query, (error, result) => {
        if (error) {
            callback(false);
        } else {
            callback(true);
        }
    })
}

exports.getLogis = (callback) => {
    const query = `select ID, Name from Members where MemberCat=4`;
    connection.query(query, (error, results) => {
        if (error) {
            console.error(error);
        } else {
            callback(results);
        }
    })
}

exports.getOwners = (logi, callback) => {
    const query = `select ID, Name from Members where MemberCat=3 and Corp='${logi}'`;
    connection.query(query, (error, results) => {
        if (error) {
            console.error(error);
        } else {
            callback(results);
        }
    });
}

exports.getBusList = (callback) => {
    const query = 'select ID, Name from Members where MemberCat=2';
    connection.query(query, (error, results) => {
        if (error) {
            console.error(error);
        } else {
            callback(results);
        }
    })
}

exports.createRoute = (corp, name, station, logi, empty, owner, contract, gu, callback) => {
    geocoder.geocode(station.addr, (e0, res) => {
        // geocode station
        if (e0) {
            console.error('e0');
            console.error(e0);
        } else {
            console.log('e0 pass');
            // station 1 insert
            const station1Insert = `insert into Location set LocName='${station.name}', LocAddr='${station.addr}',
            Lng=${res[0].longitude}, Lat=${res[0].latitude}, RcTime='${station.start}', LocCat=1`;
            connection.query(station1Insert, (e1) => {
                if (e1) {
                    console.error('e1');
                    console.error(e1);
                } else {
                    console.log('e1 pass');
                    // station 2 insert
                    const station2Insert = `insert into Location set LocName='${station.name}', LocAddr='${station.addr}',
                    Lng=${res[0].longitude}, Lat=${res[0].latitude}, RcTime='${station.end}', Loccat=1`;
                    connection.query(station2Insert, (e2) => {
                        if (e2) {
                            console.error('e2');
                            console.error(e2);
                        } else {
                            console.log('e2 pass');
                            // get stationID
                            const getId = `select LocID from Location order by LocID desc`;
                            connection.query(getId, (e3, stationResult) => {
                                if (e3) {
                                    console.error('e3');
                                    console.error(e3);
                                } else {
                                    console.log('e3 pass');
                                    const station1ID = stationResult[0].LocID;
                                    const station2ID = stationResult[1].LocID;
                                    // geocode logistic
                                    const logiCenterQuery = `select CenterAddr from Members where ID='${logi.id}'`;
                                    connection.query(logiCenterQuery, (e3_1, logiCenter) => {
                                        if (e3_1) {
                                            console.error('e3_1');
                                            console.error(e3_1);
                                        } else {
                                            console.log('e3_1 pass');
                                            geocoder.geocode(logiCenter[0].CenterAddr, (e4, logiAddr) => {
                                                if (e4) {
                                                    console.error(e4);
                                                } else {
                                                    console.log('e4 pass');
                                                    // logi 1 insert
                                                    const logiName = logi.name;
                                                    const logi1Insert = `insert into Location set LocName='${logiName}', 
                                                LocAddr='${logiCenter[0].CenterAddr}', Lng=${logiAddr[0].longitude}, Lat=${logiAddr[0].latitude}, RcTime='${logi.start}', LocCat=2`;
                                                    connection.query(logi1Insert, (e5) => {
                                                        if (e5) {
                                                            console.error('e5');
                                                            console.error(e5);
                                                        } else {
                                                            console.log('e5 pass');
                                                            // logi 2 insert
                                                            const logi2Insert = `insert into Location set LocName='${logiName}', 
                                                        LocAddr='${logiCenter[0].CenterAddr}', Lng=${logiAddr[0].longitude}, Lat=${logiAddr[0].latitude}, RcTime='${logi.end}', LocCat=2`;
                                                            connection.query(logi2Insert, (e6) => {
                                                                if (e6) {
                                                                    console.error('e6');
                                                                    console.error(e6);
                                                                } else {
                                                                    console.log('e6 pass');
                                                                    // get logi id
                                                                    connection.query(getId, (e7, logiResult) => {
                                                                        if (e7) {
                                                                            console.error('e7');
                                                                            console.error(e7);
                                                                        } else {
                                                                            console.log('e7 pass');
                                                                            const logi1ID = logiResult[0].LocID;
                                                                            const logi2ID = logiResult[1].LocID;
                                                                            // geocode empty place
                                                                            geocoder.geocode(empty.addr, (e8, emptyAddr) => {
                                                                                if (e8) {
                                                                                    console.error('e8');
                                                                                    console.error(e8);
                                                                                } else {
                                                                                    console.log('e8 pass');
                                                                                    // insert empty place
                                                                                    const emptyInsert = `insert into Location set LocName='${empty.name}', 
                                                                                LocAddr='${empty.addr}', Lng=${emptyAddr[0].longitude}, Lat=${emptyAddr[0].latitude}, RcTime='${empty.time}', LocCat=3`;
                                                                                    connection.query(emptyInsert, (e9) => {
                                                                                        if (e9) {
                                                                                            console.error('e9');
                                                                                            console.error(e9);
                                                                                        } else {
                                                                                            console.log('e9 pass');
                                                                                            // get empty id
                                                                                            connection.query(getId, (e10, emptyResult) => {
                                                                                                if (e10) {
                                                                                                    console.error('e10');
                                                                                                    console.error(e10);
                                                                                                } else {
                                                                                                    console.log('e10 pass');
                                                                                                    const emptyID = emptyResult[0].LocID;
                                                                                                    const ownerCnt = owner.length;
                                                                                                    // get owner's center addr
                                                                                                    var getCenter = `select Name, CenterAddr from Members where ID in (`;
                                                                                                    for (var i = 0; i < ownerCnt; i++) {
                                                                                                        getCenter += `'${owner[i].id}'`;
                                                                                                        if (i != ownerCnt - 1) {
                                                                                                            getCenter += `, `;
                                                                                                        }
                                                                                                    }
                                                                                                    getCenter += `)`;
                                                                                                    connection.query(getCenter, (e11, centers) => {
                                                                                                        if (e11) {
                                                                                                            console.error('e11');
                                                                                                            console.error(e11);
                                                                                                        } else {
                                                                                                            console.log('e11 pass');
                                                                                                            var cnt = 0;
                                                                                                            var ownerInsert = [];
                                                                                                            var batchAddr = [];
                                                                                                            for (var i = 0; i < centers.length; i++) {
                                                                                                                batchAddr.push(centers[i].CenterAddr);
                                                                                                            }

                                                                                                            // geocode multi
                                                                                                            geocoder.batchGeocode(batchAddr, (error, data) => {
                                                                                                                if (error) {
                                                                                                                    console.error(error);
                                                                                                                } else {
                                                                                                                    for (var i = 0; i < data.length; i++) {
                                                                                                                        ownerInsert.push(`insert into Location set LocName='${centers[i].Name}', 
                                                                                                                        LocAddr='${batchAddr[i]}', Lng=${data[i].value[0].longitude}, Lat=${data[i].value[0].latitude}, RcTime='${owner[i].time}', LocCat=4`)
                                                                                                                    }

                                                                                                                    for (var i = 0; i < ownerInsert.length; i++) {
                                                                                                                        connection.query(ownerInsert[i], (e12) => {
                                                                                                                            if (e12) {
                                                                                                                                console.error('e12');
                                                                                                                                console.error(e12);
                                                                                                                            } else {
                                                                                                                                console.log('e12 pass');
                                                                                                                                cnt++;
                                                                                                                            }
                                                                                                                        });
                                                                                                                    }
                                                                                                                }

                                                                                                            });

                                                                                                            setInterval(function () {
                                                                                                                if (cnt == owner.length) {
                                                                                                                    clearInterval(this);
                                                                                                                    var ownerIDs = [];
                                                                                                                    //  get ownerIDs
                                                                                                                    connection.query(getId, (e13, onwerResult) => {
                                                                                                                        if (e13) {
                                                                                                                            console.error(e13);
                                                                                                                        } else {
                                                                                                                            console.log('e13 pass');
                                                                                                                            for (var i = 0; i < ownerCnt; i++) {
                                                                                                                                ownerIDs.push(onwerResult[i].LocID);
                                                                                                                            }

                                                                                                                            // insert route
                                                                                                                            var routeQuery = `insert into Route set Name='${name}', CorpID='${corp}',
                                                                                                                            ContractStart='${contract.start}', ContractEnd='${contract.end}',  Logi='${logi.id}', Gu='${gu}',Locations='`;
                                                                                                                            // set location ids
                                                                                                                            routeQuery += station1ID + ',';
                                                                                                                            routeQuery += logi1ID + ',';
                                                                                                                            routeQuery += emptyID + ',';

                                                                                                                            for (var i = 0; i < ownerIDs.length; i++) {
                                                                                                                                routeQuery += ownerIDs[i] + ',';
                                                                                                                            }
                                                                                                                            routeQuery += logi2ID + ',';
                                                                                                                            routeQuery += station2ID + `', Owners='`;
                                                                                                                            // set owner's id
                                                                                                                            for (var i = 0; i < owner.length; i++) {
                                                                                                                                routeQuery += owner[i].id;
                                                                                                                                if (i != owner.length - 1) {
                                                                                                                                    routeQuery += ',';
                                                                                                                                }
                                                                                                                            }
                                                                                                                            routeQuery += `'`;

                                                                                                                            connection.query(routeQuery, (e14) => {
                                                                                                                                if (e14) {
                                                                                                                                    console.error('e14');
                                                                                                                                    console.error(e14);
                                                                                                                                    callback(false);
                                                                                                                                } else {
                                                                                                                                    console.log('e14 pass');
                                                                                                                                    console.log('success');
                                                                                                                                    var year=new Date().getFullYear();
                                                                                                                                    setFullTimeline(year);
                                                                                                                                    callback(true);
                                                                                                                                }
                                                                                                                            });
                                                                                                                        }
                                                                                                                    });
                                                                                                                } else {
                                                                                                                    console.log('wait');
                                                                                                                }
                                                                                                            }, 100);
                                                                                                        }
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}


exports.getRoute = (order, current, bus, callback) => {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var dateStr = year + '-' + month + '-' + day;

    var query = `select R.*, M.Name as Bus from Route R join Members M
    on R.CorpID=M.ID where ContractEnd`;
    if (current == 'true') {
        query += `>='${dateStr}'`;
    } else {
        query += `<'${dateStr}'`;
    }
    if (bus) {
        query += ` and R.CorpID='${bus}' `;
    }

    query += ` order by Name ${order}`;
    connection.query(query, (err, result) => {
        if (err) {
            console.log('e1');
            console.error(err);
        } else {
            // get location info
            var locations = [];
            for (var i = 0; i < result.length; i++) {
                const line = (result[i].Locations).split(',');
                result[i].Loc = [];
                for (var j = 0; j < line.length; j++) {
                    locations.push(line[j]);
                }
            }
            var inQeury = `select * from Location where LocID in (`;
            for (var i = 0; i < locations.length; i++) {
                inQeury += locations[i];
                if (i != locations.length - 1) {
                    inQeury += ', ';
                } else {

                }
            }
            inQeury += ') order by RcTime';

            connection.query(inQeury, (e2, result2) => {
                if (e2) {
                    console.log('e2');
                    console.error(e2);
                    callback(result);
                } else {
                    for (var i = 0; i < result.length; i++) {
                        const line = (result[i].Locations).split(',');
                        for (var j = 0; j < line.length; j++) {
                            result[i].Loc.push(result2.find(c => c.LocID == line[j]));
                        }
                        result[i].Loc.sort(function (a, b) {
                            return a.RcTime < b.RcTime ? -1 : a.RcTime > b.RcTime ? 1 : 0;
                        });
                    }
                    callback(result);
                }
            })
        }
    });
}

exports.getLogiRoute= (order, current, logi, callback) => {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var dateStr = year + '-' + month + '-' + day;

    var query = `select R.*, M.Name as Bus from Route R join Members M
    on R.CorpID=M.ID where ContractEnd`;
    if (current == 'true') {
        query += `>='${dateStr}'`;
    } else {
        query += `<'${dateStr}'`;
    }
    if (logi) {
        query += ` and R.Logi='${logi}' `;
    }

    query += ` order by Name ${order}`;
    connection.query(query, (err, result) => {
        if (err) {
            console.log('e1');
            console.error(err);
        } else {
            console.log('e1 pass');
            // get location info
            var locations = [];
            for (var i = 0; i < result.length; i++) {
                const line = (result[i].Locations).split(',');
                result[i].Loc = [];
                for (var j = 0; j < line.length; j++) {
                    locations.push(line[j]);
                }
            }
            var inQeury = `select * from Location where LocID in (`;
            for (var i = 0; i < locations.length; i++) {
                inQeury += locations[i];
                if (i != locations.length - 1) {
                    inQeury += ', ';
                } else {

                }
            }
            inQeury += ')';

            connection.query(inQeury, (e2, result2) => {
                if (e2) {
                    console.log('e2');
                    console.error(e2);
                    callback(result);
                } else {
                    for (var i = 0; i < result.length; i++) {
                        const line = (result[i].Locations).split(',');
                        for (var j = 0; j < line.length; j++) {
                            result[i].Loc.push(result2.find(c => c.LocID == line[j]));
                        }
                    }
                    callback(result);
                }
            })
        }
    });
}

exports.removeRoute = (id, callback) => {
    const getQuery = `select Locations from Route where RouteID=${id}`;
    connection.query(getQuery, (e0, results) => {
        if (e0) {
            console.error(e0);
            callback(null);
        } else {
            const line = ((String)(results[0].Locations)).split(',');
            var locQuery = `delete from Location where LocID in(`;
            for (var i = 0; i < line.length; i++) {
                locQuery += line[i];
                if (i == line.length - 1) {
                    locQuery += ')';
                } else {
                    locQuery += ',';
                }
            }
            connection.query(locQuery, (e1) => {
                if (e1) {
                    callback(null);
                    console.error(e1);
                } else {
                    const removeQuery = `delete from Route where RouteID=${id}`;
                    connection.query(removeQuery, (e2) => {
                        if (e2) {
                            callback(null);
                            console.error(e2);
                        } else {
                            callback(true);
                        }
                    });
                }
            });
        }
    });
}

exports.getItemList = (userID, yyyymm, callback) => {
    const startDate = yyyymm + '-01';
    const endDate = yyyymm.split('-')[0] + '-' + (parseInt(yyyymm.split('-')[1]) + 1) + '-01';

    const query = `select L.ListID, L.SoldDate, count(I.ListID) as Count, L.Deadline
    from ItemList L join Item I 
    on L.ListID regexp(I.ListID)
    where L.OwnerID='${userID}'
    and L.SoldDate>='${startDate}'
    and L.SoldDate<'${endDate}'
    group by L.ListID
    order by L.SoldDate desc`;

    connection.query(query, (e0, results) => {
        if (e0) {
            callback(null);
            console.error(e0);
        } else {
            callback(results);
        }
    })
}

exports.createItemList = (userID, ids, item_names, names, phones, addrs, callback) => {
    const date = new Date();
    var dateStr = date.getFullYear() + '-';
    if (date.getMonth() < 9) {
        dateStr += '0';
    }
    dateStr += (date.getMonth() + 1) + '-';
    if (date.getDate() < 10) {
        dateStr += '0';
    }
    dateStr += date.getDate();
    var dateTime = dateStr + ' ';
    if (date.getHours() < 10) {
        dateTime += '0';
    }
    dateTime += date.getHours() + ':';
    if (date.getMinutes() < 10) {
        dateTime += '0'
    }
    dateTime += date.getMinutes();

    // create item list first
    const listQuery = `insert into ItemList set OwnerID='${userID}', SoldDate='${dateStr}', Deadline='${dateTime}'`;
    connection.query(listQuery, (e0) => {
        if (e0) {
            console.error('e0');
            console.error(e0);
            callback(false);
        } else {
            // get list's id
            const getList = `select ListID from ItemList where OwnerID='${userID}' order by ListID desc`;
            connection.query(getList, (e1, listResult) => {
                if (e1) {
                    console.error('e1');
                    console.error(e1);
                    callback(false);
                } else {
                    // create ecah item that having list id
                    const listID = listResult[0].ListID;
                    var itemQuery = `insert into Item(ItemID, ListID, ItemName, DesAddr, DesName, DesPhone) values `;
                    for (var i = 0; i < ids.length; i++) {
                        itemQuery += `('${ids[i]}',${listID}, '${item_names[i]}', '${addrs[i]}', '${names[i]}', '${phones[i]}')`;
                        if (i != ids.length - 1) {
                            itemQuery += ',';
                        }
                    }
                    // last query | user can't wait
                    connection.query(itemQuery, (e2) => {
                        if (e2) {
                            console.error('e2');
                            console.error(e2);
                            callback(false);
                        } else {
                            // get route id for update
                            const getRoute = `select RouteID from route where Owners like '%${userID}%'`;
                            connection.query(getRoute, (e3, route) => {
                                if (e3) {
                                    console.error('e3');
                                    console.error(e3);
                                    callback(false);
                                } else {
                                    const routeID = route[0].RouteID;
                                    //update route timeline
                                    const updateTimeline=` update Timeline a
                                    left join (select ListID, RouteID, RunDate from Timeline
                                    where RouteID=${routeID} and RunDate='${dateStr}') b 
                                    on a.RouteID=b.RouteID and a.RunDate=b.RunDate
                                    set a.ListID= concat(b.ListID, '|', ${listID})`;
                                    connection.query(updateTimeline, (e4) => {
                                        if (e4) {
                                            console.error('e4');
                                            console.error(e4);
                                            callback(false);
                                        } else {
                                            callback(true);
                                        }
                                    });
                                }
                            });
                        }
                    });
                    setItem(addrs, ids);
                }
            });
        }
    });
}
async function setItem(addrs, idTmps) {
    // set geocord item
    var location = [];
    var ids = []
    for (var i = 0; i < addrs.length; i++) {
        var gc = await geocoder.geocode(addrs[i], (e2, data) => {
            if (e2) {
                console.error(e2);
            } else {
                console.log('geocode: ' + i);
                if (data[0]) {
                    location.push([data[0].latitude, data[0].longitude]);
                    ids.push(idTmps[i]);
                }
            }
        });
    }
    var kmeans = require('node-kmeans');
    //    clustering 10 sector
    kmeans.clusterize(location, { k: 6 }, (err, cluster) => {
        if (err) {
            console.error(err);
        } else {
            // update item cluster
            //console.log(cluster);
            UpdateItemCluster(cluster, ids);
        }
    });
}
async function UpdateItemCluster(cluster, ids) {
    var cnt = 0;
    for (var i = 0; i < cluster.length; i++) {
        for (var j = 0; j < cluster[i].clusterInd.length; j++) {
            var itemIndex = cluster[i].clusterInd[j];
            var itemID = ids[itemIndex];
            var updateItem = `update Item set Cluster=${i + 1}, 
            CentLat=${cluster[i].centroid[0]}, CentLng=${cluster[i].centroid[1]}
             where itemID='${itemID}'`;

            var cn = await connection.query(updateItem, (e1) => {
                if (e1) {
                    console.error(e1);
                } else {
                    cnt++;
                    console.log('item update: ' + cnt);
                }
            });
        }
    }
}

exports.getItemListDetail = (userID, ListID, callback) => {
    const listQuery = `select I.* from item I join ItemList L
    on L.ListID=I.ListID
    where L.OwnerID='${userID}'
    and L.ListID=${ListID}`;

    connection.query(listQuery, (e0, result) => {
        if (e0) {
            console.error(e0);
            callback(null);
        } else {
            callback(result);
        }
    });
}

// get not setted driver
exports.getEmpyDriver = (corp, callback) => {
    const query = `select ID, Name from Members M where MemberCat=6 
    and Corp='${corp}'
    and not exists(
    select DriverID from Route R where R.DriverID=M.ID
    )`;

    connection.query(query, (e0, result) => {
        if (e0) {
            console.error(e0);
            callback(null);
        } else {
            callback(result);
        }
    });
}

// get ecah route by id
exports.getTimeline = (routeID, corp, callback) => {
    const query = `select RR.*, BB.Num from 
    (select T.*, M.Name DriverName
    from Timeline T 
    left outer join Members M
    on T.DriverID=M.ID) RR left outer join Bus BB
    on RR.BusID=BB.ID
    where RouteID=${routeID}`;

    connection.query(query, (e0, result) => {
        if (e0) {
            callback(null);
        } else {
            callback(result);
        }
    })
}

// insert timeline
exports.updateTimeLine = (routeID, driver, bus, removes, callback) => {
    var deleteDriver = `update Timeline set DriverID=null where RouteID=${routeID} and RunDate in ('1970-01-01'`;
    var deleteBus = `update Timeline set BusID=null where RouteID=${routeID} and RunDate in ('1970-01-01'`;

    // for full clear date, get removed date
    var driverFirst = true, busFirst = true;
    for (var i = 0; i < removes.length; i++) {
        var cat = removes[i].split(':')[0];
        var date = removes[i].split(':')[1];
        if (cat == 'driver') {
            if (driverFirst) {
                driverFirst = false;
            }
            deleteDriver += `,'${date}'`;
        } else {
            if (busFirst) {
                busFirst = false;
            }
            deleteBus += `,'${date}'`;
        }
    }

    // get date by bus
    for (var i = 0; i < bus.length; i++) {
        if (i == 0) {
            deleteBus += ',';
        }
        const date = (bus[i].split(':'))[0];
        deleteBus += `'${date}'`;
        if (i != bus.length - 1) {
            deleteBus += ',';
        }
    }
    deleteBus += ')';
    // get date by driver
    for (var i = 0; i < driver.length; i++) {
        if (i == 0) {
            deleteDriver += ',';
        }
        const date = (driver[i].split(':'))[0];
        deleteDriver += `'${date}'`;
        if (i != driver.length - 1) {
            deleteDriver += ',';
        }
    }
    deleteDriver += ')';

    var updateDrivers = [];
    var drivers = [];
    for (var i = 0; i < driver.length; i++) {
        const date = driver[i].split(':')[0];
        const driverID = driver[i].split(':')[1];
        drivers.push(driverID);
        updateDrivers.push(`update Timeline set DriverID='${driverID}' where RunDate='${date}' and RouteID=${routeID}`);
    }
    // remove reuse
    drivers = Array.from(new Set(drivers));
    var tokenBody = [];
    for (var i = 0; i < drivers.length; i++) {
        tokenBody.push({
            driverID: drivers[i],
            dates: []
        })
    }
    for (var i = 0; i < driver.length; i++) {
        const date = driver[i].split(':')[0];
        const driverID = driver[i].split(':')[1];
        for (var j = 0; j < tokenBody.length; j++) {
            if (driverID == tokenBody[j].driverID) {
                tokenBody[j].dates.push(date);
            }
        }
    }
    var tokenCnt = 0;
    for (var i = 0; i < tokenBody.length; i++) {
        connection.query(`select Token from Members where ID='${tokenBody[i].driverID}'`, (e2, tokenRs) => {
            if (e2) {
                console.error(e2);
            } else {
                var token = tokenRs[0].Token;
                fcm.sendDriverSchedule(token, tokenBody[tokenCnt++].dates);
            }
        });
    }

    var updateBus = [];

    for (var i = 0; i < bus.length; i++) {
        const date = bus[i].split(':')[0];
        const busId = bus[i].split(':')[1];
        updateBus.push(`update Timeline set BusID=${busId} where RunDate='${date}' and RouteID=${routeID}`);
    }

    const total = updateBus.length + updateDrivers.length;
    var current = 0;

    connection.query(deleteDriver, (e0) => {
        if (e0) {
            console.error('e0');
            console.error(e0);
            callback(false);
        } else {
            connection.query(deleteBus, (e1) => {
                if (e1) {
                    console.error('e1');
                    console.error(e1);
                    callback(false);
                } else {
                    for (var i = 0; i < updateDrivers.length; i++) {
                        connection.query(updateDrivers[i], (errDriver) => {
                            if (errDriver) {
                                console.error('errDriver');
                                console.error(errDriver);
                                callback(false);
                            } else {
                                current++;
                            }
                        });
                    }
                    for (var i = 0; i < updateBus.length; i++) {
                        connection.query(updateBus[i], (errBus) => {
                            if (errBus) {
                                console.error('errBus');
                                console.error(errBus);
                                callback(false);
                            } else {
                                current++;
                            }
                        });
                    }
                }
            });
        }
    });

    var interval = setInterval(() => {
        console.log('total: ' + total);
        console.log('current: ' + current);
        if (total == current) {
            clearInterval(interval);
            callback(true);
        }
    }, 200);
}

// get bus's event
exports.getBusEvent = (id, callback) => {
    const query = `select TT.*, MM.Name DriverName from 
    (select T.*, R.Name RouteName from 
    (select RunDate, RouteID, DriverID from Timeline where BusID=${id}) T
    left outer join Route R
    on T.RouteID=R.RouteID) TT
    left outer join Members MM
    on TT.DriverID=MM.ID`;
    connection.query(query, (e0, result) => {
        if (e0) {
            console.error(e0);
            callback(null);
        } else {
            callback(result);
        }
    });
}

exports.getDriverEvent = (id, callback) => {
    const query = `select TT.*, BB.Num from 
    (select T.*, R.Name RouteName from
    (select RunDate, RouteID, BusID from Timeline
    where DriverID='${id}') T
    left outer join  Route R
    on T.RouteID=R.RouteID) TT
    left outer join Bus BB
    on TT.BusID=BB.ID`;
    connection.query(query, (e0, result) => {
        if (e0) {
            console.error(e0);
            callback(null);
        } else {
            callback(result);
        }
    });
}

exports.getPartTimeEvent = (id, callback) => {
    const query = `select T.*, R.Name RouteName from
    (select RunDate, RouteID from Timeline
    where PTID='${id}') T
    left outer join  Route R
    on T.RouteID=R.RouteID`;
    connection.query(query, (e0, part) => {
        if (e0) {
            console.error(e0);
            callback(null);
        } else {
            callback(part);
        }
    });
}

// get ownwer's delivery fee by manage
exports.getOwnerFee = (start, end, corp, owner, callback) => {
    var query = `select MM.*, II.ItemCnt from 
    (select ID,Name ,AdFee, DefaultFee, DefaultCnt from Members where MemberCat=3`;
    if(corp) {
        query+=` and Corp='${corp}'`;
    }
    query+=`) MM
    left outer join (
    select OwnerID, sum(ItemCnt) ItemCnt from
    (select IL.*, count(I.ItemID) ItemCnt from ItemList IL join Item I
    on IL.ListID=I.ListID
    where IL.SoldDate>='${start}' and SoldDate<'${end}'
    group by IL.ListID) O
    group by OwnerID) II on MM.ID=II.OwnerID`;

    if(owner) {
        query+=` where ID='${owner}'`;
    }
    
    connection.query(query, (err, result) => {
        if (err) {
            console.error(err);
            callback(null);
        } else {
            callback(result);
        }
    });
}

exports.getBusFee=(end, bus, callback)=>{
    var query=`select ID, Name ,DefaultFee, Cnt from Members M join
    (select CorpID, count(RouteID) Cnt from Route 
    where ContractEnd>='${end}'
    group by CorpID) R
    on M.ID=R.CorpID
    where M.MemberCat=2`;
    if(bus) {
        query+=` and M.ID='${bus}'`;
    }

    connection.query(query, (e0, rs)=>{
        if(e0) {
            console.error(e0);
            callback(null);
        } else {
            //console.log(rs);
            callback(rs);
        }
    });
}

exports.getLogiFee=(start, end, logi, callback)=>{
    var query=`select MMMMM.*, FFFFF.TotalFee from 
    (select MMMM.*, LLLL.RouteCnt from 
        (select MMM.ID, MMM.Name, MMM.Commission, MMM.DefaultFee, MMM.AdFee, MMM.RunFee, RRR.ItemCnt from Members MMM
        left outer join
        (select RR.Logi, sum(TT.Cnt) ItemCnt from Route RR
        left outer join
        (select RouteID, Cnt from Timeline T
        join (select ListID ,count(ItemID) Cnt from Item group by ListID) L
        on T.LogiList=L.ListID
        where RunDate>='${start}' and RunDate<='${end}') TT 
        on RR.RouteID=TT.RouteID
        group by RR.Logi) RRR
        on MMM.ID=RRR.Logi
        where MMM.MemberCat=4) MMMM
        left outer join (
        select Logi, count(Logi) RouteCnt from Route 
        where ContractStart<='${start}' and ContractEnd>'${end}'
        group by Logi) LLLL
        on MMMM.ID=LLLL.Logi) MMMMM left outer join
        (select Corp, sum(TotalFee) TotalFee from 
        (select Corp, if(TotalFee>DefaultFee, TotalFee, DefaultFee) as TotalFee from
        (select MM.Corp, (II.ItemCnt-MM.DefaultCnt)*MM.AdFee+MM.DefaultFee TotalFee, MM.DefaultFee from 
        (select Corp, ID,Name ,AdFee, DefaultFee, DefaultCnt from Members where MemberCat=3 ) MM
        left outer join (
        select OwnerID, sum(ItemCnt) ItemCnt from
        (select IL.*, count(I.ItemID) ItemCnt from ItemList IL join Item I
        on IL.ListID=I.ListID
        where IL.SoldDate>='${start}' and SoldDate<'${end}'
        group by IL.ListID) O
        group by OwnerID) II on MM.ID=II.OwnerID) MMM) MMMM group by Corp) FFFFF
        on MMMMM.ID=FFFFF.Corp`;

    if(logi) {
        query+=` where ID='${logi}'`;
    }
    connection.query(query, (e0, rs)=>{
        if(e0) {
            console.error(e0);
            callback(null);
        } else {
            callback(rs);
        }
    });
}

// manages's get all resource
exports.getAllCorpResource = (callback) => {
    const driverQuery = `select C.Name Corp, B.Name, B.ID, B.ProfilePath, B.Phone
    from Members B join Members C
    on B.Corp=C.ID
    where B.MemberCat=6
    order by B.Corp`;
    const busQuery = `select C.Name Corp, B.ID, B.Num from Bus B join Members C
    on B.Corp=C.ID order by B.Corp`;
    const busCntQuery = `select count(C.Name) CorpCnt, C.Name Corp
    from Bus B join Members C
    on B.Corp=C.ID
    group by C.Name`;
    const driverCntQuery = `select count(C.ID) Cnt, C.Name Corp
    from Members B join Members C
    on B.Corp=C.ID
    where B.MemberCat=6
    group by C.ID`;
    const partTimeQuery = `select Name, ID, ProfilePath, Phone from Members where MemberCat=5`;

    connection.query(driverQuery, (e0, driver) => {
        if (e0) {
            console.error(e0);
            callback(null);
        } else {
            connection.query(busQuery, (e1, bus) => {
                if (e1) {
                    console.error(e1);
                    callback(null);
                } else {
                    connection.query(busCntQuery, (e2, busCnt) => {
                        if (e2) {
                            console.error(e2);
                            callback(null);
                        } else {
                            for (var i = 0; i < bus.length; i++) {
                                for (var j = 0; j < busCnt.length; j++) {
                                    if (busCnt[j].Corp == bus[i].Corp) {
                                        bus[i].CorpCnt = busCnt[j].CorpCnt;
                                        break;
                                    }
                                }
                            }
                            connection.query(driverCntQuery, (e3, driverCnt) => {
                                if (e3) {
                                    console.error(e3);
                                    callback(null);
                                } else {
                                    for (var i = 0; i < driver.length; i++) {
                                        for (var j = 0; j < driverCnt.length; j++) {
                                            if (driver[i].Corp == driverCnt[j].Corp) {
                                                driver[i].CorpCnt = driverCnt[j].Cnt;
                                                break;
                                            }
                                        }
                                    }
                                    connection.query(partTimeQuery, (e4, partTime) => {
                                        if (e4) {
                                            console.error(e4);
                                            callback(null);
                                        } else {
                                            callback({
                                                driver: driver,
                                                bus: bus,
                                                part: partTime
                                            });
                                        }
                                    })
                                }
                            });
                        }
                    });
                }
            });
        }
    })
}

exports.getRouteItem = (date, logi, callback) => {
    var routeQuery = `select R.*, L.Name Logi from
   (select RouteID, Gu, Name, Logi, Owners as ownerIds from Route` ;
    if (logi) {
        routeQuery += ` where Logi='${logi}'`;
    }
    routeQuery += `) R join Members L
   on R.Logi=L.ID order by R.Gu`;
    var onwerTotal = 0;
    var ownerCnt = 0;
    var itemTotal = 0;
    var itemCnt = 0;

    connection.query(routeQuery, (e0, route) => {
        if (e0) {
            callback(null);
        } else {
            onwerTotal = route.length;
            // owner method
            for (var i = 0; i < route.length; i++) {
                // create owner query
                const ids = route[i].ownerIds.split(',');
                var ownerQuery = `select Name from Members where ID in(`;
                for (var j = 0; j < ids.length; j++) {
                    ownerQuery += `'${ids[j]}'`;
                    if (j != ids.length - 1) {
                        ownerQuery += ','
                    }
                }
                ownerQuery += ')';
                // excute onwer query
                connection.query(ownerQuery, (e1, owners) => {
                    if (e1) {
                        callback(null);
                    } else {
                        route[ownerCnt].Owners = []
                        for (var x = 0; x < owners.length; x++) {
                            route[ownerCnt].Owners.push(owners[x].Name);
                        }
                        ownerCnt++;
                    }
                });
            }
            // timeline query
            var routes = '';
            for (var i = 0; i < route.length; i++) {
                routes += route[i].RouteID;
                if (i != route.length - 1) {
                    routes += ',';
                }
            }
            const timelineQuery = `select TTT.*, III.ItemCnt from 
            ( select TT.*, BB.Num from 
                     (select T.*, D.Name DriverName from 
                     (select * from Timeline 
                     where RouteID in(${routes}) 
                     and RunDate='${date}') T
                     left outer join Members D on T.DriverID=D.ID) TT
                     left outer join Bus BB on TT.BusID=BB.ID) TTT left outer join(            
                 select ListID, count(ItemID) ItemCnt from Item group by ListID) III on III.ListID=TTT.LogiList`;

            connection.query(timelineQuery, (e2, timeline) => {
                if (e2) {
                    callback(null);
                } else {
                    // matching timeline and route
                    for (var i = 0; i < timeline.length; i++) {
                        for (var j = 0; j < route.length; j++) {
                            if (route[j].RouteID == timeline[i].RouteID) {
                                route[j].DriverName = timeline[i].DriverName;
                                route[j].BusNum = timeline[i].Num;
                                route[j].listID = timeline[i].ListID;
                                route[j].ItemCnt=timeline[i].ItemCnt;
                            }
                        }
                    }
                    // get item count
                    for (var i = 0; i < route.length; i++) {
                        if (route[i].ListID) {
                            itemTotal++;
                        }
                    }
                    for (var i = 0; i < route.length; i++) {
                        if (route[i].ListID) {
                            const itemQuery = `select ListID, count(*) cnt from Item where ListID=${route[i].ListID}`;
                            connection.query(itemQuery, (e3, item) => {
                                if (e3) {
                                    callback(null);
                                } else {
                                    for (var j = 0; j < route.length; j++) {
                                        for (var x = 0; x < item.length; x++) {
                                            if (route[j].ListID && route[j].ListID == item[x].ListID) {
                                                route[j].Cnt = item[x].cnt;
                                                itemCnt++;
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                    // startChecking
                    var interval = setInterval(() => {
                        if (itemCnt == itemTotal && ownerCnt == onwerTotal) {
                            clearInterval(interval);
                            callback(route);
                        } else {
                           // console.log('itme: total: ' + itemTotal + ' cnt: ' + itemCnt);
                            //console.log('owner: totla: ' + onwerTotal + ' cnt: ' + ownerCnt);
                        }
                    }, 100);
                }
            });

        }
    });
}

exports.getItemSector = (listID, callback) => {
    const itemQuery = `select * from Item where ListID=${listID} order by Cluster`;
    const clusterQuery = `select Cluster, count(ItemID) ClusterCnt from Item where ListID=${listID} group by Cluster order by Cluster`;
    connection.query(itemQuery, (e0, itemList) => {
        if (e0) {
            console.error(e0);
            callback(null);
        } else {
            connection.query(clusterQuery, (e1, cluster) => {
                if (e1) {
                    console.error(e1);
                    callback(null);
                } else {
                    callback({
                        itemList: itemList,
                        cluster: cluster
                    });
                }
            });
        }
    });
}


exports.getTimelineShort = (routeID, callback) => {
    const query = `select TTT.RunDate, Num, DriverName, MMM.Name PtName, MMM.ID PTID from
    (select TT.*, MM.Name DriverName from
    (select T.*, B.Num from 
    (select RunDate, BusID, DriverID, PTID from Timeline where RouteID=${routeID}) T
    left outer join Bus B
    on T.BusID=B.ID) TT
    left outer join Members MM
    on TT.DriverID=MM.ID) TTT 
    left outer join Members MMM
    on MMM.ID=TTT.PTID`;

    connection.query(query, (err, timeline) => {
        if (err) {
            console.error(err);
            callback(null);
        } else {
            callback(timeline);
        }
    });
}

exports.getPartTimeMembers = (callback) => {
    const query = `select Name, ID, BizAddr from Members where MemberCat=5`;
    connection.query(query, (err, members) => {
        if (err) {
            console.error(err);
            callback(null);
        } else {
            callback(members);
        }
    });
}

exports.updateTimeLinePt = (routeID, remove, part, callback) => {
    var removeQuery = `update Timeline set PTID=null where RouteID=${routeID} and RunDate in ('1970-01-01'`;
    for (var i = 0; i < remove.length; i++) {
        if (i == 0) {
            removeQuery += ',';
        }
        removeQuery += `'${remove[i]}'`;
        if (i != remove.length - 1) {
            removeQuery += ',';
        }
    }
    removeQuery += ')';
    connection.query(removeQuery, (e0) => {
        if (e0) {
            console.error(e0);
            callback(false);
        } else {
            // delete all empty data;
            var clearQuery = `delete from Timeline where BusID is null and DriverID is null and PTID is null`;
            connection.query(clearQuery, (e1) => {
                if (e1) {
                    console.error(e1);
                    callback(false);
                } else {
                    updatePartTime(routeID, part, callback);
                }
            });
        }
    });
}
async function updatePartTime(routeID, part, callback) {
    var insertList = [];
    var index = 0;
    for (var i = 0; i < part.length; i++) {
        var id = ((String)(part[i])).split(':')[0];
        var date = ((String)(part[i])).split(':')[1];
  //      console.log(id);
        // console.log(date);
        var insertQuery = `insert into TimeLine set RouteID=${routeID}, RunDate='${date}', PTID='${id}'`;
        insertList.push(insertQuery);
        var updateQuery = `update Timeline set PTID='${id}' where RouteID=${routeID} and RunDate='${date}'`;
        console.log(updateQuery);
        connection.query(updateQuery, (e0, result) => {
            if (e0) {
                console.error(e0);
                callback(false);
            } else {
                console.log(insertList[index++]);
                if (result.affectedRows == 0) {
                    connection.query(insertList[index - 1], (e1) => {
                        if (e1) {
                            console.error(e1);
                        }
                    });
                }
            }
        });
    }
    callback(true);
}

function setFullTimeline (year)  {
    const routeQuery = `select RouteID from Route where RouteID!=0`;
    var cnt = 0;
    connection.query(routeQuery, (e0, route) => {
        if (e0) {
            console.error(e0);
        } else {
            for (var j = 0; j < route.length; j++) {
                for (var month = 1; month <= 12; month++) {
                    var dateEnd = 0;
                    switch (month) {
                        case 1:
                        case 3:
                        case 5:
                        case 7:
                        case 8:
                        case 10:
                        case 12:
                            dateEnd = 31;
                            break;
                        case 2:
                            if (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) {
                                dateEnd = 29;
                            } else {
                                dateEnd = 28;
                            }
                            break;
                        default:
                            dateEnd = 30;
                    }
                    for (var date = 1; date <= dateEnd; date++) {
                        var dateStr = year + '-' + month + '-' + date;
                        const insertQuery = `INSERT INTO Timeline (RouteID, RunDate) 
                        SELECT ${route[j].RouteID}, '${dateStr}' 
                        from dual WHERE NOT EXISTS 
                        ( SELECT * FROM Timeline WHERE RouteID=${route[j].RouteID} AND RunDate='${dateStr}' )`;
                        connection.query(insertQuery, (e1) => {
                            if (e1) {
                                console.error(e1);
                            } else {
                                //console.log('update: ' + cnt++);
                            }
                        });
                    }
                }
            }
        }
    });
}

exports.getRouteList = (id, callback) => {
    const query = `select RouteID, Name from Route where Logi='${id}'`;
    connection.query(query, (e0, route) => {
        if (e0) {
            callback(e0);
        } else {
            callback(route);
        }
    });
}

exports.getDeliveryDriverSchedule = (id, callback) => {
    const query = `select T.*, R.Name RouteName, R.ContractStart, R.ContractEnd from 
    (select RouteID ,RunDate from Timeline where DeliveryID like '%${id}%') T
    join Route R on T.RouteID=R.RouteID`;

    connection.query(query, (e0, dates) => {
        if (e0) {
            console.error(e0);
            callback(null);
        } else {
            callback(dates);
        }
    });
}

exports.updateDeliverySchedule = (id, remove, add, callback) => {
    const removeTotal = remove.length;
    const addTotal = add.length;

    var removeCnt = 0, addCnt = 0;
    const routeQuery = `select RouteID from DDrivers where Phone='${id}'`;
    var callbacked = false;
    connection.query(routeQuery, (e0, routeRs) => {
        if (e0) {
            console.error(e0);
            callback(false);
        } else {
            const route = routeRs[0].RouteID;
            for (var i = 0; i < removeTotal; i++) {
                const removeQuery = `UPDATE Timeline SET DeliveryID = REPLACE(DeliveryID, '${id}', ''), DeliveryID=replace(DeliveryID, ',,', ',')
                where RouteID=${route} and RunDate='${remove[i]}'`;
                connection.query(removeQuery, (e1) => {
                    if (e1) {
                        console.error(e1);
                        callback(false);
                    } else {
                        removeCnt++;
                    }
                });
            }
            var interval0 = setInterval(() => {
                if (removeCnt == removeTotal) {
                    clearInterval(interval0);
                    for (var i = 0; i < addTotal; i++) {
                        const addQuery = `update Timeline T1, 
                        (select DeliveryID from Timeline where RouteID=${route} and RunDate='${add[i]}') T2
                        set T1.DeliveryID=concat_ws(',', T2.DeliveryID, '${id}')
                        where T1.RouteID=${route} and T1.RunDate='${add[i]}'`;

                        connection.query(addQuery, (e2) => {
                            if (e2) {
                                console.error(e2);
                                callback(false);
                            } else {
                                addCnt++;
                            }
                        });
                    }
                    var interval1 = setInterval(() => {
                        if (addCnt == addTotal) {
                            clearInterval(interval1);
                            if (!callbacked) {
                                callbacked = true;
                                callback(true);
                            }
                        }
                    }, 100);
                }
            }, 100);
        }
    });
}

exports.getDong = (items, callback) => {
    const total = items.length;
    var cnt = 0;

    for (var i = 0; i < total; i++) {
        var line = items[i].addr.split(' ');
        var addr = '';
        for (var j = 0; j < line.length; j++) {
            addr += line[j];
        }
        addr = addr.split('(')[0];
        addr = addr.replace('지하', '');
        addr = addr.split('-')[0];
        const query = `select Gu, Dong from AddrMatch where Addr like '%${addr}%'`;
        connection.query(query, (e0, rs) => {
            if (e0) {
                console.error(e0);
            } else {
                if (rs[0]) {
                    const dong = rs[0].Dong;
                    const gu = rs[0].Gu;
                    items[cnt].dong = dong;
                    items[cnt].gu = gu;
                }
            }
            cnt++;
            console.log(cnt);
        });
    }

    var interval = setInterval(() => {
        if (cnt == total) {
            clearInterval(interval);
            callback(items);
        }
    }, 100);
}

exports.createLogiItemList = (logiId, date, cluster, callback) => {
    var total = 0, cnt = 0;
    var listQuery = `insert into ItemList(OwnerID, SoldDate) values `;
    // divide gu | create list insert query
    for (var i = 0; i < cluster.length; i++) {
        listQuery += `('${logiId}', '${date}')`;
        if (i != cluster.length - 1) {
            listQuery += ',';
        }
    }
    // create each item list
    connection.query(listQuery, (e0) => {
        if (e0) {
            console.error(e0);
            callback(false);
        } else {
            // get all item ids
            const getListQuery = `select * from
            (select ListID from ItemList 
            where OwnerID='${logiId}' 
            order by ListID desc limit ${cluster.length}) I order by ListID asc`;

            connection.query(getListQuery, (e1, listRs) => {
                if (e1) {
                    console.error(e1);
                    callback(false);
                } else {
                    for (var i = 0; i < listRs.length; i++) {
                        const listID = listRs[i].ListID;
                        // divied dong
                        const gu = cluster[i].gu;
                        for (var j = 0; j < cluster[i].Items.length; j++) {
                            const dong = cluster[i].Items[j].dong;
                            for (var x = 0; x < cluster[i].Items[j].Items.length; x++) {
                                const item = cluster[i].Items[j].Items[x];
                                total++;
                                const itemQuery = `insert into Item set ItemID='${item.id}', ListID=${listID}, ItemName='${item.name}', 
                                DesAddr='${item.addr}', DesName='${item.des_name}', DesPhone='${item.des_phone}', Gu='${gu}', Dong='${dong}'`;
                                connection.query(itemQuery, (e2) => {
                                    if (e2) {
                                        callback(false);
                                    } else {
                                        cnt++;
                                    }
                                });
                            }
                        }
                        const updateQuery=`update Timeline set LogiList=${listID}
                        where RunDate='${date}' and RouteID in (
                            select RouteID from Route where Gu='${gu}'
                        )`;
                        total++;
                        connection.query(updateQuery, (e3)=>{
                            if(e3) {
                                callback(false);
                            } else {
                                cnt++;
                            }
                        });
                    }
                    var interval = setInterval(() => {
                        if (total == cnt) {
                            clearInterval(interval);
                            callback(true);
                        }
                    });
                }
            });
        }
    });
}
exports.getLogiItemList=(logiId, date, callback)=>{
    const query=`select * from Item where ListID in 
    (select LogiList from Timeline where RouteID in (
    select RouteID from Route where Logi='${logiId}')
    and RunDate='${date}') order by ListID`;

    connection.query(query, (e0, itmeRs)=>{
        if(e0) {
            callback(null);
        } else {
            callback(itmeRs);
        }
    })
}

exports.getGu=(route, callback)=>{
    const query=`select Gu from Route where RouteID=${route}`;
    connection.query(query, (e0, rs)=>{
        if(e0) {
            callback(null);
        } else {
            if(rs[0]) {
                callback(rs[0].Gu);
            } else {
                callback(null);
            }
        }
    });
}

exports.updateGu=(route, gu, callback)=>{
    const query=`update Route set Gu='${gu}' where RouteID=${route}`;
    connection.query(query, (e0)=>{
        if(e0) {
            callback(false);
        } else {
            callback(true);
        }
    });
}

exports.getGuCnt=(gu, callback)=>{
    const query=`select count(RouteID) Cnt from Route where Gu='${gu}'`;
    connection.query(query, (e0, rs)=>{
        if(e0) {
            console.error(e0);
            callback(null);
        } else {
            callback(rs[0].Cnt)
        }
    });
}

// manager, bus, logi all accept
exports.getStatus=(date, bus, logi, callback)=>{
    var timelineQuery=`select TTTT.*, Buss.Num from 
    (select TTT.*, DRV.Name DriverName from 
   (select TT.*, PT.Name PtName, PT.Phone PtPhone from
   (select R.*,T.BusID, T.DriverID, T.PTID, T.ActionID, T.Lat, T.Lng from Timeline T 
   left outer join Route R on T.RouteID=R.RouteID
    where T.RunDate='${date}') TT left outer join Members PT
    on TT.PTID=PT.ID) TTT left outer join Members DRV
    on TTT.DriverID=DRV.ID) TTTT left outer join Bus Buss
    on TTTT.BusID=Buss.ID`;

    if(bus) {
       timelineQuery+=` where CorpID='${bus}'`;
    } else  if(logi) {
        timelineQuery+=` where Logi='${logi}'`;
    }

    var total=0, cnt=0;
    var locArr=[];

    connection.query(timelineQuery, (e0, timelineRs)=>{
        if(e0) {
            console.error(e0);
            callback(null);
        } else {
            for(var i=0; i<timelineRs.length; i++) {
                const locations=timelineRs[i].Locations;
                const locationQuery=`select * from Location where LocID in (${locations}) order by RcTime`;
                total++;
                connection.query(locationQuery, (e1, locationRs)=>{
                    if(e1) {
                        console.error(e1);
                        locArr.push([]);
                    } else {
                        locArr.push(locationRs);
                    }
                    cnt++;
                });
            }
            var interval=setInterval(()=>{
                if(cnt==total) {
                    clearInterval(interval);
                    for(var i=0; i<timelineRs.length; i++) {
                        timelineRs[i].Loc=locArr[i];
                    }
                    callback(timelineRs);
                }
            }, 100);
        }
    });
}

exports.updateCommission=(id, commission, callback)=>{
    const query=`update Members set Commission=${commission} where ID='${id}'`;
    connection.query(query, (e0)=>{
        if(e0) {
            console.error(e0);
            callback(false);
        } else {
            callback(true);
        }
    });
}

exports.updateAdFee=(id, fee, callback)=>{
    const query=`update Members set AdFee=${fee} where ID='${id}'`;
    connection.query(query, (e0)=>{
        if(e0) {
            console.error(e0);
            callback(false);
        } else {
            callback(true);
        }
    });
}

exports.updateLogiRunFee=(id, fee, callback)=>{
    const query=`update Members set RunFee=${fee} where ID='${id}'`;
    connection.query(query, (e0)=>{
        if(e0) {
            console.error(e0);
            callback(false);
        } else {
            callback(true);
        }
    });
}

exports.updateBusFee=(id, fee, callback)=>{
    const query=`update Members set DefaultFee=${fee} where ID='${id}'`;
    connection.query(query, (e0)=>{
        if(e0) {
            console.error(e0);
            callback(false);
        } else {
            callback(true);
        }
    });
}

exports.updateDefaultFee=(id, fee, callback)=>{
    const query=`update Members set DefaultFee=${fee} where ID='${id}'`;
    connection.query(query, (e0)=>{
        if(e0) {
            console.error(e0);
            callback(false);
        } else {
            callback(true);
        }
    })
}

exports.updateOwnerCnt=(id, cnt, callback)=>{
    const query=`update Members set DefaultCnt=${cnt} where ID='${id}'`;
    connection.query(query, (e0)=>{
        if(e0) {
            console.error(e0);
            callback(false);
        } else {
            callback(true);
        }
    })
}

exports.getBusGraph=(bus, callback)=>{
    var query=`select date_format(R.Month, '%Y-%m-01') Ym, count(R.RouteID)*M.DefaultFee RunFee from Members M join
    (select distinct C.Month, R.RouteID, R.CorpID from Calendar C, Route R
    where C.Month between R.ContractStart and R.ContractEnd ) R
    on M.ID=R.CorpID`;
    if(bus) {
        query+=` and M.ID='${bus}'`;
    }
    query+=` group by R.Month, R.CorpID`;

    connection.query(query, (e0, rs)=>{
        if(e0) {
            console.error(e0);
            callback(null);
        } else {
            callback(rs);
        }
    });
}

exports.getLogiGraph=(logi, owner, bus,callback)=>{
    var deliveryQuery=`select Ym ,sum(Cnt*AdFee) LogiPrice from 
    (select MEMB.AdFee, date_format(ROUT.RunDate, '%Y-%m-01') Ym ,ROUT.Cnt from 
    (select RTE.*, ITL.Cnt from 
    (select RR.*, TT.LogiList, TT.RunDate from 
    (select RouteID, Logi from Route where Logi in
    (select ID from Members where MemberCat=4 `
    if(logi) {
        deliveryQuery+=` and ID='${logi}'`;
    }
    deliveryQuery+=` )) RR left outer join 
    (select LogiList, RouteID, RunDate from Timeline ) TT 
    on RR.RouteID=TT.RouteID where LogiList is not null) RTE join 
    (select ListID, count(ItemID) Cnt from Item group by ListID) ITL
    on RTE.LogiList=ITL.ListID) ROUT join 
    Members MEMB on ROUT.Logi=MEMB.ID) ROUTE group by Ym`;

    var takeQuery=`select Ym, if(sum(TmpFee)>0, sum(TmpFee)+sum(DefaultFee), sum(DefaultFee)) Total from 
    (select distinct Ym, (Tmp*Commission)/100 TmpFee, (DefaultFee*Commission)/100 DefaultFee from
    (select TOTAL.Ym, TOTAL.DefaultFee, TOTAL.Tmp, MEMBS.Commission from 
    (select FEEE.*, ROUT.Logi from 
    (select MEM.ID, ITL.Ym,(ITL.Cnt-MEM.DefaultCnt)*Mem.AdFee Tmp, DefaultFee from
    (select ID, AdFee, DefaultFee ,DefaultCnt from Members ) MEM join
    (select IL.OwnerID, date_format(SoldDate, '%Y-%m-01') Ym, sum(II.Cnt) Cnt from
    (select * from ItemList where OwnerID in
    (select ID from Members where MemberCat=3 `;
    if(owner) {
        takeQuery+=`and ID like '%${owner}%'`;
    }
        takeQuery+=`)) IL left outer join    
    (select ListID, count(ItemID) Cnt from Item group by ListID) II
    on IL.ListID=II.ListID group by OwnerID, Ym) ITL
    on MEM.ID=ITL.OwnerID) FEEE left outer join
    Route ROUT on ROUT.Owners regexp FEEE.ID) TOTAL left outer join
    Members MEMBS on TOTAL.Logi=MEMBS.ID) Result) R group by Ym`;

    var runQuery=`select date_format(R.Month, '%Y-%m-01') Ym, count(R.RouteID)*M.RunFee*0.1 RunFee from Members M join
    (select distinct C.Month, R.RouteID, R.Logi from Calendar C, Route R
    where C.Month between R.ContractStart and R.ContractEnd`
    if(bus) {
        runQuery+=` and CorpID='${bus}' `;
    }
    runQuery+=`) R
    on M.ID=R.Logi `;
    if(logi) {
        runQuery+=`where M.ID='${logi}'`;
    }    
    runQuery+=` group by R.Logi, R.Month`;

    connection.query(deliveryQuery, (e0, deliveryRs)=>{
        if(e0) {
            console.error(e0);
            callback(null);
        } else {
            connection.query(takeQuery, (e1, takeRs)=>{
                if(e1) {
                    console.error(e1);
                    callback(null);
                } else {
                    connection.query(runQuery, (e2, runRs)=>{
                        if(e2) {
                            console.error(e2);
                            callback(null);
                        } else {
                            callback({
                                delivery: deliveryRs,
                                take: takeRs,
                                run:runRs
                            });
                        }
                    });
                }
            });
        }
    });
}

exports.getLogiCnt=(logi, month, date, callback)=>{
    var query=`select RRRR.Name, sum(LogiCnt) LogiCnt, sum(OwnerCnt) OwnerCnt from
    (select RRR.*, III.Cnt OwnerCnt from 
    (select RR.*, II.Cnt LogiCnt from 
    (select R.Name, T.* from Route R join 
    (select RouteID, LogiList, ListID from Timeline where RouteID in(
    select RouteID from Route where Logi='${logi}') and `
    if(month) {
        var start=month+'-01';
        var end=month.split('-')[0]+'-'+(parseInt(month.split('-')[1])+1)+'-01';
        query+=`RunDate between '${start}' and '${end}'`;
    } else  {
        query+=`RunDate='${date}'`;
    }
    query+=`) T
    on R.RouteID=T.RouteID) RR left outer join 
    (select ListID, count(ItemID) Cnt from Item group by ListID) II
    on RR.LogiList=II.ListID) RRR left outer join
    (select ListID, count(ItemID) Cnt from Item group by ListID) III
    on III.ListID regexp(RRR.ListID)) RRRR group by Name`;

    connection.query(query, (e0, rs)=>{
        if(e0) {
            console.error(e0);
            callback(null);
        } else {
            callback(rs);
        }
    });
}

exports.getBusCalc=(bus, start, end, callback)=>{
    const query=`select LogiName,count(LogiID) RouteCnt, sum(DefaultFee) DefaultFeeTotal, sum(RunFee) RunFeeTotal, RunFee, DefaultFee from 
    (select RR.*, BB.DefaultFee from 
    (select  R.CorpID, L.Name LogiName, L.ID LogiID, L.RunFee from 
    (select * from Route where CorpID='${bus}' 
    and ContractStart<='${start}' and ContractEnd>'${end}') R left outer join
    Members L
    on R.Logi=L.ID) RR join Members BB
    on RR.CorpID=BB.ID) RRR group by LogiID`;

    connection.query(query, (e0, rs)=>{
        if(e0) {
            console.error(e0);
            callback(null);
        } else {
            callback(rs);
        }
    });
}