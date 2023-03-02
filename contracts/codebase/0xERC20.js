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
    const balance = await readStorage(`balance[${address}]`); // TODO mapping geliştirilecek hash fonksiyon
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

    await writeStorage(`balance[${caller}]`, newCallerBalance);
    await writeStorage(`balance[${receiver}]`, receiverNewBalance);
    
    return true;
}
