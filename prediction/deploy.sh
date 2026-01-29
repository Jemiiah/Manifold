APPNAME="aleo-prediction"
PRIVATEKEY="APrivateKey1zkp5osJ4AGo1pJMLnjdL2QjVd1NVdNzYqpLmKenmVXpkMkP"

snarkos developer deploy \
     "${APPNAME}.aleo" \
    --private-key "${PRIVATEKEY}" \
    --query "https://vm.aleo.org/api" \
    --path "./build/" \
    --broadcast "https://vm.aleo.org/api/testnet3/transaction/broadcast"