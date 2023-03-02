function viewMethod(a,b) {
    return {caller, x : a + b};
}

async function writeMethod(a,b) {
    if(a+b > 20) {
        throw new Error("TOO High"); // revert örneği
    }
    await writeStorage("value", a + b);
    return true;
}