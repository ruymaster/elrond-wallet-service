const express = require("express");
const bodyParser = require("body-parser");
const { JSONRPCServer } = require("json-rpc-2.0");
const core = require("@elrondnetwork/elrond-core-js");
const fs = require("fs");



const server = new JSONRPCServer();

// First parameter is a method name.
// Second parameter is a method itself.
// A method takes JSON-RPC params and returns a result.
// It can also return a promise of the result.
server.addMethod("newAccount", ({ password }) => createAccount(password));
server.addMethod("sendEGLD", ({fromAddress, toAddress, amount, password }) => sendEGLD(fromAddress, toAddress, amount, password));

const app = express();
app.use(bodyParser.json());

app.post("/json-rpc", (req, res) => {
  const jsonRPCRequest = req.body;
  // server.receive takes a JSON-RPC request and returns a promise of a JSON-RPC response.
  
  server.receive(jsonRPCRequest).then((jsonRPCResponse) => {
    if (jsonRPCResponse) {
      res.json(jsonRPCResponse);
    } else {
      // If response is absent, it was a JSON-RPC notification method.
      // Respond with no content status (204).
      res.sendStatus(204);
    }
  });
});

function createAccount(password)
{
    let account = new core.account();
    let keyFile = account.initNewAccountFromPassword(password);
    let keyFileJson = JSON.stringify(keyFile, null, 4);
    fs.writeFileSync("./.keys/"+account.address()+".json", keyFileJson);
    return account.address();
}

function sendEGLD(fromAddress, toAddress, amount, password){
    let keyFileJson = fs.readFileSync("./.keys/"+fromAddress+".json", { encoding: "utf8" }).trim();
    let keyFileObject = JSON.parse(keyFileJson);

    let account = new core.account();
    account.loadFromKeyFile(keyFileObject, password);
    console.log("---from address: ", account.address());
    let address  = account.address(); 
    let transaction = new core.transaction(
        2,                // nonce
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
return signedTransaction;
}
app.listen(8000);