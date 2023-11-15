import models from "../models";

export default {
    register:async(req,res) => {
        try {
            const address_client = await models.AddressClient.create(req.body);
            res.status(200).json({
                message: "LA DIRECCION DEL CLIENTE SE HA REGISTRADO CORRECTAMENTE",
                address_client: address_client,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
        }
    },
    update:async(req,res) => {
        try {
            let address_client = await models.AddressClient.findOne({_id: req.body._id});

            
            res.status(200).json({
                message: "LA DIRECCION DEL CLIENTE SE HA MODIFICADO CORRECTAMENTE",
                address_client: address_client,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
        }
    },
    list:async(req,res) => {
        try {
            
            let address_client = await models.AddressClient.find({user: req.query.user_id}).sort({'createdAt': -1});

            res.status(200).json({
                address_client: address_client
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
        }
    },
    delete:async(req,res) => {
        try {
            await models.AddressClient.findByIdAndDelete({_id: req.params._id});
            res.status(200).json({
                message: "LA DIRECCION DEL CLIENTE SE ELIMINÓ CORRECTAMENTE",
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: "OCURRIO UN ERROR",
            });
        }
    },
}