
function add(a,b) {
    return a + b;
}

async function reader(id) {
    const value = await readStorage(id)

    return value;
}

async function writer(id, value) {
    // updates contract storage

    await writeStorage(id, value);

    return true;
}

async function callRemoteContract() {

    // const response = await externalCall("0x123", "_internalMethod", [1,1], "1.000 STEEM", "0.000 STEEM") // revert olsada diğer call atar ancak kodu çalışmayacaktır.

    if(response.result === "REVERT") {
        return false;
    }
    return response.data // sonuç bu prop ta döner
}

async function response(a,b) {
    const response = await externalCall("0x123", "writeMethod", [a,b], "1.000 STEEM", "0.000 STEEM")
    await writeStorage("aasas", 3);
    // response içerisinde result ve data döner
    if(response.result === "REVERT") {
        return false;
    }
    return response.data // sonuç bu prop ta döner
}

function sampleMap(...a) {
    return mapping(...a);
}