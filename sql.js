const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'buslinker',
    password: 'Fucker0916!',
    database: 'Buslinker2'
});
const crypto=require('./cryto');

connection.connect();

// get subjects
exports.getSubjects=function(callback) {
    connection.query('select * from AskSubject', function (error, results, fields) {
        if (error) {
            console.log(error);
        }
        callback(results);
    });
}

// create ask
exports.createAsk=(email, subject, message, callback)=> {
    const query=`insert into Ask set Email='${email}', Subject=${subject}, Message='${message}', View=false`;
    connection.query(query, (error, results, fields)=> {
        if(error){
            console.error(error);
            callback(false);
        } else {
            callback(true);
        }
    })
}

// login
exports.login=(id, pw, callback)=> {
    const query=`select ID, Name, MemberCat from Members where ID='${id}' and Password='${crypto.Chipe(pw)}'`;
    
    connection.query(query, (error, results, fields)=>{
        if(error) {
            console.error(error);
        } else {
            if(results[0]){
                callback(results[0]);
            } else {
                callback(null);
            }
        }
    });
}