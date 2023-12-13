import models from '../models';
import resource from '../resources';
import bcrypt from 'bcryptjs';

export default {
    list: async(req,res) => {
        try {

            var TIME_NOW  = req.query.TIME_NOW;

            let Sliders = await models.Slider.find({state:1});

            Sliders = Sliders.map((slider) => {
                return resource.Slider.slider_list(slider);
            })

            // carga las categorias del home
            let Categories = await models.Categorie.find({state:1});
            Categories = Categories.map((categorie) => {
                return resource.Categorie.category_list(categorie);
            })

            let CampaingDiscount = await models.Discount.findOne({
                type_campaign: 1,
                start_date_num: {$lte: TIME_NOW},// start_date_num >= TIME_NOW
                end_date_num: {$gte: TIME_NOW},// <=
            });

            // carga los más vendidos
            let BestProducts = await models.Product.find({state: 2}).sort({"createdAt": -1});
            var ObjectBestProducts = [];
            for (const Product of BestProducts) {
                let VARIEDADES = await models.Variedad.find({product: Product._id});
                
                //traemos el promedio de reviews para un producto
                let REVIEWS = await models.Variedad.find({product: Product._id});
                let AVG_REVIEW = REVIEWS.length > 0 ? Math.ceil(REVIEWS.reduce((sum,item) => sum + item.cantidad,0)/REVIEWS.length) : 0;
                let COUNT_REVIEW = REVIEWS.length;

                // Determinamos si hay campaña de descuentos

                let DISCOUNT_EXIST = null;
                if(CampaingDiscount){
                    if(CampaingDiscount.type_segment == 1){ // por producto
                        let products_a = [];
                        CampaingDiscount.products.forEach( item => {
                            products_a.push(item._id);
                        })
                       if (CampaingDiscount.products.includes(Product._id+"")){
                            DISCOUNT_EXIST = CampaingDiscount;
                       }
                    }else{ // por categoria
                        let categories_a = [];
                        CampaingDiscount.categories.forEach( item => {
                            categories_a.push(item._id);
                        })

                        if (CampaingDiscount.categories.includes(Product.categorie+"")){
                            DISCOUNT_EXIST = CampaingDiscount;

                        }

                    }
                }

                // armamos el objeto con los paramétros que hemos ido buscando
                ObjectBestProducts.push(resource.Product.product_list(Product,VARIEDADES, AVG_REVIEW, COUNT_REVIEW, DISCOUNT_EXIST));
            }

            let OursProducts = await models.Product.find({state: 2}).sort({"createdAt": 1});

            var ObjectOursProducts = [];
            for (const Product of OursProducts) {
                let VARIEDADES = await models.Variedad.find({product: Product._id});
                //traemos el promedio de reviews para un producto
                let REVIEWS = await models.Variedad.find({product: Product._id});
                let AVG_REVIEW = REVIEWS.length > 0 ? Math.ceil(REVIEWS.reduce((sum,item) => sum + item.cantidad,0)/REVIEWS.length) : 0;
                let COUNT_REVIEW = REVIEWS.length;

                // Determinamos si hay campaña de descuentos

                let DISCOUNT_EXIST = null;
                if(CampaingDiscount){
                    if(CampaingDiscount.type_segment == 1){ // por producto
                        let products_a = [];
                        CampaingDiscount.products.forEach( item => {
                            products_a.push(item._id);
                        })
                       if (CampaingDiscount.products.includes(Product._id+"")){
                            DISCOUNT_EXIST = CampaingDiscount;
                       }
                    }else{ // por categoria
                        let categories_a = [];
                        CampaingDiscount.categories.forEach( item => {
                            categories_a.push(item._id);
                        })

                        if (CampaingDiscount.categories.includes(Product.categorie+"")){
                            DISCOUNT_EXIST = CampaingDiscount;

                        }

                    }
                }

                ObjectOursProducts.push(resource.Product.product_list(Product,VARIEDADES, AVG_REVIEW,COUNT_REVIEW, DISCOUNT_EXIST));
            }
            // OursProducts = OursProducts.map(async (product) => {
            //     let VARIEDADES = await models.Variedad.find({product: product._id});
            //     return resource.Product.product_list(product,VARIEDADES);
            // })

            let FlashSale = await models.Discount.findOne({
                type_campaign: 2,
                start_date_num: {$lte: TIME_NOW},// start_date_num >= TIME_NOW
                end_date_num: {$gte: TIME_NOW},// <=
            });

            let ProductList = [];
            if(FlashSale){ // validamos por si no hay campaña, devuelve null, lo salteamos

                for (const product of FlashSale.products) {
                    var ObjecT = await models.Product.findById({_id: product._id});
                    let VARIEDADES = await models.Variedad.find({product: product._id});
                    ProductList.push(resource.Product.product_list(ObjecT,VARIEDADES));
                }
            }
           
            res.status(200).json({
                sliders: Sliders,
                categories: Categories,
                best_products: ObjectBestProducts,
                our_products: ObjectOursProducts,
                FlashSale: FlashSale,
                campaing_products: ProductList,
            });

        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR"
            });
            console.log(error);
        }
    },
    show_landing_product: async(req,res) => {
        try {
            let SLUG = req.params.slug;
            let DISCOUNT_ID = req.query._id;

            let Product = await models.Product.findOne({slug: SLUG, state: 2});

            let VARIEDADES = await models.Variedad.find({product: Product._id})

            //traemos el promedio de reviews para un producto
            let REVIEWS = await models.Variedad.find({product: Product._id}).populate("user");
            let AVG_REVIEW = REVIEWS.length > 0 ? Math.ceil(REVIEWS.reduce((sum,item) => sum + item.cantidad,0)/REVIEWS.length) : 0;
            let COUNT_REVIEW = REVIEWS.length;
            

            // productos relacionados
            let relatedProducts = await models.Product.find({categorie: Product.categorie, state: 2})
            var ObjectRelatedProducts = [];
            for (const Product of relatedProducts) {
                let VARIEDADES = await models.Variedad.find({product: Product._id});
                ObjectRelatedProducts.push(resource.Product.product_list(Product,VARIEDADES));
            }

            // traer el descuento de ese producto
            let SALE_FLASH = null;
            if(DISCOUNT_ID){
                SALE_FLASH = await models.Discount.findById({_id: DISCOUNT_ID})
            }

            // respuesta del servidor
            res.status(200).json({
                product: resource.Product.product_list(Product,VARIEDADES),
                related_products: ObjectRelatedProducts,
                SALE_FLASH: SALE_FLASH,
                REVIEWS: REVIEWS,
                AVG_REVIEW: AVG_REVIEW,
                COUNT_REVIEW: COUNT_REVIEW
            })

        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR"
            });
            console.log(error);
        }
    },
    profile_client:async(req,res) => {
        try {

            let user_id = req.body.user_id;

            let Orders = await models.Sale.find({user: user_id});

            let sale_orders = [];

            for (const order of Orders) {
                // obtenemos el detalle de esa orden // hacemos un populate anidado
                let detail_orders = await models.SaleDetail.find({sale: order._id}).populate({
                    path: "product",
                    populate: {
                        path: "categorie"
                    },
                }).populate("variedad");    
                // obtenemos la direccion de cada compra
                let sale_address = await models.SaleAddress.find({sale: order._id});
                // creamos un array de cada item de cada orden vacio
                let collection_detail_orders = [];

                // iteramos cada item de cada orden
                for (const detail_order of detail_orders){

                    //review del producto
                    let reviewS = await models.Review.findOne({sale_detail: detail_order._id});
                    // llenamos el array de detalle de cada orden con los datos de ese item
                    collection_detail_orders.push({
                        _id: detail_order._id,
                        product: {
                            _id: detail_order.product._id,
                            title: detail_order.product.title,
                            sku: detail_order.product.sku,
                            slug: detail_order.product.slug,
                            imagen: 'http://localhost:3000'+'/api/products/uploads/products/'+detail_order.product.portada,//*
                            categorie: detail_order.product.categorie,
                            priceEuro: detail_order.product.priceEuro,
                            priceUSD: detail_order.product.priceUSD,
                        },
                        type_discount: detail_order.type_discount,
                        discount: detail_order.discount,
                        cantidad: detail_order.cantidad,
                        variedad: detail_order.variedad,
                        code_cupon: detail_order.code_cupon,
                        code_discount: detail_order.code_discount,
                        price_unitario: detail_order.price_unitario,
                        subtotal: detail_order.subtotal,
                        total: detail_order.total,
                        review: reviewS,
                    })
                }
                // llenamos el array de cada orden
                sale_orders.push({
                    sale: order,
                    sale_details: collection_detail_orders,
                    sale_address: sale_address,
                })
            }

            // traemos también las direcciones del cliente 
            let ADDRESS_CLIENT = await models.AddressClient.find({user: user_id}).sort({'createdAt': -1});

            res.status(200).json({
                sale_orders: sale_orders,
                address_client: ADDRESS_CLIENT,
            })

        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR"
            });
            console.log(error);
        }
    },
    // SECCION DATOS DEL CLIENTE
    update_client:async(req,resp) =>{
        try {
            // para los campos relacionados con archivos
            if(req.files){
                var img_path = req.files.avatar.path;
                var name = img_path.split('\\');
                var avatar_name = name[2];
                
            }
            // validamos la contraseña
            if(req.body.password){
                req.body.password = await bcrypt.hash(req.body.password, 10);
            }

            // actualizo en bd
            await models.User.findByIdAndUpdate({_id: req.body._id}, req.body);

            let User = await models.User.findOne(({_id: req.body._id}));


            res.status(200).json({
                message: "SE GUARDO CORRECTAMENTE",
                user:{
                    name:User.name,
                    surname:User.surname,
                    email:User.email,
                    _id:User._id,
                }
            });
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR"
            });
            console.log(error);
        }
    }

}