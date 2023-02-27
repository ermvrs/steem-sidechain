import express from 'express';
import Router from './calls.js';

export const Initialize = function() {
    const app = express();

    app.use(Router);

    app.listen(process.env.API_PORT || 3000, () => {
        console.log(`API Server started`)
    });
}