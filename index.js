const express = require("express");
const bodyParser = require("body-parser");
const { JSONRPCServer } = require("json-rpc-2.0");
const core = require("@elrondnetwork/elrond-core-js");
const fs = require("fs");
let config = require('./config')();
let elrondWallet = require('./elrondWallet');


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
    return elrondWallet.createAccount(password);    
}

function sendEGLD(fromAddress, toAddress, amount, password){
    return elrondWallet.sendEGLD(fromAddress, toAddress, amount, password);
}
app.listen(config.port);