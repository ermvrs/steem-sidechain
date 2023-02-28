// Read queries for chain data
import { getDB } from "./database.js"

export const getContract = async (address) => {
    return new Promise((resolve,reject) => {
        const db = getDB();

        let q = "SELECT * FROM main.contracts WHERE address = ?";
        db.all(q,[address],(err,res) => {
            if(err) reject(err);
            resolve(res)
        })
    })
}

export const getStorage = async (contract_address) => {
    return new Promise((resolve,reject) => {
        // contract_address kayıtlı tüm storageı döndürür.
        const db = getDB();

        let q = "SELECT slot_id, value FROM main.storages WHERE contract_address = ?";

        db.all(q,[contract_address],(err,res) => {
            if(err) reject(err);
            resolve(res);
        })
    })
}