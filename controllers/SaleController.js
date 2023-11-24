import models from "../models";

export default {
    register: async(req,res) => {
        try {
            let sale_data = req.body.sale;
            let sale_address_data = req.body.sale_address;

            // 1 SE CREA Y GUARDA LA VENTA
            let SALE = await models.Sale.create(sale_data);

            // 2 SE CREA Y GUARDA LA DIRECCIÓN DEL CLIENTE
            sale_address_data.sale = SALE._id;

            let SALE_ADDRESS = await models.SaleAddress.create(sale_address_data);

            // 3 SE TRAE LOS PRODUCTOS DEL CARRO PARA CREAR Y GUARDAR EL DETALLE DE LA VENTA
            
            let CARTS = await models.Cart.find({user: SALE.user})

            // 3.1 se recorre cada producto para actualizar el inventario
            for (const CART of CARTS) {
                // se toma el id de la venta en cada iteracion
                CART.sale = SALE._id;

                if(CART.variedad){//MULTIPLE INVENTARIO
                    let VARIEDAD = await models.Variedad.findById({_id: CART.variedad}); // buscamos el producto con ese id
                    let new_stock = VARIEDAD.stock - CART.cantidad; // le restamos las unidades segun el carro

                    // actualizamos en BD el stock de cada producto
                    await models.Variedad.findByIdAndUpdate({_id: CART.variedad},{
                        stock:new_stock,
                    })
                }else{ // INVENTARIO UNITARIO

                    let PRODUCT = await models.Product.findById({_id: CART.product}); // buscamos el producto con ese id
                    let new_stock = PRODUCT.stock - CART.cantidad; // le restamos las unidades según el carro

                    // actualizamos en BD el stock de cada producto
                    await models.Product.findByIdAndUpdate({_id: CART.product},{
                        stock:new_stock,
                    });
                }

                // FINALIZAMOS CON EL GUARDADO DE CADA PRODUCTO EN BD DE DETALLE DE LA VENTA
                await models.SaleDetail.create(CART)
            }

            // 4 DEVOLVEMOS AL CLIENTE EL MENSAJE DE EXITO
            res.status(200).json({
                messaje: "LA ORDEN SE GENERÓ CORRECTAMENTE"
            })
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: "HUBO UN ERROR",
            })
        }
    }
}