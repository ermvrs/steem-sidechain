function add(a,b) {
    return a + b;
}

async function reader(id) {
    const value = await readStorage(id)

    return value[0];
}

async function writer(id, value) {
    // updates contract storage

    await writeStorage(id, value);

    return true;
}