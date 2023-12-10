import models from '../models';
import resource from '../resources';

export default {
    list:async(req,res) => {
        try {
            let user_id = req.query.user_id;
            let CARTS = await models.Cart.find({
                user: user_id,
            }).populate("variedad").populate({ // populate anidado porque el modelo productos posee anidada las categorias
                path: "product",
                populate: {
                    path: "categorie"
                },
            });

            // desglosa los productos de cada item del carro para crear un array
            CARTS = CARTS.map((cart) => {
                return resource.Cart.cart_list(cart);
            });

            // brindamos la respuesta al cliente
            res.status(200).json({
                carts: CARTS,
            })

        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
            console.log(error);
        }
    },
    register:async(req,res) => {
        try {
            let data = req.body;
            //PRIMERO VAMOS A VALIDAR SI EL PRODUCTO EXISTE EN EL CARRITO DE COMPRA
            if(data.variedad){
                let valid_cart = await models.Cart.findOne({
                    user: data.user,
                    variedad: data.variedad,
                    product: data.product,
                });
                if(valid_cart){
                    res.status(200).json({
                        message: 403,
                        message_text: "EL PRODUCTO CON LA VARIEDAD YA EXISTE EN EL CARRITO DE COMPRA",
                    })
                    return;
                }
            }else{
                let valid_cart = await models.Cart.findOne({
                    user: data.user,
                    product: data.product,
                });
                if(valid_cart){
                    res.status(200).json({
                        message: 403,
                        message_text: "EL PRODUCTO YA EXISTE EN EL CARRITO DE COMPRA",
                    })
                    return;
                }
            }

            //SEGUNDO VAMOS A VALIDAR SI EL STOCK ESTA DISPONIBLE

            if(data.variedad){
                let valid_variedad = await models.Variedad.findOne({
                    id_: data.variedad,
                });
                if(valid_variedad.stock < data.cantidad){
                    res.status(200).json({
                        message: 403,
                        message_text: "EL STOCK NO ESTA DISPONIBLE"
                    })
                    return;
                }
            }else{
                let valid_product = await models.Product.findOne({
                    _id: data.product,
                });
                if(valid_product.stock < data.cantidad){
                    res.status(200).json({
                        message: 403,
                        message_text: "EL STOCK NO ESTA DISPONIBLE"
                    });
                    return;
                }
            }
            let CART = await models.Cart.create(data);
            
            let NEW_CART = await models.Cart.findById({_id: CART._id}).populate("variedad").populate({
                path: "product",
                populate: {
                    path: "categorie"
                },
            });
            res.status(200).json({
                cart: resource.Cart.cart_list(NEW_CART),
                message_text: "EL CARRITO SE REGISTRO CON EXITO",
            })
            
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
            console.log(error);
        }
    },
    update:async(req,res) => {
        try {
            let data = req.body;
            
            
            //1- VALIDAMOS SI EL STOCK ESTÁ DISPONIBLE
            if(data.variedad){
                let valid_variedad = await models.Variedad.findOne({
                    _id: data.variedad, 
                })
                if(valid_variedad.stock < data.cantidad){
                    res.status(200).json({
                        message: 403,
                        message_text: "EL STOCK NO ESTA DISPONIBLE"
                    })
                    return;
                }

            }else{
                // el producto sin variedad . solo unitario
                let valid_product = await models.Product.findOne({
                    
                    _id: data.product,
                });
                if(valid_product.stock < data.cantidad){
                    res.status(200).json({
                        message: 403,
                        message_text: "EL STOCK NO ESTA DISPONIBLE"
                    })
                    return;
                }
            }

            // 2 SE ACTUALIZA EL CARRITO DE COMPRA
            let CART = await models.Cart.findByIdAndUpdate({_id: data._id}, data);


            let NEW_CART = await models.Cart.findById({_id: CART._id}).populate("variedad").populate({ // populate anidado porque el modelo productos posee anidada las categorias
                path: "product",
                populate: {
                    path: "categorie"
                },
            });

            res.status(200).json({
                cart: resource.Cart.cart_list(NEW_CART),
                message_text: "EL CARRITO SE ACTUALIZO CORRECTAMENTE"
            })
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
            console.log(error);
        }
    },
    delete:async(req,res) => {
        try {
            let _id = req.params.id;
            let CART = await models.Cart.findByIdAndDelete({_id: _id});

            res.status(200).json({
                message_text: "EL CARRITO SE ELIMINO CORRECTAMENTE"
            })
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
            console.log(error);
        }
    },
    applyCupon:async(req,res) => {
        try {
            let data = req.body;
            // 1- LA PRIMERA VALIDACION TIENE QUE VER CON LA EXISTENCIA DEL CUPON
           
            let CUPON = await models.Cupone.findOne({
                code: data.code,
            })
            if(!CUPON){
                res.status(200).json({
                    message: 403,
                    message_text: "EL CUPON INGRESADO NO EXISTE, DIGITE OTRO NUEVAMENTE"
                })
                return;
            }

            // 2- TIENE QUE VER CON EL USO DEL CUPON

            // 3- LA PARTE OPERATIVA

            // 3.1 traemos el carro del usuario
            let carts = await models.Cart.find({user: data.user_id}).populate("product");

            // 3.2 iteramos los cupones para comprobar si hay productos coincidentes en el carro del usuario
            let products = [];
            let categories = [];

            CUPON.products.forEach((product) => {
                // metemos los id de cada producto que estan en los cupones dentro de un array
                products.push(product._id);
            });

            CUPON.categories.forEach((categorie) => {
                // metemos los id de cada categoria que estan en los cupones dentro de un array
                categories.push(categorie._id);
            });

            // iteramos cada elemento del carro
            for(const cart of carts){
                // preguntamos si hay coincidencias entre los productos de los cupones y los que tiene el usuario en su carro
                if(products.length > 0){
                    if(products.includes(cart.product._id+"")){
                        // si hay coincidencias le aplicamos el descuento
                        let subtotal = 0;
                        let total = 0;

                        if(CUPON.type_discount == 1){ // descuento por porcentaje
                            subtotal = cart.price_unitario - cart.price_unitario*(CUPON.discount*0.01);
                        }else{ // descuento por moneda
                            subtotal = cart.price_unitario - CUPON.discount;
                        }

                        total = subtotal * cart.cantidad;

                        // actualizamos el carro con los valores necesarios
                        await models.Cart.findByIdAndUpdate({_id: cart._id},{
                            subtotal: subtotal,
                            total: total,
                            type_discount: CUPON.type_discount,
                            discount: CUPON.discount,
                            code_cupon: CUPON.code,
                        });
                    }
                }
            
                if(categories.length > 0){
                    if(categories.includes(cart.product.categorie+"")){
                        // si hay coincidencias le aplicamos el descuento
                        let subtotal = 0;
                        let total = 0;

                        if(CUPON.type_discount == 1){ // descuento por porcentaje
                            subtotal = cart.price_unitario - cart.price_unitario*(CUPON.discount*0.01);
                        }else{ // descuento por moneda
                            subtotal = cart.price_unitario - CUPON.discount;
                        }

                        total = subtotal * cart.cantidad;

                        // actualizamos el carro con los valores necesarios
                        await models.Cart.findByIdAndUpdate({_id: cart._id},{
                            subtotal: subtotal,
                            total: total,
                            type_discount: CUPON.type_discount,
                            discount: CUPON.discount,
                            code_cupon: CUPON.code,
                        });
                    }
                }
            }
            // REALIZAMOS LA RESPUESTA
            res.status(200).json({
                message: 200,
                message_text: "EL CUPON SE HA APLICADO CORRECTAMENTE"
            });
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
            console.log(error);
        }
    }
}