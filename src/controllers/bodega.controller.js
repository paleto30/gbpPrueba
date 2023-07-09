import Joi from "joi";
import getConnection from "../config.js"



const obtenerBodegas = async (req,res)=>{
    try {
        const conn = await getConnection();
        const bodegas = await conn.query(`SELECT id, nombre, id_responsable, estado, created_by  FROM bodegas ORDER BY nombre ASC`);  
        res.json(bodegas)
    } catch (error) {
        res.status(500).send(error.message)
    }
}


/*
    funcion para obtener un usuario por id
*/
const findByIdUtils = async (id) =>{
    try {
        const conn = await getConnection();
        const user = await conn.query(`SELECT * FROM users WHERE id = ?`,[id]);
        return user[0];
    } catch (error) {
        res.status(500).send(error.message)
    } 
}


/** @params req
{   
  "nombre": "A Bodega prueba",
  "id_responsable": 11,
  "estado": 1,
  "created_by": 12
}
 */
const insertarBodega = async(req, res)=>{
    try {
        const conn = await getConnection();// connection
        //validator
        const validator = Joi.object({
            nombre: Joi.string().required().max(255),
            id_responsable: Joi.number().required(),
            estado: Joi.number().valid(0,1).required(),
            created_by: Joi.number().integer()
        })
        // data-validation  
        const {error, value} = validator.validate(req.body);
        if (error) {
            res.status(400).json({error: error.details[0].message});
            return;
        }
        const user = await findByIdUtils(value.id_responsable);
        if (user === undefined) {
            res.status(400).json({message:'id_responsable inexistente'})
            return
        }
        if (value.created_by) {
            const creator = await findByIdUtils(value.created_by)
            if (creator === undefined) {
                res.status(400).json({message:'created_by inexistente'})
                return                  
            }
        }   
        const bodegaInsertada = await conn.query(`INSERT INTO bodegas SET ?`, req.body ) 
        res.json({message: "guardado correctamente",id_bodega_insert: bodegaInsertada.insertId});
    } catch (error) {
        res.status(500).send(error.message)
    }
}





/*---------------------------------------------------------------
 |     metodos para gestionar las bodegas
 |---------------------------------------------------------------
 |  en esta seccion se van a exportar todas las fuinciones que 
 |  permiten acciones sobre la tabla de  bodegas
*/ 
const httpMethods = {
    obtenerBodegas,
    insertarBodega
} 

export default httpMethods;