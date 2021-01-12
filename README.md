# elrond-wallet-service
# rpc example :
curl --request POST 'http://127.0.0.1:8000/json-rpc' \
--header 'Content-Type: application/json' \
--data-raw '{"jsonrpc":"2.0", "method":"echo", "params":{"text":"hello world!"}, "id": 0}'
