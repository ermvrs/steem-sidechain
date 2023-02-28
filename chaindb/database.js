import sqlite3 from 'sqlite3'

let db;

export const initDatabase = () => {
    db = new sqlite3.Database('./chaindb/storage.db',sqlite3.OPEN_READWRITE, (err) => { // db pathi app.js e göre al
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the chinook database.');
    })
}

export const getDB = () => {
    return db;
}