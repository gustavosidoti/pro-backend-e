import routerx from 'express-promise-router'
import SaleController from '../controllers/SaleController'
import auth from '../middlewares/auth'


const router = routerx();
// http://localhost:3000/api/address_client/register

router.post("/register",auth.verifyEcommerce,SaleController.register);



export default router;