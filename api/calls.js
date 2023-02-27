import express from 'express';

const Router = express.Router();

Router.get('/', (req,res) => {
    res.send('404')
})

export default Router;