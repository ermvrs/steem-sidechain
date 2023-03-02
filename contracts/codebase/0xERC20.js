async function name() {
    return readStorage('name');
}

async function symbol() {
    return readStorage('symbol');
}

async function decimals() {
    return readStorage('decimals');
}

async function totalSupply() {
    return readStorage('totalSupply'); // parsefloat standart edilmeli
}

async function balanceOf(address) {
    const balance = await readStorage(mapping("balances",address));
    return parseFloat(balance);
}

async function transfer(receiver, amount) {
    if(amount == 0) {
        return false;
    }
    // TODO RECEIVER VE SENDER ADRES KONTROLLERI
    const callerBalance = await balanceOf(caller); 
    if(callerBalance < amount) {
        return false; // failed
    }

    // gönderenden bakiye keselim
    const newCallerBalance = callerBalance - amount;
    const receiverBalance = await balanceOf(receiver);
    const receiverNewBalance = receiverBalance + amount;

    await writeStorage(mapping("balances",caller), newCallerBalance);
    await writeStorage(mapping("balances", receiver), receiverNewBalance);
    
    return true;
}

async function mint(receiver, amount) {
    const receiverBalance = await balanceOf(receiver);
    const receiverNewBalance = receiverBalance + amount;

    await writeStorage(mapping("balances", receiver), receiverNewBalance);
    return true;
}