import models from "../models";

export default {
    register: async(req,res) =>{
        // ACA HAY OPERADORES PROPIOS DE MONGO PARA HACER VALIDACIONES Y TRAER COSAS
        try {
            let data = req.body;
            //product_s = ["id","id"]
            //categorie_s = igual
            var filter_a = [];
            var filter_b = [];
            if(data.type_segment == 1){
                filter_a.push({
                    "products": {$elemMath: {_id: {$in: data.product_s}}}
                });

                filter_b.push({
                    "products": {$elemMath: {_id: {$in: data.product_s}}}
                });
           
            }else{
                filter_a.push({
                    "categories": {$elemMath: {_id: {$in: data.categorie_s}}}
                });

                filter_b.push({
                    "categories": {$elemMath: {_id: {$in: data.categorie_s}}}
                });
            }

            // validacion de coincidencias de fechas de campañas
            // esto es porque se pasa a números las fechas para operar mejor las validaciones
            // a es para fecha de inicio
            filter_a.push({
                start_date_num: {$gte: data.start_date_num, $lte: data.end_date_num}
            })

            // b es para fecha de fin
            filter_b.push({
                start_date_num: {$gte: data.start_date_num, $lte: data.end_date_num}
            })

            let exist_start_date = await models.Discount.find({$and: filter_a})

            let exist_end_date = await models.Discount.find({$and: filter_b})
            
            // si una de las fechas está comprometida sale este error
            if(exist_start_date || exist_end_date ){
                res.status(200).json({
                    message: 403,
                    message_text: "EL DESCUENTO NO SE PUEDE PROGRAMAR, ELIMINAR ALGUNA OPCION"
                })
                return;
            }
            
            let discount = await models.Discount.create(data);
            res.status(200).json({
                message: 200,
                message_text: "EL DESCUENTO SE REGISTRO CORRECTAMENTE",
                discount: discount
            });

        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            })
        }
    },
    update: async(req,res) =>{
        try {

            let data = req.body;
            //product_s = ["id","id"]
            //categorie_s = igual
            var filter_a = [];
            var filter_b = [];
            if(data.type_segment == 1){
                filter_a.push({
                    "products": {$elemMath: {_id: {$in: data.product_s}}}
                });

                filter_b.push({
                    "products": {$elemMath: {_id: {$in: data.product_s}}}
                });
           
            }else{
                filter_a.push({
                    "categories": {$elemMath: {_id: {$in: data.categorie_s}}}
                });

                filter_b.push({
                    "categories": {$elemMath: {_id: {$in: data.categorie_s}}}
                });
            }

            // validacion de coincidencias de fechas de campañas
            // esto es porque se pasa a números las fechas para operar mejor las validaciones
            // a es para fecha de inicio - ne es para que sea diferente el id a guardar
            filter_a.push({
                _id: {$ne: data._id},
                start_date_num: {$gte: data.start_date_num, $lte: data.end_date_num}
            })

            // b es para fecha de fin - ne es para que sea diferente ese id
            filter_b.push({
                _id: {$ne: data._id},
                start_date_num: {$gte: data.start_date_num, $lte: data.end_date_num}
            })

            let exist_start_date = await models.Discount.find({$and: filter_a})

            let exist_end_date = await models.Discount.find({$and: filter_b})
            
            // si una de las fechas está comprometida sale este error
            if(exist_start_date || exist_end_date ){
                res.status(200).json({
                    message: 403,
                    message_text: "EL DESCUENTO NO SE PUEDE PROGRAMAR, ELIMINAR ALGUNA OPCION"
                })
                return;
            }
            
            let discount = await models.Discount.findByIdAndUpdate({_id: data._id},data);
            res.status(200).json({
                message: 200,
                message_text: "EL DESCUENTO SE REGISTRO CORRECTAMENTE",
                discount: discount
            });
            
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            })
        }
    },
    delete: async(req,res) =>{
        try {
            let _id = req.query._id
            
            await models.Discount.findByIdAndDelete({_id: _id});
            res.status(200).json({
                message: 200,
                message_text: "EL DESCUENTO SE ELIMINO CORRECTAMENTE"
            });

        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            })
        }
    },
    list: async(req,res) =>{
        try {

            //let search = req.query.search
                
            let discounts = await models.Cupone.find().sort({'createdAt': -1});

            res.status(200).json({
                message: 200,
                discounts: discounts
            });
            
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            })
        }
    },
    show: async(req,res) =>{
        try {

            let discount_id = req.query.cupone_id
                
            let discount = await models.Discount.findOne({_id: discount_id })
                
            res.status(200).json({
                message: 200,
                discount: discount
            });
            
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            })
        }
    },
    config: async(req,res)=> {
        try {

           let Products = await models.Product.find({state:2});
           let Categories = await models.Categorie.find({state:1});

            res.status(200).json({
                message: 200,
                products: Products,
                categories: Categories
            });
            
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            })
        }
    },
}