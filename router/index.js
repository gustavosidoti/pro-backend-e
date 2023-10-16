import routerx from "express-promise-router";
import User from "./User";
import Categorie from './Categorie';
import Product from './Product';
import Slider from './Slider';
import Cupone from './Cupone';

const router = routerx();
router.use('/users',User);
router.use('/categories',Categorie);
router.use('/products',Product);
router.use('/slider',Slider);
router.use('/cupones',Cupone)

export default router;
