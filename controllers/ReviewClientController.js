import models from "../models";

export default {
    register: async(req,res) => {
        try {
            let review = await models.Review.create(req.body);

            res.status(200).json({
                message: "LA RESEÑA HA SIDO REGISTRADA CORRECTAMENTE",
                review: review
            })
        } catch (error) {
            res.status(500).send({
                message: "COURRIO UN PROBLEMA"
            });
        }
    },
    update: async(req,res) => {
        try {
            await models.Review.findByIdAndUpdate({_id: req.body._id},req.body);

            let reviewD = await models.Review.findById({_id: req.body._id});

            res.status(200).json({
                message: "LA RESEÑA HA SIDO MODIFICADA CORRECTAMENTE",
                review: reviewD
            })
        } catch (error) {
            res.status(500).send({
                message: "COURRIO UN PROBLEMA"
            });
        }
    },
}