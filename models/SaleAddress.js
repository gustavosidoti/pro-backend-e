import mongoose, {Schema} from "mongoose";

const SaleAddressSchema = new Schema({
    user: {type: Schema.ObjectId, ref:'user', required:true},
    name: {type: String, maxlength:250, required:true},
    surname: {type: String, maxlength:250, required:true},
    pais: {type: String, maxlength:250, required:true},
    address: {type: String, maxlength:250, required:true},
    referencia: {type: String, maxlength:250, required:false},
    ciudad: {type: String, maxlength:250, required:true},
    region: {type: String, maxlength:250, required:true},
    telefono: {type: String, maxlength:250, required:true},
    email: {type: String, maxlength:250, required:true},
    nota: {type: String, maxlength:250, required:false},
    
},
{
    timestamps: true
});

const SaleAddress = mongoose.model("sale_address",SaleAddressSchema);
export default SaleAddress;