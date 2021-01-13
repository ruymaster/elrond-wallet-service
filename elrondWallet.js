let config = require('./config')();
let fetch = require('node-fetch');
const core = require("@elrondnetwork/elrond-core-js");
const fs = require("fs");

module.exports = {    
    name: "ElrondLocalWallet",
    createAccount: function (password) {
        let account = new core.account();
        let keyFile = account.initNewAccountFromPassword(password);
        let keyFileJson = JSON.stringify(keyFile, null, 4); 
        // check if key directory exists
        const dir = "./.keys";
        if (!fs.existsSync(dir)) {            
            console.log('Directory not found. .keys directory is created. ');
            fs.mkdirSync(dir);
        }
        fs.writeFileSync("./.keys/"+account.address()+".json", keyFileJson);
        console.log("-- account was created", account.address());
        return account.address();
    },
    sendEGLD: async function(fromAddress, toAddress, amount, password){
        let keyFileJson = fs.readFileSync("./.keys/"+fromAddress+".json", { encoding: "utf8" }).trim();
        if(!keyFileJson) return {error:"wrong source address"};    
        let keyFileObject = JSON.parse(keyFileJson);    
        let account = new core.account();
        account.loadFromKeyFile(keyFileObject, password);    
        let address  = account.address(); 
        //--- get nonce from elrond api -------//
        let result = await fetch(config.elrondAPIUrl+"address/"+address);
        let {data} = await result.json();
        if(!data) return {error:"missing account info."};
        let nonce = data.account.nonce;

        let transaction = new core.transaction(
            nonce,                // nonce
            address,         // sender
            toAddress,         // receiver
            amount, // value
            1000000000,           // gas price
            70000,                // gas limit
            "hi",      // data (not encoded)
            "1",                  // chain ID
            1                     // tx version
        );

        let serializedTransaction = transaction.prepareForSigning();
        transaction.signature = account.sign(serializedTransaction);
        let signedTransaction = transaction.prepareForNode();
        let signedTransactionJson = JSON.stringify(signedTransaction, null, 4);
        //----- send transaction -------//
        result = await fetch(config.elrondAPIUrl + "transaction/send", {method:"POST", body: signedTransactionJson});
        const jsonResult =await result.json();        
            
        if(!jsonResult || !jsonResult.data || !jsonResult.data.txHash)
            return {error:"transaction is failed"};
        
        console.log("---transaction is success!", jsonResult.data.txHash);

        return jsonResult.data.txHash;

    }
}