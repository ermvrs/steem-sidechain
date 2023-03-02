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
    const response = await externalCall("0x123", "viewMethod", [2,5], "1.000 STEEM", "0.000 STEEM")
    // response içerisinde result ve data döner
    if(response.result === "REVERT") {
        return false;
    }
    return response.data.return // sonuç bu prop ta döner
}