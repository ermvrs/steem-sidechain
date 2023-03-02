// Write queries for chain data
import { getDB } from "./database.js"

export const writeStorageSlot = async (contract_address, slot_id, value) => {
    return new Promise((resolve,reject) => {
        const db = getDB();

        let q = "SELECT * FROM main.storages WHERE contract_address = ? AND slot_id = ?";

        db.all(q, [contract_address, slot_id], (er,re) => {
            if(er) reject(er);
            if(re.length == 0) {
                let qi = "INSERT INTO main.storages (contract_address, slot_id, value) VALUES (?,?,?)"

                db.run(qi, [contract_address, slot_id, value], (err,res) => {
                    if(err) reject(err);
                    resolve(res)
                })
            } else {
                let qu = "UPDATE main.storages SET value = ? WHERE contract_address = ? AND slot_id = ?"

                db.run(qu, [value, contract_address, slot_id], (err,res) => {
                    if(err) reject(err);
                    resolve(res)
                })
            }
        })
    })
}

export const rollbackSlot = async (contract_address, slot_id, value) => {
    return new Promise((resolve,reject) => {
        const db = getDB();

        let q = "UPDATE main.storages SET value = ? WHERE contract_address = ? AND slot_id = ?";

        db.run(q,[value, contract_address, slot_id], (err,res) => {
            if(err) reject(err);
            resolve(res)
        })
    })
}