export default {
    category_list: (category) => {
        return {
            _id: category._id,
            title:category.title,
            imagen:category.imagen,
            imagen_home:'http://localhost:3000'+'/api/categories/uploads/categorie/'+category.imagen,
            state:category.state
            
        }
    }
}