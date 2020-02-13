const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'buslinker',
    password: 'Fucker0916!',
    database: 'Buslinker2'
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

exports.createRoute = (corp, name, station, logi, empty, owner, contract, callback) => {
    geocoder.geocode(station.addr, (e0, res) => {
        // geocode station
        if (e0) {
            console.error('e0');
            console.error(e0);
        } else {
            console.log('e0 pass');
            // station 1 insert
            const station1Insert = `insert into Location set LocName='${station.name}', LocAddr='${station.addr}',
            Lng=${res[0].longitude}, Lat=${res[0].latitude}, RcTime='${station.start}'`;
            connection.query(station1Insert, (e1) => {
                if (e1) {
                    console.error('e1');
                    console.error(e1);
                } else {
                    console.log('e1 pass');
                    // station 2 insert
                    const station2Insert = `insert into Location set LocName='${station.name}', LocAddr='${station.addr}',
                    Lng=${res[0].longitude}, Lat=${res[0].latitude}, RcTime='${station.end}'`;
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
                                                LocAddr='${logiAddr}', Lng=${logiAddr[0].longitude}, Lat=${logiAddr[0].latitude}, RcTime='${logi.start}'`;
                                                    connection.query(logi1Insert, (e5) => {
                                                        if (e5) {
                                                            console.error('e5');
                                                            console.error(e5);
                                                        } else {
                                                            console.log('e5 pass');
                                                            // logi 2 insert
                                                            const logi2Insert = `insert into Location set LocName='${logiName}', 
                                                        LocAddr='${logi.addr}', Lng=${logiAddr[0].longitude}, Lat=${logiAddr[0].latitude}, RcTime='${logi.end}'`;
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
                                                                                LocAddr='${empty.addr}', Lng=${emptyAddr[0].longitude}, Lat=${emptyAddr[0].latitude}, RcTime='${empty.time}'`;
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
                                                                                                                        LocAddr='${batchAddr[i]}', Lng=${data[i].value[0].longitude}, Lat=${data[i].value[0].latitude}, RcTime='${owner[i].time}'`)
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
                                                                                                                            ContractStart='${contract.start}', ContractEnd='${contract.end}',  Logi='${logi.id}',Locations='`;
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
                            console.error(e3);
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

    const query = `select L.ListID, L.SoldDate, count(I.ListID) as Count
    from ItemList L join Item I 
    on L.ListID=I.ListID 
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
    const dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    // create item list first
    const listQuery = `insert into ItemList set OwnerID='${userID}', SoldDate='${dateStr}'`;
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
                        itemQuery += `('${ids[i]}',${listID}, '${item_names[i]}', '${addrs[i]})', '${names[i]}', '${phones[i]}')`;
                        if (i != ids.length - 1) {
                            itemQuery += ',';
                        }
                    }
                    // last query | user can't wait
                    connection.query(itemQuery, (e4) => {
                        if (e4) {
                            console.error('e4');
                            console.error(e4);
                            callback(false);
                        } else {
                            callback(true);
                        }
                    });

                 setItem(addrs, ids);
                }
            });
        }
    });
}
async function setItem(addrs, ids) {
       // set geocord item
       var location=[];
       for(var i=0; i<addrs.length; i++) {
           var gc=await geocoder.geocode(addrs[i], (e2, data)=>{
               if(e2) {
                   console.error(e2);
               } else {
                   console.log('geocode: '+i);
                   location.push([data[0].latitude, data[0].longitude]);
               }
           });
       }
       console.log(location);
       var kmeans=require('node-kmeans');
    //    clustering 10 sector
      kmeans.clusterize(location, {k: 6}, (err, cluster)=> {
            if(err) {
                console.error(err);
            } else {
                console.log(cluster);
                // update item cluster
                for(var i=0; i<cluster.length; i++) {
                    for(var j=0; j<cluster[j].clusterInd.length; j++) {
                        var itemIndex=cluster[i].clusterInd[j];
                        var itemID=ids[itemIndex];
                        var updateItem=`update Item set Cluster=${i+1} where itemID='${itemID}'`;
                        connection.query(updateItem, (e1)=> {
                            if(e1) {
                                console.error(e1);
                            } else {
                                console.log('item update');
                            }
                        });
                    }
                } 
            }
       });
}

exports.getItemListDetail = (userID, ListID, callback) => {
    const query = `select I.* from item I join ItemList L
    on L.ListID=I.ListID
    where L.OwnerID='${userID}'
    and L.ListID=${ListID}`;

    connection.query(query, (e0, result) => {
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
    var deleteQuery = `delete from Timeline where RouteID=${routeID} and RunDate in (`;
    var insertQuery = `insert into Timeline(RouteID, Rundate) values `;
    var dates = [];
    // get date by bus
    for (var i = 0; i < bus.length; i++) {
        const date = (bus[i].split(':'))[0];
        dates.push(date);
    }
    // get date by driver
    for (var i = 0; i < driver.length; i++) {
        const date = (driver[i].split(':'))[0];
        dates.push(date);
    }
    // for full clear date, get removed date
    for (var i = 0; i < removes.length; i++) {
        dates.push(removes[i]);
    }
    // get unique dates
    for (var i = 0; i < dates.length; i++) {
        for (var j = 0; j < dates.length; j++) {
            if (i != j && dates[i] == dates[j]) {
                dates.splice(j, 1);
            }
        }
    }
    // init delete query || init insert query
    for (var i = 0; i < dates.length; i++) {
        deleteQuery += ` '${dates[i]}' `;
        insertQuery += `(${routeID}, '${dates[i]}')`;
        if (i != dates.length - 1) {
            deleteQuery += ',';
            insertQuery += ',';
        }
    }
    deleteQuery += ')';

    var updateDrivers = [];
    for (var i = 0; i < driver.length; i++) {
        const date = driver[i].split(':')[0];
        const driverID = driver[i].split(':')[1];
        updateDrivers.push(`update Timeline set DriverID='${driverID}' where RunDate='${date}'`);
    }

    var updateBus = [];
    for (var i = 0; i < bus.length; i++) {
        const date = bus[i].split(':')[0];
        const busId = bus[i].split(':')[1];
        updateBus.push(`update Timeline set BusID=${busId} where RunDate='${date}'`);
    }

    const total = updateBus.length + updateDrivers.length;
    var current = 0;

    connection.query(deleteQuery, (e0) => {
        if (e0) {
            console.error('e0');
            console.error(e0);
            callback(false);
        } else {
            connection.query(insertQuery, (e1) => {
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

// get ownwer's delivery fee by manage
exports.getOwnerFee = (start, end, corp, callback) => {
    const query = `select MM.*, II.ItemCnt from 
    (select ID,Name ,AdFee, DefaultFee, DefaultCnt from Members where MemberCat=3 and Corp='${corp}') MM
    left outer join (
    select OwnerID, sum(ItemCnt) ItemCnt from
    (select IL.*, count(I.ItemID) ItemCnt from ItemList IL join Item I
    on IL.ListID=I.ListID
    where IL.SoldDate>='${start}' and SoldDate<'${end}'
    group by IL.ListID) O
    group by OwnerID) II on MM.ID=II.OwnerID`;
    connection.query(query, (err, result) => {
        if (err) {
            console.error(err);
            callback(null);
        } else {
            callback(result);
        }
    });
}