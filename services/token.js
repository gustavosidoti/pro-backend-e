import jwt from 'jsonwebtoken';
import models from '../models';

export default {
    encode: async(_id, rol, email)=> { // primer argumento payload, segundo la clave definida por nosotros
        const token = jwt.sign({_id: _id, rol: rol, email: email}, 'eccomerce_gus',{expiresIn: '1d'})
        return token;
    },

    decode: async(token)=> {
        try {
            const {_id} = await jwt.verify(token, 'eccomerce_gus');
            const user = models.User.findOne({_id: _id, state: 1});

            if(user){
                return user
            }else{
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    },
}