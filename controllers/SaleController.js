import models from "../models";
import fs from 'fs';
import handlebars from 'handlebars';
import ejs from 'ejs';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';


async function send_email(sale_id) {
    try {
        var readHTMLFile = function(path, callback) {
            fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
                if (err) {
                    throw err;
                    callback(err);
                }
                else {
                    callback(null, html);
                }
            });
        };

        // ACA OBTENEMOS LOS DATOS DEL CLIENTE PARA ENVIARLE EL CORREO

        

        let Order = await models.Sale.findById({_id: sale_id}).populate("user");

        

        let OrderDetail = await models.SaleDetail.find({sale: Order._id}).populate("product").populate("variedad");

        let AddressSale = await models.SaleAddress.findOne({sale: Order._id});

        var transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
            user: 'gustavosidoti@gmail.com',
            pass: 'tpxmkzakjuuduhxo'
            }
        }));

        readHTMLFile(process.cwd() + '/mails/email_sale.html', (err, html)=>{
            
            // ACA LE PASAMOS LOS OBJETOS CARGADOS AL DOM de la plantilla de correo para armar el email

            let rest_html = ejs.render(html, {order: Order, address_sale: AddressSale, order_detail: OrderDetail});
    
            var template = handlebars.compile(rest_html);
            var htmlToSend = template({op:true});
    
            var mailOptions = {
                from: 'gustavosidoti@gmail.com',
                to: Order.user.email,
                subject: 'Finaliza tu compra ' + Order._id,
                html: htmlToSend
            };
          
            transporter.sendMail(mailOptions, function(error, info){
                if (!error) {
                    console.log('Email sent: ' + info.response);
                }
            });
        
        });
        /*
        res.status(200).json({
            message: "EL CORREO SE ENVIO CORRECTAMENTE",

        });*/

    } catch (error) {
        console.log(error);
       /* res.status(500).send({
            message: "OCURRIO UN ERROR"
        });*/
    }
    


}



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
            for (let CART of CARTS) {

                // Por tratarse de un array de objetos debemos pasar cada elemento a un objeto
                CART = CART.toObject();

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
                // ELIMINAMOS EL CARRO
                await models.Cart.findByIdAndDelete({_id: CART._id})
                
            }

            // 4 LLAMAMOS A LA FUNCION QUE ENVIA EL MAIL AL CLIENTE
               
                await send_email(SALE._id);
            // 5 DEVOLVEMOS AL CLIENTE EL MENSAJE DE EXITO
            res.status(200).json({
                messaje: "LA ORDEN SE GENERÓ CORRECTAMENTE"
            })
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: "HUBO UN ERROR",
            })
        }
    },

}