import { rollbackSlot } from "../chaindb/write.js";

const Snapshots = new Map();

// TODO ÖNEMLİ
// REVERT YAPISI GÜNCELLENMELİ
// CALLER -> 1. CALL -> 2.CALL (SUCCESS) -> 3. CALL (REVERT) gibi karışık isteklerde ilk call revert ise her şey revert edilmeli
// callar ağaç gibi görülmeli parent call revert ise ondan sonrakilerde revert edilmeli. 

export const createBreakpointObject = function (contract_address) {
    // snapshot için başlangıç breakpointi
    if(!Snapshots.has(contract_address)) {
        Snapshots.set(contract_address, []);
    }
    return;

}

export const insertChange = function (contract_address, change) {
    // Başlangıç metodunda createBreakpoint yapılmıyor. Eğer bu başlangıç çağrısı ise else devam etmeli.
    // changeler ordered şeklinde olmalı
    if(Snapshots.has(contract_address)) {
        const current = Snapshots.get(contract_address);
        console.log(current)
        Snapshots.set(contract_address, [...current, change]);
        return;
    } else {
        createBreakpointObject(contract_address);
        insertChange(contract_address,change)
    }

}

export const getChanges = function (contract_address) {
    return Snapshots.get(contract_address);
}

export const rollbackChanges = async function(contract_address) {
    const changes = Snapshots.get(contract_address);
    const reversed = changes.reverse(); // rollback son değişimden ilk değişime doğru gitmeli.

    for (const change of reversed) {
        await rollbackSlot(contract_address, change.slot_id, change.from);
    }

    return;
}

export const clearBreakpoint = function (contract_address) {
    return Snapshots.delete(contract_address);
}

export const clearAllBreakpoints = function() {
    return Snapshots.clear();
}

// GLOBAL REVERT
let checkpoint;

export const createCheckpoint = function() {
    checkpoint = [];
}

export const addChange = function (change) {
    checkpoint.push(change);
}

export const clearCheckpoint = function() {
    checkpoint = [];
}

export const getChanges2 = function() {
    return checkpoint;
}

export const rollbackCheckpoint = async function() {
    const changes = checkpoint.reverse();

    for (const change of changes) {
        await rollbackSlot(change.contract_address, change.slot_id, change.from);
    }

    checkpoint = [];
}