const web=require('./web');
const mobile=require('./mobile');
const ip = require('ip');
//console.log('Server IP: '+ip.address());
web.startApp(80);
mobile.startApp(3300);