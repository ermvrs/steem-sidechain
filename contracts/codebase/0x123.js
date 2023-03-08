function viewMethod(a,b) {
    return {caller, x : a + b};
}

async function writeMethod(a,b) {
    console(`Calling : ${a} ${b}`)
    if(a+b > 20) {
        throw new Error(`Too high : ${a} ${b}`); // revert örneği
    }

    await writeStorage("value", a + b);
    try {
        await writeStorage("bvalue");
    } catch(ex) {
        throw new Error(ex)
    }
        
    return true;
}