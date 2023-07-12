import express from "express";
import cors from 'cors';
import path from 'path';
import mongoose from "mongoose";
import router from './router';

// CONEXION A LA BASE DE DATOS

// Conexion a la BD

const conectar = async() => {
  try {
    await mongoose.connect("mongodb+srv://coderhouse:coderhouse@coderhouse.qltnizo.mongodb.net/ecommerce_pro");
    console.log('DB online');

  } catch (error) {
    console.log(`Fallo la conexión a la BD ${error}`);
  }

   
}

conectar();


const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname,'public')))
app.use('/api',router)

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), () => {
    console.log("EL SERVIDOR ESTÁ ESCUCHANDO EN EL PUERTO 3000");
})