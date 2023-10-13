export default {
    category_list: (category) => {
        return {
            _id: category._id,
            title:category.title,
            imagen:category.imagen,
            state:category.state
            
        }
    }
}