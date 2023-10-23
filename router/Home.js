import routerx from 'express-promise-router'
import homeController from '../controllers/HomeController';


const router = routerx();

router.get("/list",homeController.list);


export default router;