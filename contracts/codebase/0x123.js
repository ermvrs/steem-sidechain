function viewMethod(a,b) {
    return {caller, x : a + b};
}

async function writeMethod(a,b) {
    console(`Calling : ${a} ${b}`)
    if(a+b > 20) {
        throw new Error(`Too high : ${a} ${b}`); // revert örneği
    }

    await writeStorage("value", a + b);
    await writeStorage("bvalue", a + b + 4);
    // const response = await externalCall("0x123123123123", "response", [a+3, b+3], "1.000 STEEM", "0.000 STEEM")
    // response içerisinde result ve data döner
    return true;
}