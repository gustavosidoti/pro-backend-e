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
            //1- VALIDAMOS SI EL PRODUCTO EXISTE EN EL CARRRITO DE COMPRAS
            if(data.variedad){
                let valid_cart = await models.Cart.findOne({
                    user: data.user,
                    variedad: data.variedad,
                    product: data.product,
                })
            
                if(valid_cart){
                    res.status(200).json({
                        message: 403,
                        message_text: "EL PRODUCTO CON LA VARIEDAD YA EXISTE EN EL CARRITO DE COMPRA"
                    })
                    return;
                }
            }else{
                // el producto sin variedad . solo unitario
                let valid_cart = await models.Cart.findOne({
                    user: data.user,
                    product: data.product,
                });
                if(valid_cart){
                    res.status(200).json({
                        message: 403,
                        message_text: "EL PRODUCTO YA EXISTE EN EL CARRITO DE COMPRA"
                    })
                    return;
                }
            }
            
            //2- VALIDAMOS SI EL STOCK ESTÁ DISPONIBLE
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

            // 3 SE REGISTRA EL CARRITO DE COMPRA
            let CART = await models.Cart.create(data);

            let NEW_CART = await models.Cart.findById({_id: CART._id}).populate("variedad").populate({ // populate anidado porque el modelo productos posee anidada las categorias
                path: "product",
                populate: {
                    path: "categorie"
                },
            });


            res.status(200).json({
                cart: resource.Cart.cart_list(NEW_CART),
                message_text: "EL PRODUCTO SE AGREGO AL CARRITO"
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
}