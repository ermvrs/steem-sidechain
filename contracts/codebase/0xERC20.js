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
    return balance;
}

async function allowance(owner, spender) {
    const allowed = await readStorage(mapping("allowances", owner, spender));
    return allowed;
}

// write methods

async function transfer(to, amount) {
    const owner = caller;

    await _transfer(owner, to, amount);
    return true;
}

async function approve(spender, amount) {
    const owner = caller;
    await _approve(owner, spender, amount);
    return true;
}

async function transferFrom(from, to, amount) {
    const spender = caller;

    await _spendAllowance(from, spender, amount);
    await _transfer(from, to, amount);
    return true;
}

async function increaseAllowance(spender, addedValue) {
    const owner = caller;
    const ownerAllowance = new BigNumber(await allowance(owner, spender));

    await _approve(owner, spender, ownerAllowance.plus(new BigNumber(addedValue)).toString());
    return true;
}

async function decreaseAllowance(spender, substractedValue) {
    const owner = caller;
    const ownerAllowance = new BigNumber(await allowance(owner, spender));
    if(ownerAllowance.isLessThan(new BigNumber(substractedValue))) {
        throw new Error("Decreased allowance below zero")
    }

    await _approve(owner, spender, ownerAllowance.minus(new BigNumber(substractedValue)).toString());
    return true;
}

// internal methods

async function _transfer(from, to, amount) {
    // TODO transfer
    if(typeof from !== 'string' || typeof to !== 'string' || from.length == 0 || to.length == 0) {
        throw new Error("Transfer from or to zero address");
    }
    const amountBN = new BigNumber(amount);
    const fromBalance = new BigNumber(await balanceOf(from));
    if(fromBalance.isLessThan(amountBN)) {
        throw new Error("Transfer amount exceeds balance");
    }

    const fromBalanceAfter = fromBalance.minus(amountBN);
    const toBalance = new BigNumber(await balanceOf(to));
    const toBalanceAfter = toBalance.plus(amountBN);

    await writeStorage(mapping("balances", from), fromBalanceAfter.toString())
    await writeStorage(mapping("balances", to), toBalanceAfter.toString())
}

async function _mint(account, amount) {
    if(typeof account !== 'string' || account.length == 0) {
        throw new Error("Mint to zero address");
    }
    const amountBN = new BigNumber(amount);
    const totalSupplyAfter = new BigNumber(await totalSupply()).plus(amountBN);

    const balanceAccount = new BigNumber(await balanceOf(account));
    const balanceAfter = balanceAccount.plus(amountBN);

    await writeStorage(mapping("balances", account), balanceAfter.toString());
    await writeStorage("totalSupply", totalSupplyAfter.toString());
}

async function _burn(account, amount) {
    if(typeof account !== 'string' || account.length == 0) {
        throw new Error("Mint to zero address");
    }

    const amountBN = new BigNumber(amount);
    const accountBalance = new BigNumber(await balanceOf(account));

    if(accountBalance.isLessThan(amountBN)) {
        throw new Error("Burn amount exceeds balance")
    }

    const balanceAfter = accountBalance.minus(amountBN);
    const totalSupplyAfter = new BigNumber(await totalSupply()).minus(amountBN);

    await writeStorage(mapping("balances", account), balanceAfter.toString());
    await writeStorage("totalSupply", totalSupplyAfter.toString());
}

async function _approve(owner, spender, amount) {
    if(typeof owner !== 'string' || typeof spender !== 'string' || owner.length == 0 || spender.length == 0) {
        throw new Error("Approve from or to zero address");
    }

    await writeStorage(mapping("allowances",owner, spender), new BigNumber(amount).toString());
}

async function _spendAllowance(owner, spender, amount) {
    const currentAllowance = new BigNumber(await readStorage(mapping("allowances",owner,spender)));
    const amountBN = new BigNumber(amount);
    if(currentAllowance.isLessThan(amountBN)) {
        throw new Error("insufficient allowance");
    }

    await _approve(owner, spender, currentAllowance.minus(amountBN).toString());
}

// owner methods
async function assertOnlyOwner() {
    const owner = await readStorage("owner");

    if(owner !== caller) {
        throw new Error("Only owner")
    }

    return;
}

async function mint(account, amount) {
    await assertOnlyOwner();

    await _mint(account, amount);

    return true;
}

async function transferOwnership(account) {
    await assertOnlyOwner();

    await writeStorage("owner", account);
    return true;
}
