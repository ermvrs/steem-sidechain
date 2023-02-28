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
const result = await CallContract("0x123123123123", {
    value : "2.000 STEEM",
    gasLimit : "1.000 STEEM",
    payload : {
        method : "KONTRAT_FONKSIYON_ISMI",
        params : ["PARAM1", "PARAM2", 3]
    }
});

console.log(result)