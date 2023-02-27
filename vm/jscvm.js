// JSCVM -> Javascript Smart Contract Virtual Machine
import vm from 'node:vm';
import { promises as fs } from "fs";

export const testVM = async () => {

    var context = { x : 5, y : 30 };

    vm.createContext(context);

    const script = await fs.readFile('./vm/examples/smart_contract_1.js')

    vm.runInContext(script, context);

    console.log(context.add(3,4))
}