import routerx from 'express-promise-router'
import cuponeController from '../controllers/CuponeController';
import auth from '../middlewares/auth';

const router = routerx();

router.post("/register",auth.verifyAdmin,cuponeController.register);
router.put("/update",auth.verifyAdmin,cuponeController.register);
router.get("/list",auth.verifyAdmin,cuponeController.register);
router.delete("/delete",auth.verifyAdmin,cuponeController.register);

export default router;