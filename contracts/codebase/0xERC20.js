import BigNumber from "bignumber.js";

async function initialize() {
    // constructor
    const isInitialized = await readStorage("initialized");
    if(isInitialized == 1) {
        throw new Error("Already initialized");
    }
    await writeStorage("initialized", 1);
    await writeStorage("owner", caller);
}

async function name() {
    return await readStorage('name');
}

async function symbol() {
    return await readStorage('symbol');
}

async function decimals() {
    return await readStorage('decimals');
}

async function totalSupply() {
    return await readStorage('totalSupply'); // parsefloat standart edilmeli
}

async function balanceOf(address) {
    const balance = await readStorage(mapping("balances",address));
    return parseFloat(balance);
}

async function allowance(owner, spender) {
    const allowed = await readStorage(mapping("allowances", owner, spender));
    return allowed;
}

async function approve(spender, amount) {
    await writeStorage(mapping("allowances", caller, spender), amount);
    return true;
}

async function transferFrom(sender, receiver, amount) {
    const allowed = await allowance(sender, caller);
    const amountBN = new BigNumber(amount);
    if(amountBN.isZero()) {
        throw new Error("Amount zero")
    }

    if(new BigNumber(allowed).isLessThan(amountBN)) {
        throw new Error("Transfer amount exceeds allowance");
    }

    const balance = new BigNumber(await balanceOf(sender));

    if(balance.isLessThan(amountBN)) {
        throw new Error("Transfer amount exceeds balance");
    }

    

}

async function transfer(receiver, amount) {
    if(amount == 0) {
        throw new Error("Transfer amount cant be zero")
    }
    // TODO RECEIVER VE SENDER ADRES KONTROLLERI
    const callerBalance = await balanceOf(caller); 
    if(callerBalance < amount) {
        throw new Error("Transfer amount exceeds balance")
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
    if(caller != await readStorage("owner")) {
        throw new Error("Only Owner")
    }
    const receiverBalance = await balanceOf(receiver);
    const receiverNewBalance = receiverBalance + amount;

    await writeStorage(mapping("balances", receiver), receiverNewBalance);
    return true;
}