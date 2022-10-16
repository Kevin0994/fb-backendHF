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



//Obtener todos los productos semifinales asociados a sus categorias
router.get('/productoFinal/documents', async (req, res) => {
    const query = db.collection('categoriaProductoFinal');
    const querySnapshot = await query.get();
    const docs = querySnapshot.docs;
    const producto= Array();

    const response = docs.map(categoria => ({
        producto: categoria.data().productos.map(function(doc) {
            document={
                id: categoria.id,
                categoria: categoria.data().nombre,
                codigo: doc.codigo,
                nombre: doc.nombre,
                img: doc.img,

            };
            producto.push(document);
            return document;
        })
    }))

    console.log(response);

    return res.status(200).json(producto);
});

//cambiar de nombre la coleccion
/* router.post('/categoriaProductoFinal/post', async (req, res) => {
    try {
        const query = db.collection('categoriaProducto');
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;

        const response = docs.map(function(doc) {
            db.collection('categoriaProductoFinal').doc().create({
            nombre: doc.data().nombre,
            img: doc.data().img,
            productos: doc.data().productos,
         });
        })

        return res.status(204).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});
 */

module.exports = router