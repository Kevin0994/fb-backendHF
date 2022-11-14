
const functionsCrud = require('../methods/metodosCrud')
const functionsCategoria = require('../methods/metodosCategoria')
const functionStorage = require('../services/firebase-storage')

const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')

const db = admin.firestore();

//obtener todas las categorias de los productos semifinales
router.get('/categoriaProductoSemi/documents', async (req, res) => {
    try {
        let data = await functionsCategoria.obtenerCategorias('categoriaProductoSemifinal','productoSemifinal');
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json();
    }
});

//insertar categoria de productos semifinales
router.post('/categoriaProductoSemi/post' , async (req, res) => {
    try {
        const { id, nombre, img, status } = req.body;
        let categoria;
        let imagen;

        if(status){
            let urlImg = await functionStorage.uploadImage(img,'categoriaSemifinal/'+nombre+'/',nombre);
            imagen = {
                url:urlImg.url,
                name:urlImg.reference,
            }

            categoria = {
                nombre:nombre,
                img:imagen
            }
        }else{
            imagen = null;
            categoria = {
                nombre:nombre,
                img: img,
            }
        }

        await functionsCrud.insertarDocumentoId('categoriaProductoSemifinal' ,id,categoria);
        const response = {
            status: true,
            img: imagen,
        };

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).send(error);
    }
});

//actualizar categoria de productos semifinales
router.put('/categoriaProductoSemi/put/:id', async (req, res) => {
    try {
        const idOld = req.params.id;
        const { id, nombre, img, status } = req.body;
        let categoria;
        let imagen;
        if(status){ //verifica si existo alguna imagen
            let urlImg = await functionStorage.updateImage(img,'categoriaSemifinal/'+nombre+'/',nombre);
            imagen = {
                url:urlImg.url,
                name:urlImg.reference,
            }
            categoria = {
                nombre:nombre,
                img: imagen,
            }
        }else{
            imagen = img;
            categoria = {
                nombre:nombre,
                img: img,
            }
        }

        await functionsCategoria.editarCategoria('categoriaProductoSemifinal','productoSemifinal' ,idOld,id,categoria);
        const response = {
            status: false,
            img:imagen,
        };

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).send(error);
    }
});

//eliminar categoria de productos semifinales
router.delete('/categoriaProductoSemi/delete/:id', async (req, res) => {
    try {
        let response = await functionsCategoria.deleteCategoria('categoriaProductoSemifinal','productoSemifinal',req.params.id);
        return res.status(response.status).json(response.messege);
    } catch (error) {
        return res.status(500).send(error.error);
    }
});

//======FUNCIONES DE PRODUCTOS========

//Obtener todos los productos semifinales asociados a sus categorias
router.get('/productoSemi/documents', async (req, res) => {
    try {

        let data = await functionsCategoria.obtenerProductos('categoriaProductoSemifinal' ,'productoSemifinal');
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json(error);
    }
});
//Obtener todos los productos semifinales asociados a una categoria
router.get('/productoSemi/documents/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let data = await functionsCategoria.getProductosPorCategoria('categoriaProductoSemifinal','productoSemifinal','Semi',id);
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json(error);
    }
});

//Buscar un producto por id
router.get('/productoSemi/:idCategoria/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const idCategoria = req.params.idCategoria;
        let data = await functionsCategoria.getProducto('categoriaProductoSemifinal','productoSemifinal',idCategoria,id);
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json(error);
    }
});

//Agregar Productos
router.post('/productoSemi/post/', async (req, res) => {
    try {
        const { id, categoriaId, nombre, img, materiaPrima } = req.body;
        const producto = {
            nombre:nombre,
            img:img,
            materiaPrima: db.doc('listaCosechas/'+materiaPrima),
        }
        await functionsCategoria.insertarProductos('categoriaProductoSemifinal',categoriaId,'productoSemifinal' ,id ,producto);
        const status = true;

        return res.status(200).json(status);
    } catch (error) {
        return res.status(500).send(error);
    }
});

//Actualizar Producto
router.put('/productoSemi/put/:id', async (req, res) => {
    try {
        const { id, nombre, img, materiaPrima } = req.body;
        const document = {
            idOld : req.params.id,
            id : id,
        }
        const producto = {
            nombre:nombre,
            img:img,
            materiaPrima: db.doc('listaCosechas/'+materiaPrima),
        }
        const categoria = {
            id : categoriaId,
            idOld : categoriaIdOld,
        }
        await functionsCategoria.ActualizarProductoSemi('categoriaProductoSemifinal',categoria, document ,'productoSemifinal',producto);
        const status = false;

        return res.status(200).json(status);
    } catch (error) {
        return res.status(500).send(error);
    }
});

//eliminar productos semifinales
router.delete('/productoSemi/delete/:id/:categoria', async (req, res) => {
    try {
        const id = req.params.id;
        const categoria = req.params.categoria;

        await functionsCategoria.DeleteProducto('categoriaProductoSemifinal',categoria,'productoSemifinal' ,id );

        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});



module.exports = router