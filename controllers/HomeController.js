import models from '../models';
import resource from '../resources';

export default {
    list: async(req,res) => {
        try {
            let Sliders = await models.Slider.find({state:1});

            Sliders = Sliders.map((slider) => {
                return resource.Slider.slider_list(slider);
            })

            let Categories = await models.Categorie.find({state:1});
            Categories = Categories.map((categorie) => {
                return resource.Categorie.category_list(categorie);
            })

            res.status(200).json({
                sliders: Sliders,
                categories: Categories,
            });

        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN ERROR"
            });
            console.log(error);
        }
    },
}