import routerx from "express-promise-router";
import User from "./User";

const router = routerx();
router.use('/users',User);

//router.use('products',Product)

export default router;
