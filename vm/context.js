// Burada kontrat çağrıları için gerekecek context oluşturulur.
import { getStorage } from '../chaindb/read.js';

export const createContractCallContext = async function(contract_address) {
    const storage = await getStorage(contract_address);

    console.log(storage)
}