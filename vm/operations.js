// Kontratta kullanılacak native operasyon kodları
import { getContractCode } from '../contracts/code.js';
import { getStorageSlot } from '../chaindb/read.js';
import { writeStorageSlot } from '../chaindb/write.js';
import { createContractCallContext } from './context.js';
import { WRITE_SLOT_LENGTH_LIMIT, WRITE_SLOT_ALLOWED_DATA_TYPES } from './rules.js';
import { createBreakpointObject, insertChange, getChanges, rollbackChanges, rollbackCheckpoint, createCheckpoint, addChange, getChanges2} from './snapshot.js';
import vm from 'node:vm';
import keccak256 from 'keccak256';
import BigNumber from 'bignumber.js';

// RESULT REVERT ise data string, SUCCESS ise data obje
function callReturn(result, data) {
    return {
        result, data
    }
}

let revertReason;

export const CallContract = async function(contract_address, calldata) {
    // Kontrat çağrısı başlangıç yeri
    createCheckpoint();
    revertReason = {
        status : false,
        reason : ""
    };
    const result = await CallCode(contract_address, calldata);
    if(result.result === "REVERT") {
        revertReason = {
            status : true,
            reason : result.data,
            contract_address
        }
    }
    console.log(getChanges2());

    if(revertReason.status) {
        console.log('Reverting all changes')
        await rollbackCheckpoint()
        return callReturn("REVERT", {reason : revertReason.reason, contract : revertReason.contract_address})
    }

    revertReason = null;
    return result;
}

export const CallCode = async function(contract_address, calldata) {
    // external call metodu
    // aynı zamanda normal transactionlarında giriş kısmı
    // burada contract_Address storage ı kullanılır. Delegate calldan ayrı bir şekilde

    // TODO EĞER REVERT OLDUYSA EXTERNAL CALLAR DEVAM ETMESİN BURADAN BİTSİN
    console.log("Call code start")
    const contract_code = await getContractCode(contract_address);
    if(!contract_code) {
        return callReturn("REVERT", "CONTRACT_CODE_NOT_FOUND")
    }

    if(revertReason.status) {
        return callReturn("REVERT", revertReason.reason) // eğer revert edildiyse bir sonraki external callar buradan return olmalı.
    }

    if(calldata.payload.method.slice(0,1) === "_") {
        return callReturn("REVERT", "CALLING_INTERNAL_METHOD")
    }

    var ctx = calldata;

    try {
        ctx.readStorage = async (slot) => await readStorage(contract_address, slot); // delegate call da contract address parametresi değişmeli
        ctx.writeStorage = async (slot, value) => await writeStorage(contract_address, slot, value);
        ctx.externalCall = async (external_contract_address, method_name, params, gasLimit, value) => await externalCall(contract_address, external_contract_address, method_name, params, gasLimit, value);
        ctx.mapping = (...params) => map(...params)
        ctx.console = (text) => console.log(text) // TESTLERDEN SONRA KALDIRILMALI
        ctx.log = async (text) =>  await log(text) // Ethereumdaki event emit, revert olsada eventler kayıt edilir
        ctx.BigNumber = BigNumber; // Bignumber, safe math için, NOT : DB YAZDIRIRKEN HEP STRING DONDURULMELI
        
        const context = await createContractCallContext(contract_address, ctx);
        vm.runInContext(contract_code, context);

        if(!context.hasOwnProperty(calldata.payload.method)) {
            return callReturn("REVERT", "METHOD_NOT_FOUND")
        }

        const result = await context[calldata.payload.method](...calldata.payload.params);
        return callReturn("SUCCESS", result)

    } catch (ex) {
        return callReturn("REVERT", ex.message)
    }
}
async function readStorage(contract_address, key) {
    const value = await getStorageSlot(contract_address, key);
    return value["value"];
}

async function writeStorage(contract_address, slot_id, value = 0) {
    // TODO önemli. Revert işlemler dbyi güncellememeli.
    return new Promise(async (resolve,reject) => {
        try { // TRY CATCH TEST EDILMELI VE REVERTE DÖNMELİ
            if(WRITE_SLOT_ALLOWED_DATA_TYPES.indexOf(typeof value) == -1) {
                reject("STORAGE_WRITE_DATA_TYPE_VIOLATION")
            }
            if(value && value.length > WRITE_SLOT_LENGTH_LIMIT) { // value array gelirse bypass oluyor mu?
                reject("STORAGE_WRITE_LIMIT_VIOLATION")
            }
            const initialValue = await readStorage(contract_address, slot_id);
            await writeStorageSlot(contract_address, slot_id, value);

            addChange({
                contract_address, slot_id, from: initialValue, to : value
            });

            resolve()
        } catch (ex) {
            console.error(`Error at writeStorage : ${ex.message}`);
            reject(ex.message);
        }

    })

}

async function externalCall(caller, contract_address, method_name, params, gasLimit, value = '0.000 STEEM') {
    // external caller için snapshot-revert burada yapılmalı
    const callResult = await CallCode(contract_address, {
        caller, gasLimit, value, 
            payload : {
                method : method_name,
                params
            }
    });
    if(callResult.result === 'REVERT') {
        revertReason = {
            status: true,
            reason : callResult.data,
            contract_address
        }
    }
    //clearBreakpoint(contract_address);
    console.log(callResult)

    return callResult;
}

function map(...params) {
    return keccak256(params.reduce((total, current) => total + current)).toString('hex')
}

async function log() {

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