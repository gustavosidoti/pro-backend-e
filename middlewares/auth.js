import token from '../services/token'

export default {
    verifyEcommerce: async(req, res, next) => {
        if(!req.headers.token){
            res.status(404).send({
                message: 'NO SE HA ENVIADO TOKEN'
            })
        }
        // SI HAY TOKEN
        const response = await token.decode(req.headers.token);
        if(response){ // la response debería contener un usuario con sus datos
            if(response.rol == 'cliente' || response.rol == "admin"){
                next();
            }else{
                res.status(404).send({
                    message: 'NO TIENE PERMISOS PARA VISITAR ESTA RUTA'
                })
            }
        }else{
            res.status(403).send({
                message: 'EL TOKEN NO ES VÁLIDO'
            })
        }
    },
    verifyAdmin: async(req, res, next) => {
        if(!req.headers.token){
            res.status(404).send({
                message: 'NO SE HA ENVIADO TOKEN'
            })
        }
        // SI HAY TOKEN
        const response = await token.decode(req.headers.token);
        if(response){ // la response debería contener un usuario con sus datos
            if(response.rol == "admin"){
                next();
            }else{
                res.status(404).send({
                    message: 'NO TIENE PERMISOS PARA VISITAR ESTA RUTA'
                })
            }
        }else{
            res.status(403).send({
                message: 'EL TOKEN NO ES VÁLIDO'
            })
        }
    }
}