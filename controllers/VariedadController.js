import models from '../models';

export default {

    register: async(req,res) =>{
        try {
            let data = req.body;

            //VALIDACION PARA AUMENTAR STOCK EN CASO DE REPETIR
            // buscamos
            let variedad_exist = await models.Variedad.findOne({valor: data.valor, product: data.product});
            var variedad = null;
            if(variedad_exist){
                // si existe sumamos stock al objeto
                data.stock = variedad_exist.stock + data.stock;
                // actualizamos la BD con el nuevo stock
                await models.Variedad.findByIdAndUpdate({_id: variedad_exist._id}, data)
                variedad = await models.Variedad.findById({_id: variedad_exist._id});
            }else{
                variedad = await models.Variedad.create(data);
            }


            res.status(200).json({
                variedad: variedad
            });

        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA"
            });
            console.log(error);
        }
    },
    update: async(req,res) =>{
        try {
            let data = req.body;

            // ACTUALIZO
            await models.Variedad.findByIdAndUpdate({_id:data._id},data);

            // LO TRAIGO DE LA BD ACTUALIZADO PARA MOSTRAR
            let variedad = await models.Variedad.findById({_id: data._id});

            res.status(200).json({
                variedad: variedad
            });
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA"
            });
            console.log(error);
        }
    },
    delete: async(req,res) =>{
        try {
            let _id = req.params.id;

            await models.Variedad.findByIdAndDelete({_id:_id});

            res.status(200).json({
                message: 'VARIEDAD ELIMINADA'
            });
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA"
            });
            console.log(error);
        }
    }
}