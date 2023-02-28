// Kontratta kullanılacak native operasyon kodları
import { getContractCode } from '../contracts/code.js';

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
    
    console.log(contract_code);

}

// TODO

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