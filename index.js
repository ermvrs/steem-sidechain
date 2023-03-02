import { Initialize } from "./api/server.js";
import dotenv from 'dotenv';
import { testVM } from "./vm/jscvm.js";
import { initDatabase } from './chaindb/database.js';
import { CallContract } from "./vm/operations.js";


dotenv.config();

initDatabase();
Initialize();

//testVM();
// burası örnek testler için bir kontrat çağrısının başladığı yer

const sample_call = {
    contract_address : "0x123123123123", caller : "MSG.SENDER",
    value : "1.000 STEEM", gasLimit : "1.000 STEEM",
    payload : {
        method : "add",
        params : [3, 5]
    }
};

// Call başlamadan önce snapshot alınmalı.
const result = await CallContract("0xERC20", {
    value : "2.000 STEEM",
    gasLimit : "1.000 STEEM",
    caller : "msg.sender",
    payload : {
        method : "transfer",
        params : ["inven.cu02", 100]
    }
});

console.log(result)