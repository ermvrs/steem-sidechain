// Kontratta kullanılacak native operasyon kodları
import { getContractCode } from '../contracts/code.js';
import { getStorageSlot } from '../chaindb/read.js';
import { writeStorageSlot } from '../chaindb/write.js';
import { createContractCallContext } from './context.js';
import vm from 'node:vm';

// RESULT REVERT ise data string, SUCCESS ise data obje
function callReturn(result, data) {
    return {
        result, data
    }
}

export const CallContract = async function(contract_address, calldata) {
    // external call metodu
    // aynı zamanda normal transactionlarında giriş kısmı
    // burada contract_Address storage ı kullanılır. Delegate calldan ayrı bir şekilde
    console.log("Call contract start")
    const contract_code = await getContractCode(contract_address);

    if(!contract_code) {
        return callReturn("REVERT", "CONTRACT_CODE_NOT_FOUND")
    }

    // KONTRATTAKİ FONKSİYONLARIN KONTROLU YAPILAMAZ ÇÜNKÜ BURASI COMPILED BI RUNNER DEĞİL
    // 1 Kontrat kodunu çek
    // 2 Call için context oluştur.

    var ctx = calldata;


    ctx.readStorage = async (slot) => await readStorage(contract_address, slot);
    ctx.writeStorage = async (slot, value) => await writeStorage(contract_address, slot, value);

    
    const context = await createContractCallContext(contract_address, ctx);

    try {
        vm.runInContext(contract_code, context);
        console.log(context)

        if(!context.hasOwnProperty(calldata.payload.method)) {
            return callReturn("REVERT", "METHOD_NOT_FOUND")
        }

        const result = await context[calldata.payload.method](...calldata.payload.params);
        return callReturn("SUCCESS", {
            return : result
        })

    } catch (ex) {
        console.error(`Error on call : ${ex.message}`)
    }
}

// TODO

async function readStorage(contract_address, key) {
    const value = await getStorageSlot(contract_address, key);

    return value;
}

async function writeStorage(contract_address, slot_id, value) {
    await writeStorageSlot(contract_address, slot_id, value);
}

// storage read/ write buradan başlamalı
// başka kontrat çağrıları buradan yapılmalı
// başka kontrat oluşturma kodu burada çalıştırılmalı

// NOT : buradaki metotlar kontratların içine context olarak gönderilecek opcodelar

/*
    external_call : Başka bir kontrattaki metodu çağırır
    delegate_call : MVP de bulunmayacak ancak başka bir kontrattaki kodu mevcut kontratın contextiyle çağıracak
    read_storage  : Mevcut contextteki ve slot_id parametre alınarak storagedeki değeri döndürür.
    write_storage : Storage a slot id ve value şeklinde veriyi yazacak
*/