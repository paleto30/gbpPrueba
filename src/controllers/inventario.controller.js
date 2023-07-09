import Joi from "joi";
import getConnection from "../config.js";
import funciones from "../utils/funciones.js";




const insertarInventario = async(req, res)=>{

   
    const validator = Joi.object({
        id_bodega: Joi.number().integer().required(),
        id_producto: Joi.number().integer().required(),
        cantidad: Joi.number().integer().required()
    });

    const {error, value} = validator.validate(req.body);
    if (error) {
        res.status(400).json({error: error.details[0].message})
        return
    }

    try {
        const conn = await getConnection();
        const query = `SELECT * FROM inventarios WHERE id_bodega =  ? AND  id_producto = ?`
        const inventario = await conn.query(query,[value.id_bodega,value.id_producto])

        if (inventario[0]) {
            let old_cantidad = inventario[0].cantidad
            let new_cantidad = old_cantidad + value.cantidad
            const query2 = `UPDATE inventarios SET cantidad = ? WHERE id = ?`
            await conn.query(query2,[new_cantidad,inventario[0].id])
            const inventarioU = await funciones.findById("inventarios",inventario[0].id)
            return res.json({
                message : "actualizado correctamente",
                data : {
                    id: inventarioU.id,
                    id_bodega: inventarioU.id_bodega,
                    id_producto:  inventarioU.id_producto,
                    cantidad: inventarioU.cantidad
                }
            });
        }else{

            const bodega = await funciones.findById('bodegas',value.id_bodega)
            if (!bodega) {
                res.status(400).json({error: `bodega id:${value.id_bodega} inexistente`})
                return;
            }
            const producto = await funciones.findById('productos',value.id_producto)
            if (!producto) {
                res.status(400).json({error: `producto id:${value.id_producto} inexistente`})
                return;
            }

            const queryI = `INSERT INTO inventarios SET ?`  
            const newInventario = await conn.query(queryI,value);

            return res.status(201).json({
                message: "guardado correctamente",
                data_insert: newInventario.insertId
            })
        }
    } catch (error) {
        res.status(400).send(error.message);
    }

}














const httpMethods = {
    insertarInventario
}



export default httpMethods;