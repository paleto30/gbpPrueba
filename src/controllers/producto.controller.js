import getConnection from "../config.js";
import Joi from "joi";
import funciones from "../utils/funciones.js";

/*---------------------------------------------------------------------
    listar todos los productos en orden descendente por el campo total
*///-------------------------------------------------------------------

const listarProductos = async(req,res)=>{
    try {
        const conn = await getConnection();
        const query = `
            SELECT id , nombre, descripcion, estado, created_by,
            (SELECT CAST(IFNULL(SUM(cantidad),0) AS DOUBLE) FROM inventarios WHERE id_producto = productos.id ) as Total
            FROM productos
            ORDER BY Total DESC
        `
        const result = await conn.query(query);
        return res.json(result);
    } catch (error) {
        res.status(500).send(error.message)
    }
}


/*---------------------------------------------------------------------
    Insertar un producto y una cantidad
*///-------------------------------------------------------------------

const insertarProducto = async (req,res)=>{

    const conn = await getConnection();
    const validator = Joi.object({
        nombre: Joi.string().max(255).required(),
        descripcion: Joi.string().max(255),
        estado: Joi.number().valid(1,0).required(),
        created_by:  Joi.number().integer().required()
    })
    const {error, value} = validator.validate(req.body);
    if (error) {
        res.status(400).json({error: error.details[0].message});
        return;
    }      
    const creator = await funciones.findById("users",value.created_by); 
    if (!creator) {
        res.json({error:"el valor del campo created_by (usuario) no existe en la base de datos"})
        return;
    }

    try {
        // bodega random
        const bodega = await funciones.findOneRandom("bodegas");
        const cantidad = Math.floor(Math.random() * (1000 - 100 + 1) + 11) 
        // inicio de la transaccion
        await conn.beginTransaction();
        const queryProducto = "INSERT INTO productos SET ?"
        const queryInventario = "INSERT INTO inventarios SET ?"
        const productoI = await conn.query(queryProducto,value);

        if (productoI.insertId) {
            let inventario = {
                id_bodega : bodega.id,
                id_producto: productoI.insertId,
                cantidad: cantidad
            }
            const inventarioI = await conn.query(queryInventario, inventario);
            // commit de la transaccion si todo salio bien
            await conn.commit();
    
            res.json({
                message: "guardado correctamente",
                data_insert:{
                    id_producto: productoI.insertId,
                    id_bodega: bodega.id,
                    id_inventario: inventarioI.insertId
                }
            })
        }
    } catch (error) {
        await conn.rollback(); // rollback de la transaccion si existio algun error
        res.status(500).send(error.message);
    }
}






const httpMethods = {
    listarProductos,
    insertarProducto
} 



export default httpMethods;