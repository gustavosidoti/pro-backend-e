import routerx from 'express-promise-router'
import addressClientController from '../controllers/AddressClientController'
import auth from '../middlewares/auth'


const router = routerx();
// http://localhost:3000/api/address_client/register

router.post("/register",auth.verifyAdmin,addressClientController.register);
router.put("/update",auth.verifyAdmin,addressClientController.update);
router.get("/list",auth.verifyAdmin,addressClientController.list);
router.delete("/delete/:id",auth.verifyAdmin,addressClientController.delete);


export default router;