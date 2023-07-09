import { Router } from "express";
import bodegaController from "../controllers/bodega.controller.js";
import productoController from "../controllers/producto.controller.js"
import inventarioController from "../controllers/inventario.controller.js";
const router = Router();



/*---------------------------------------------------------------
 |     rutas para gestionar las bodegas
 |---------------------------------------------------------------
 |  en esta seccion se van a declarar todas las rutas que van
 |  relacionadas con el controlador de las bodegas
 |
*/ 
//  ruta para listar las bodegas
router.get('/bodegas/',bodegaController.obtenerBodegas);

//  ruta para crear una bodega 
router.post("/bodegas/",bodegaController.insertarBodega);







/*---------------------------------------------------------------
 |     rutas para gestionar los productos                       |
 |---------------------------------------------------------------
 |  en esta seccion se van a declarar todas las rutas que van   
 |  relacionadas con el controlador de los productos
 |
*/ 
// ruta para listar los productos
router.get('/productos/',productoController.listarProductos);
// ruta para insertar un producto
router.post('/productos/',productoController.insertarProducto);






/*---------------------------------------------------------------
 |     rutas para gestionar los inventarios
 |---------------------------------------------------------------
 |  en esta seccion se van a declarar todas las rutas que van
 |  relacionadas con el controlador de los productos
 |
*/
// ruta para hacer un registro a la tabla inventarios
router.post('/inventario/', inventarioController.insertarInventario);





export default router;