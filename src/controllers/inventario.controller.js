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



/**
 * Funcion para trasladar un producto de una bodega a otra
 */
const trasladarProducto = async(req,res)=>{
    const validator = Joi.object({
        id_producto : Joi.number().integer().required(),
        id_b_origen : Joi.number().integer().required(),
        id_b_destino : Joi.number().integer().required(),
        cantidad : Joi.number().integer().required(),
    })
    const {error ,value} = validator.validate(req.body);
    if (error) {
        res.status(400).json(error.details[0].message);
        return;
    }

    try {
        const producto_exist = await funciones.findById('productos',value.id_producto);
        if (!producto_exist) {
            res.status(400).json({error: `producto id:${value.id_producto} inexistente`});
            return;
        }
        const b_origen = await funciones.findById('bodegas',value.id_b_origen);
        if (!b_origen) {
            res.status(400).json({error: `bodega_origen id:${value.id_b_origen} inexistente`});
            return;
        }
        const b_destino = await funciones.findById('bodegas',value.id_b_destino);
        if (!b_destino) {
            res.status(400).json({error: `bodega_destino id:${value.id_b_destino} inexistente`});
            return;
        }

        const conn = await getConnection();
        const result =  await conn.query(`
            SELECT * FROM inventarios
            INNER JOIN productos on inventarios.id_producto = productos.id
            INNER JOIN bodegas on inventarios.id_bodega = bodegas.id
            WHERE inventarios.id_producto = ?
            AND inventarios.id_bodega = ?;
        `,[value.id_producto, value.id_b_origen]);

        if (!result[0]) {
            res.json({message:`la bodega #${value.id_b_origen} no posee el producto con id:${value.id_producto}`});
        }

        if (result[0].cantidad < value.cantidad) {
            return res.status(400).json({message:`esa cantidad (${value.cantidad}) de producto ${value.id_producto} no esta disponible en la bodega ${value.id_b_origen}`}) 
        }
        
        const bodega_destino = await conn.query(`
            SELECT * FROM inventarios
            INNER JOIN productos on inventarios.id_producto = productos.id
            INNER JOIN bodegas on inventarios.id_bodega = bodegas.id
            WHERE inventarios.id_bodega = ?
            AND inventarios.id_producto = ?
        `,[value.id_b_destino, value.id_producto]); 

        let stock_b_origen = result[0].cantidad - value.cantidad 
        if (!bodega_destino[0]) {
            let data ={
                id_bodega: value.id_b_destino,
                id_producto: value.id_producto,
                cantidad: value.cantidad
            }
            await conn.beginTransaction();
            await conn.query(`
                UPDATE inventarios SET cantidad = ? WHERE id_bodega = ? AND id_producto = ?
            `,[stock_b_origen,value.id_b_origen, value.id_producto]);

            const queryI = `INSERT INTO inventarios SET ?` 
            const newInventario = await conn.query(queryI,data);
            if (newInventario.insertId) {
                const newHistorial = await conn.query(`
                    INSERT INTO historiales SET ? 
                `,{cantidad:value.cantidad,id_bodega_origen:value.id_b_origen, id_bodega_destino:value.id_b_destino, id_inventario:newInventario.insertId}) ;
                await conn.commit();
                if (newHistorial.insertId) {
                    return res.json({
                        message: `traslado exitoso del producto`,
                        data_historiales: newHistorial.insertId,
                        cantidad: value.cantidad
                    })
                }
                await conn.rollback();
                return res.status(400).json({message: "Algo a salido mal, no se realizo la operacion"});
            }   
        }
        
        await conn.beginTransaction();

        let cantidad_b_d = bodega_destino[0].cantidad + value.cantidad;
        const inventarioOrigen = await conn.query(`UPDATE inventarios SET cantidad = ? WHERE id_bodega = ? AND id_producto = ?`,[stock_b_origen,value.id_b_origen,value.id_producto]);
        const inventarioDestino = await conn.query(`UPDATE inventarios SET cantidad = ? WHERE id_bodega = ? AND id_producto = ?`,[cantidad_b_d,value.id_b_destino,value.id_producto]);
        const newHistorial = await conn.query(`INSERT INTO historiales SET ? `,{cantidad:value.cantidad,id_bodega_origen:value.id_b_origen,id_bodega_destino:value.id_b_destino,id_inventario: result[0].id});
        await conn.commit();
        if (!newHistorial.insertId){
            await conn.rollback();
            return res.status(400).json({message: "Algo a salido mal, no se realizo la operacion"});
        } 

        res.json({
            message: `traslado exitoso del producto`,
            data_historiales: newHistorial.insertId,
            cantidad:  value.cantidad,
        });

    } catch (error) {
        res.status(500).send(error.message);
    }
    
    
};











const httpMethods = {
    insertarInventario,
    trasladarProducto
}



export default httpMethods;