
const functionsCategoria = require('../methods/metodosCategoria')
const functionsCrud = require('../methods/metodosCrud')

const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')
const FieldValue = admin.firestore.FieldValue;

const db = admin.firestore();
//obtener todas las categorias de los productos semifinales
router.get('/categoriaProductoSemi/documents', async (req, res) => {
    try {
        let data = await functionsCategoria.obtenerCategorias('categoriaProductoSemifinal');
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json();
    }
});

//insertar categoria de productos semifinales
router.post('/categoriaProductoSemi/post', async (req, res) => {
    try {
        const { id, nombre, img } = req.body;
        const categoria = {
            nombre:nombre,
            img:img,
        }
        await functionsCrud.insertarDocumentoId('categoriaProductoSemifinal',id,categoria);
        const status = true;

        return res.status(200).json(status);
    } catch (error) {
        return res.status(500).send(error);
    }
});

//actualizar categoria de productos semifinales
router.put('/categoriaProductoSemi/put/:id', async (req, res) => {
    try {
        const idOld = req.params.id;
        const { id, nombre, img } = req.body;
        const categoria = {
            nombre:nombre,
            img:img,
        }
        await functionsCategoria.editarCategoria('categoriaProductoSemifinal',idOld,id,categoria);
        const status = false;

        return res.status(200).json(status);
    } catch (error) {
        return res.status(500).send(error);
    }
});

//eliminar categoria de productos semifinales
router.delete('/categoriaProductoSemi/delete/:id', async (req, res) => {
    try {
        let response = await functionsCategoria.deleteCategoria('categoriaProductoSemifinal',req.params.id);
        return res.status(response.status).json(response.messege);
    } catch (error) {
        return res.status(500).send(error.error);
    }
});

//======FUNCIONES DE PRODUCTOS========

//Obtener todos los productos semifinales asociados a sus categorias
router.get('/productoSemi/documents', async (req, res) => {
    try {

        let data = await functionsCategoria.obtenerProductos('productoSemifinal','Semi');
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json(error);
    }
});
//Obtener todos los productos semifinales asociados a una categoria
router.get('/productoSemi/documents/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let data = await functionsCategoria.getProductosPorCategoria('categoriaProductoSemifinal','productoSemifinal',id);
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