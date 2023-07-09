import express from "express";
import dotenv from 'dotenv';
import Routes from './routes/routes.js'


dotenv.config();
const app = express();
app.use(express.json());




app.use('/api',Routes);





const port = process.env.PORT


app.listen(port,()=>{
    console.log('server runing: http://localhost:5000');
})

