import { Router } from "express";
import bodegaController from "../controllers/bodega.controller.js";
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






export default router;