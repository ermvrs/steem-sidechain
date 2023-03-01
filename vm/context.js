// Burada kontrat çağrıları için gerekecek context oluşturulur.
import { getStorage } from '../chaindb/read.js';
import vm from 'node:vm';

export const createContractCallContext = async function(contract_address, ctx) {

    const context = vm.createContext(ctx);

    return context;
}