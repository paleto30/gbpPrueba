import getConnection from "../config.js";



// funcion para encontrar un registro de una tabla por id
// recibe dos parametros el nombre tabla: (string)
// y recibe el id (int) 
const findById = async (tablaName,id) =>{
    try {
        const conn = await getConnection();
        const query = `SELECT * FROM ${tablaName} WHERE id = ${id}`;
        const result = await conn.query(query);
        return result[0];
    } catch (error) {
        res.status(500).send(error.message)
    }
}

/*
    funcion para encontrar un registro random de  una tabla X
    recibe como paramatro nameTable (string) -> el nombre de la tabla 
*/
const findOneRandom = async (nameTable) =>{
    try {
        const conn = await getConnection();
        const query = `SELECT * FROM ${nameTable} ORDER BY RAND() LIMIT 1`
        const result = await conn.query(query)
        return result[0]
    } catch (error) {
        res.status(500).send(error.message)
    }
}





// exportamos las funciones
const funciones = {
    findById,
    findOneRandom
}


export default funciones