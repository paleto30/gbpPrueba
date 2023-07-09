import { config } from "dotenv";    
import  mysql  from "promise-mysql";

config();


const connection = mysql.createConnection({
    host: process.env.HOSTNAME,
    database: process.env.DBNAME,
    user: process.env.NAMEUSER,
    password: process.env.PASSWORD
})  


const getConnection = () => {
    return connection;
}


export default getConnection;