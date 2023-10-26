export default {
    product_list: (product, variedades = []) => {
       /* var IMAGEN_TWO = "";
        let GALERIAS = product.galerias.map((galeria) => {
            galeria.imagen = 'http://localhost:3000'+'/api/products/uploads/products/'+galeria.imagen;//*
            return galeria;
        });
        var VAL = Math.floor(Math.random() * 2);
        IMAGEN_TWO = GALERIAS[0].imagen;*/
        var IMAGEN_TWO = "";
        let GALERIAS = [];
        if(product.galerias && product.galerias.length > 0){//NUEVO POR CAMBIAR
            GALERIAS = product.galerias.map((galeria) => {
                galeria.imagen = 'http://localhost:3000'+'/api/products/uploads/products/'+galeria.imagen;//*
                return galeria;
            });
            var VAL = Math.floor(Math.random() * product.galerias.length);//0,1,2
            IMAGEN_TWO = GALERIAS[VAL].imagen;
        }//NUEVO POR CAMBIAR
        return {
            _id: product._id,
            title: product.title,
            sku: product.sku,
            slug: product.slug,
            imagen: 'http://localhost:3000'+'/api/products/uploads/products/'+product.portada,//*
            categorie: product.categorie,
            priceEuro: product.priceEuro,
            priceUSD: product.priceUSD,
            stock: product.stock,
            description: product.description,
            resumen: product.resumen,
            tags: product.tags ? JSON.parse(product.tags) : [],
            type_inventario: product.type_inventario,
            state: product.state,
            variedades: variedades,
            imagen_two: IMAGEN_TWO,
            galerias: GALERIAS,
        
        }
    }
}