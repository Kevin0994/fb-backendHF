const functionsCategoria = require('../methods/metodosCategoria')
const functionsCrud = require('../methods/metodosCrud')

const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')

const db = admin.firestore()

//obtener todas las categorias de los productos finales
router.get('/categoriaProductoFinal/documents', async (req, res) => {
    try {

        let data = await functionsCategoria.obtenerCategorias('categoriaProductoFinal');
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json();
    }
});

//insertar categoria de productos finales
router.post('/categoriaProductoFinal/post', async (req, res) => {
    try {
        const { id, nombre, img } = req.body;
        const categoria = {
            nombre:nombre,
            img:img,
        }
        await functionsCrud.insertarDocumentoId('categoriaProductoFinal',id,categoria);
        const status = true;
        return res.status(200).json(status);
    } catch (error) {
        return res.status(500).send(error);
    }
});

//actualizar categoria de productos finales
router.put('/categoriaProductoFinal/put/:id', async (req, res) => {
    try {
        const idOld = req.params.id;
        const { id, nombre, img } = req.body;
        const categoria = {
            nombre:nombre,
            img:img,
        }
        await functionsCategoria.editarCategoria('categoriaProductoFinal',idOld,id,categoria);
        const status = false;

        return res.status(200).json(status);
    } catch (error) {
        return res.status(500).send(error);
    }
});

//eliminar categoria de productos finales
router.delete('/categoriaProductoFinal/delete/:id', async (req, res) => {
    try {

        let response = await functionsCategoria.deleteCategoria('categoriaProductoFinal',req.params.id);
        return res.status(response.status).json(response.messege);

    } catch (error) {
        return res.status(500).send(error);
    }
});


// ======Productos Finales========



//Obtener todos los productos finales asociados a sus categorias
router.get('/productoFinal/documents', async (req, res) => {

    let data = await functionsCategoria.obtenerProductos('categoriaProductoFinal');
    return res.status(200).json(data);
});

//Obtener todos los productos Finales asociados a una categoria
router.get('/productoFinal/documents/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let data = await functionsCategoria.getProductosPorCategoria('categoriaProductoFinal',id);
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json(error);
    }
});

//Agregar Productos Finales
router.post('/productoFinal/post/', async (req, res) => {
    try {
        const { id, categoriaId, nombre, img, materiaPrima } = req.body;
        const producto = {
            nombre:nombre,
            img:img,
            materiaPrima: db.doc('categoriaProductoSemifinal/'+categoriaId+'/productos/'+materiaPrima),
        }
        await functionsCategoria.insertarProductos('categoriaProductoFinal',categoriaId ,id ,producto);
        const status = true;

        return res.status(200).json(status);
    } catch (error) {
        return res.status(500).send(error);
    }
});

//Actualizar Producto
router.put('/productoFinal/put/:id', async (req, res) => {
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
        await functionsCategoria.ActualizarProductoSemi('categoriaProductoFinal',document ,categoria ,producto);
        const status = false;

        return res.status(200).json(status);
    } catch (error) {
        return res.status(500).send(error);
    }
});


//Eliminar productos Finales
router.delete('/productoFinal/delete/:id/:categoria', async (req, res) => {
    try {
        const id = req.params.id;
        const categoria = req.params.categoria;

        await functionsCategoria.DeleteProducto('categoriaProductoFinal',id ,categoria);

        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

module.exports = router