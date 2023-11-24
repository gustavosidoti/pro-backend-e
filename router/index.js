import routerx from "express-promise-router";
import User from "./User";
import Categorie from './Categorie';
import Product from './Product';
import Slider from './Slider';
import Cupone from './Cupone';
import Discount from './Discount';
import Home from './Home';
import Cart from './Cart';
import AddressClient from "./AddressClient";
import Sale from "./Sale";

const router = routerx();
router.use('/users',User);
router.use('/categories',Categorie);
router.use('/products',Product);
router.use('/slider',Slider);
router.use('/cupones',Cupone);
router.use('/discount',Discount);
// E-commerce
router.use('/home',Home);
router.use('/cart',Cart);
router.use('/address_client',AddressClient);
router.use('/sale',Sale);
             

export default router;
