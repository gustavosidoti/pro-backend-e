import routerx from 'express-promise-router';
import productController from '../controllers/ProductController';
import variedadController from '../controllers/VariedadController';
import auth from '../middlewares/auth';

import multiparty from 'connect-multiparty';
let path = multiparty({uploadDir: './uploads/products'})
const router = routerx();

//http://localhost:3000/api/products

router.post("/register", [auth.verifyAdmin,path], productController.register);

router.post("/register_imagen", [auth.verifyAdmin,path], productController.register_imagen);
router.post("/remove_imagen", [auth.verifyAdmin,path], productController.remove_imagen);

router.put("/update", [auth.verifyAdmin,path], productController.update);
router.get("/list", [auth.verifyAdmin,path], productController.list);
router.delete("/delete", [auth.verifyAdmin,path], productController.remove);

router.get("/uploads/products/:img", productController.obtener_imagen);
router.get("/show/:id", productController.show);

// VARIEDAD

router.post("/register-variedad", [auth.verifyAdmin,path], variedadController.register);
router.put("/update-variedad", [auth.verifyAdmin,path], variedadController.update);
router.delete("/delete-variedad/:id", [auth.verifyAdmin,path], variedadController.delete);




export default router;