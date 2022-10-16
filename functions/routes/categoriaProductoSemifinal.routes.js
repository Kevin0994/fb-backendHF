
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

        const query = db.collection('categoriaProductoSemifinal');
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
                    materiaPrima: doc.materiaPrima,
                };
                producto.push(document);
                return document;
            })
        }))

        //reorganizamos el array con los productos para que solo entrege el id de la materia prima
        producto.map(function(doc,index,array){
            if(doc.materiaPrima != null){
              array[index].materiaPrima = doc.materiaPrima._path.segments[1]
            }
        })

        return res.status(200).json(producto);
    } catch (error) {
        return res.status(500).json(error);
    }
});




//Agregar Productos
router.post('/productoSemi/post/', async (req, res) => {
    try {
        let status = 200;
        let response;
        const query = await db.collection("categoriaProductoSemifinal")
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;
        const producto= Array();
        docs.map(categoria => ({
            producto: categoria.data().productos.map(function(doc) {
                document={
                    codigo: doc.codigo,
                    nombre: doc.nombre,
                };
                producto.push(document);
                return document;
            })
        }))
        const filtro = producto.filter(function(doc) {
            if(doc.codigo === req.body.codigo || doc.nombre === req.body.nombre){
                return doc
            }else{
                return false
            }
        });
        if(filtro == false){
            response = await db.collection("categoriaProductoSemifinal").doc(req.body.categoria).update({
                productos: FieldValue.arrayUnion({
                    codigo: req.body.codigo,
                    img: req.body.img,
                    materiaPrima: db.doc('listaCosechas/'+req.body.materiaPrima),
                    nombre: req.body.nombre
                })
            })
        }else{
            status = 500;
            response = 'Error al insertar, ya hay un producto con el mismo codigo o nombre';
        }
        return res.status(status).json(response);
    } catch (error) {
        return res.status(500).send(error);
    }
});

//Actualizar Producto
router.post('/productoSemi/put/', async (req, res) => {
    try {
        const { producto, codigo, img, materiaPrima, nombre, categoria } = req.body;

        const doc =  await db.collection("categoriaProductoSemifinal");

        doc.doc(producto.id).update({
            productos: FieldValue.arrayRemove({
                codigo: producto.codigo,
                img: producto.img,
                materiaPrima: db.doc('listaCosechas/'+producto.materiaPrima),
                nombre: producto.nombre
            })
        })

        doc.doc(categoria).update({
            productos: FieldValue.arrayUnion({
                codigo: codigo,
                img: img,
                materiaPrima: db.doc('listaCosechas/'+materiaPrima),
                nombre: nombre
            })
        })

        return res.status(200).json('actualizado');
    } catch (error) {
        return res.status(500).send(error);
    }
});

//eliminar productos semifinales
router.post('/productoSemi/delete/', async (req, res) => {
    try {
        const { id, codigo, img, materiaPrima, nombre } = req.body;

        const doc =  await db.collection("categoriaProductoSemifinal");

        doc.doc(id).update({
            productos: FieldValue.arrayRemove({
                codigo: codigo,
                img: img,
                materiaPrima: db.doc('listaCosechas/'+materiaPrima),
                nombre: nombre
            })
        })

        return res.status(200).json('actualizado');
    } catch (error) {
        return res.status(500).send(error);
    }
});


module.exports = router