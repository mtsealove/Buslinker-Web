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

connection.connect();

// get subjects
exports.getSubjects = function (callback) {
    connection.query('select * from AskSubject', function (error, results, fields) {
        if (error) {
            console.log(error);
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

exports.getOwners = (callback) => {
    const query = 'select ID, Name from Members where MemberCat=3';
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
                                                    const logiName = ((logi.id).split('-'))[1];
                                                    const logi1Insert = `insert into Location set LocName='${logiName}', 
                                                LocAddr='${logi.addr}', Lng=${logiAddr[0].longitude}, Lat=${logiAddr[0].latitude}, RcTime='${logi.start}'`;
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
                                                                                                                        if(e13) {
                                                                                                                            console.error(e13);
                                                                                                                        } else {
                                                                                                                            console.log('e13 pass');
                                                                                                                            for (var i = 0; i < ownerCnt; i++) {
                                                                                                                                ownerIDs.push(onwerResult[i].LocID);
                                                                                                                            }
                                                                                                                            
                                                                                                                            // insert route
                                                                                                                            var routeQuery = `insert into Route set Name='${name}', CorpID='${corp}',
                                                                                                                            ContractStart='${contract.start}', ContractEnd='${contract.end}',  Locations='`;
                                                                                                                            routeQuery += station1ID + ',';
                                                                                                                            routeQuery += logi1ID + ',';
                                                                                                                            routeQuery += emptyID + ',';
                                                                                                                            
                                                                                                                            for (var i = 0; i < ownerIDs.length; i++) {
                                                                                                                                routeQuery += ownerIDs[i] + ',';
                                                                                                                            }
                                                                                                                            routeQuery += logi2ID + ',';
                                                                                                                            routeQuery += station2ID + `'`;
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

exports.getRoute=(order, current, callback)=> {
    var date=new Date();
    var year=date.getFullYear();
    var month=date.getMonth()+1;
    var day=date.getDate();
    var dateStr=year+'-'+month+'-'+day;

    var query=`select R.*, M.Name as Bus from Route R join Members M
    on R.CorpID=M.ID where ContractEnd`;
    if(current) {
        query+=`>='${dateStr}'`;
    } else {
        query+=`<'${dateStr}'`;
    }
    query+=` order by Name ${order}`;
    connection.query(query, (err, result)=> {
        if(err) {
            console.error(err);
        } else {            
            // get location info
            var locations=[];
            for(var i=0; i<result.length; i++) {
                const line=(result[i].Locations).split(',');
                result[i].Loc=[];
                for(var j=0; j<line.length; j++) {
                    locations.push(line[j]);
                }
            }
            var inQeury=`select * from Location where LocID in (`;
            for(var i=0; i<locations.length; i++) {
                inQeury+=locations[i];
                if(i!=locations.length-1) {
                    inQeury+=', ';
                } else {
                    inQeury+=')';
                }
            }

            connection.query(inQeury, (e2, result2)=> {
                if(e2) {
                    console.error(e2);
                } else {
                    for(var i=0; i<result.length; i++) {
                        const line=(result[i].Locations).split(',');
                        for(var j=0; j<line.length; j++) {
                            result[i].Loc.push(result2.find(c=>c.LocID==line[j]));
                        }
                    }
                    console.log(result);
                    callback(result);
                }
            })
        }
    }); 
}