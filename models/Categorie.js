import mongoose, {Schema} from "mongoose";

const CategorySchema = new Schema({
    title: {type: String, maxlength:250, required:true},
    imagen: {type: String, maxlength:250, required:true},
    state: {type: Number, maxlength:2, default:1},
    
},
{
    timestamps: true
});

const Categorie = mongoose.model("categorie",CategorySchema);
export default Categorie;