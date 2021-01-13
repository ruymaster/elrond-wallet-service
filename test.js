let fetch = require('node-fetch');
let config = require('./config')();


const start= async function() {
    let result = await fetch(config.elrondAPIUrl+"address/erd1fmmnrxxumehyqzexljep6q3fthcwag8epv0xy3yxtj4duc6pp2qstj70hh", {method:"GET"});
    let response  = await result.json();
    console.log(response.data.account.nonce);
}

start();

module.exports={start: start};