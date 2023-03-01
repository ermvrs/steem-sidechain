// JSCVM -> Javascript Smart Contract Virtual Machine
import vm from 'node:vm';
import { promises as fs } from "fs";
import { createContractCallContext } from './context.js';

export const testVM = async () => {

    var context = { x : 5, y : 30, external_call : (code) => console.log(`external call code : ${code}`)};
    await createContractCallContext("0x123123123123")
    vm.createContext(context);

    const script = await fs.readFile('./vm/examples/smart_contract_1.js', 'utf-8')

    vm.runInContext(script, context);

    console.log(context.add(3,4))
}


export const callCodeWithContext = async (code, context) => {
    // VM in çalışacağı contexti oluşturur
    // contextte kontratın storagei olması gerekiyor
    // ayrıca native çağrılabilir metotlarda contextin içerisinde olmalı
    // return olarak değişmiş context döndürülmeli.
    try {
        vm.createContext(context);

        // Kontrat kodları nerede saklanacak ?
    } catch (ex) {
        console.error(ex)
    }

}