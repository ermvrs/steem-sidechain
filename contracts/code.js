import { promises as fs } from "fs";

export const getContractCode = async (contract_address) => {
    try {
        const code = await fs.readFile(`${process.env.CONTRACTS_BASE || "./contracts/"}/${contract_address}.js`, 'utf-8')

        return code;
    } catch (ex) {
        return;
    }
}

// Buraya ekstra olarak tüm kontrat kodlarının syncleneceği bir yapı yazılmalı