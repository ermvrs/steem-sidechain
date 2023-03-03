// Kontratta kullanılacak native operasyon kodları
import { getContractCode } from '../contracts/code.js';
import { getStorageSlot } from '../chaindb/read.js';
import { writeStorageSlot } from '../chaindb/write.js';
import { createContractCallContext } from './context.js';
import { createBreakpointObject, insertChange, getChanges, rollbackChanges, clearBreakpoint, createCheckpoint, addChange, getChanges2} from './snapshot.js';
import { createRoot, addChild, addChangeToChild, rollBackChilds } from './calltree.js';
import vm from 'node:vm';
import keccak256 from 'keccak256';

// RESULT REVERT ise data string, SUCCESS ise data obje
function callReturn(result, data) {
    return {
        result, data
    }
}

export const CallContract = async function(contract_address, calldata) {
    // Kontrat çağrısı başlangıç yeri
    // const tree = createRoot();
    createCheckpoint();
    const result = await CallCode(contract_address, calldata);
    //await rollBackChilds(tree)
    console.log(getChanges2());
    return result;
}
// TODO
// REVERT VEYA THROW BİR KERE ÇAĞRILDIMI TÜM TRANSACTION IPTAL EDILMELI

export const CallCode = async function(contract_address, calldata) {
    // external call metodu
    // aynı zamanda normal transactionlarında giriş kısmı
    // burada contract_Address storage ı kullanılır. Delegate calldan ayrı bir şekilde
    console.log("Call code start")
    const contract_code = await getContractCode(contract_address);
    if(!contract_code) {
        return callReturn("REVERT", "CONTRACT_CODE_NOT_FOUND")
    }

    // KONTRATTAKİ FONKSİYONLARIN KONTROLU YAPILAMAZ ÇÜNKÜ BURASI COMPILED BI RUNNER DEĞİL
    // 1 Kontrat kodunu çek
    // 2 Call için context oluştur.

    var ctx = calldata;

    try {
        ctx.readStorage = async (slot) => await readStorage(contract_address, slot); // delegate call da contract address parametresi değişmeli
        ctx.writeStorage = async (slot, value) => await writeStorage(contract_address, slot, value);
        ctx.externalCall = async (external_contract_address, method_name, params, gasLimit, value) => await externalCall(contract_address, external_contract_address, method_name, params, gasLimit, value);
        ctx.mapping = (...params) => map(...params)
        // ctx.revert = (reason) => await revert(reason, )
        // eğer revert edildiyse execution burada durmalı
        const context = await createContractCallContext(contract_address, ctx);
        vm.runInContext(contract_code, context);

        if(!context.hasOwnProperty(calldata.payload.method)) {
            return callReturn("REVERT", "METHOD_NOT_FOUND")
        }

        const result = await context[calldata.payload.method](...calldata.payload.params);
        return callReturn("SUCCESS", result
        )

    } catch (ex) {
        return callReturn("REVERT", ex.message)
    }
}

// TODO

async function readStorage(contract_address, key) {
    const value = await getStorageSlot(contract_address, key);
    return value["value"];
}

async function writeStorage(contract_address, slot_id, value) {
    // TODO önemli. Revert işlemler dbyi güncellememeli.
    return new Promise(async (resolve,reject) => {
        try { // TRY CATCH TEST EDILMELI VE REVERTE DÖNMELİ
            const initialValue = await readStorage(contract_address, slot_id);
            await writeStorageSlot(contract_address, slot_id, value);
            //insertChange(contract_address, { slot_id, from : initialValue, to: value }); // deprecate
            addChange({
                contract_address, slot_id, from: initialValue, to : value
            });
            // addChangeToChild(tree, {contract_address : contract_address,  slot_id, from : initialValue, to: value })
            resolve()
        } catch (ex) {
            console.error(`Error at writeStorage : ${ex.message}`);
            reject(ex.message);
        }

    })

}

async function externalCall(caller, contract_address, method_name, params, gasLimit, value = '0.000 STEEM') {
    // external caller için snapshot-revert burada yapılmalı
    //createBreakpointObject(contract_address); // deprecate
    // const tree = addChild(parent);
    const callResult = await CallCode(contract_address, {
        caller, gasLimit, value, 
            payload : {
                method : method_name,
                params
            }
    });
    if(callResult.result === 'REVERT') {
        // rollback
        console.log('Rolling back changes')
        //await rollbackChanges(contract_address);
        //await rollBackChilds(tree);
    }
    //clearBreakpoint(contract_address);
    console.log(callResult)

    return callResult;
}

function map(...params) {
    return keccak256(params.reduce((total, current) => total + current)).toString('hex')
}

async function revert() {
    // Kontrat içerisinden çağrılan revert metodu.
    //  Revert edilirse database güncellenmemeli.
    // Bu global revert metodu olarak kullanılmalı. Bu çağrıldığında tüm transaction iptal edilir.
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