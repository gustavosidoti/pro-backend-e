import bcrypt from 'bcryptjs';
import models from '../models';
import token from '../services/token.js';
import resource from '../resources';

export default {
    register: async(req, res) => {
        try {
           
            req.body.password = await bcrypt.hash(req.body.password, 10);
            const user = await models.User.create(req.body);
            res.status(200).json(user);

        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA"
            });
            console.log(error);
        }
    },

    registerAdmin: async(req, res) => {
        try {
            const userV = await models.User.findOne({email: req.body.email});
            if(userV){
                res.status(400).send({
                    message: "EL USUARIO YA EXISTE"
                });
            }

            req.body.rol = "admin";
            req.body.password = await bcrypt.hash(req.body.password, 10);
            let user = await models.User.create(req.body);
            res.status(200).json({
                // PARSEO LA INFORMACIÓN CON DTO ANTES DE ENVIARLA AL CLIENTE
                user: resource.User.user_list(user)
            });

        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA"
            });
            console.log(error);
        }
    },

    login: async(req, res) => {
        try {
            const user = await models.User.findOne({email: req.body.email,state: 1});
            if(user){
                //SI ESTÁ REGISTRADO EN EL SISTEMA COMPARO CONTRASEÑAS
                let compare = await bcrypt.compare(req.body.password, user.password);
                if(compare){

                    let tokenT = await token.encode(user._id, user.rol, user.email)

                    const USER_FRONTEND = {
                        token: tokenT,
                        user: {
                            _id: user._id,
                            name: user.name,
                            email: user.email,
                            surname: user.surname,
                            avatar: user.avatar
                        }
                    }

                    res.status(200).json({
                        USER_FRONTEND: USER_FRONTEND
                    });

                }else{
                    res.status(400).send({
                        message: "LA CONTRASEÑA ES INCORECTA"
                    });
                }
            }else{
                res.status(400).send({
                    message: "EL USUARIO NO EXISTE"
                });
            }
            
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA"
            });
            console.log(error);
        }
    },

    loginAdmin: async(req, res) => {
        try {
            const user = await models.User.findOne({email: req.body.email,state: 1,rol:"admin"});
            if(user){
                //SI ESTÁ REGISTRADO EN EL SISTEMA COMPARO CONTRASEÑAS
                let compare = await bcrypt.compare(req.body.password, user.password);
                if(compare){

                    let tokenT = await token.encode(user._id, user.rol, user.email)

                    const USER_FRONTEND = {
                        token: tokenT,
                        user: {
                            name: user.name,
                            email: user.email,
                            surname: user.surname,
                            avatar: user.avatar,
                            rol: user.rol
                        }
                    }

                    res.status(200).json({
                        USER_FRONTEND: USER_FRONTEND
                    });

                }else{
                    res.status(400).send({
                        message: "LA CONTRASEÑA ES INCORECTA"
                    });
                }
            }else{
                res.status(400).send({
                    message: "EL USUARIO NO EXISTE"
                });
            }
            
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA"
            });
            console.log(error);
        }
    },

    update: async(req, res) => {
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

            // llamo al usuario en bd
            let userT = await models.User.findOne({_id: req.body._id});


            res.status(200).json({
                message: "EL USUARIO SE HA MODIFICADO CORRECTAMENTE",
                user: resource.User.user_list(userT)
            });
            
        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA"
            });
            console.log(error);
        }
    },

    list: async(req, res) => {
        try {
            let search = req.query.search;
            let users = await models.User.find({
                $or:[
                    {"name": new RegExp(search, "i")},
                    {"surname": new RegExp(search, "i")},
                    {"email": new RegExp(search, "i")},
                ]
            }).sort({'createdAt': -1})

            // MAPEO LOS DATOS QUE LE QUIERO PASAR AL FRONTEND DTO
            users = users.map((user) =>{
                return resource.User.user_list(user);
            })

            res.status(200).json({
                users: users
            })

        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA"
            });
            console.log(error);
        }
    },

    remove: async(req, res) => {
        try {
            
            const users = await models.User.findByIdAndDelete({_id: req.query._id})
            res.status(200).json({
                message: "EL USUARIO SE ELIMINÓ CORRECTAMENTE"
            })

        } catch (error) {
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA"
            });
            console.log(error);
        }
    }
}