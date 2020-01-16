const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'buslinker',
    password: 'Fucker0916!',
    database: 'Buslinker2'
});
const crypto=require('./cryto');

connection.connect();

//part time
exports.Login=(id, pw, cat,callback)=> {
    const query=`select ID, Name, ProfilePath from Members where ID='${id}' and Password='${crypto.Chipe(pw)}' and MemberCat=${cat}`;
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

exports.CreateAsk=(id, message, callback)=> {
    const query=`insert into MemberAsk set MemberID='${id}', Message='${message}'`;
    connection.query(query, (error, results, fields)=> {
        if(error){
            console.error(error);
            callback(false);
        } else {
            callback(true);
        }
    });
}