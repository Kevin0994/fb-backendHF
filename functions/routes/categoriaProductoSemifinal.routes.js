const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')
const FieldValue = admin.firestore.FieldValue;

const db = admin.firestore()

//obtener todas las categorias de los productos semifinales
router.get('/categoriaProductoSemi/documents', async (req, res) => {
    try {
        const query = db.collection('categoriaProductoSemifinal');
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;

        const response = docs.map(doc => ({
            id:doc.id,
            nombre: doc.data().nombre,
            img: doc.data().img,
            nProductos: doc.data().productos.length,
            productos: doc.data().productos,
        }))

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json();
    }
});

//insertar categoria de productos semifinales
router.post('/categoriaProductoSemi/post', async (req, res) => {
    try {
        await db.collection('categoriaProductoSemifinal').doc()
        .create({
            nombre:req.body.nombre,
            img:req.body.img,
            productos: Array(),
        });
        return res.status(204).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

//actualizar categoria de productos semifinales
router.put('/categoriaProductoSemi/put/:id', async (req, res) => {
    try {
        const doc = db.collection('categoriaProductoSemifinal').doc(req.params.id);
        await doc.update({
            nombre:req.body.nombre,
            img:req.body.img,
        })
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

//eliminar categoria de productos semifinales
router.delete('/categoriaProductoSemi/delete/:id', async (req, res) => {
    try {
        let messege = 'Ok';
        let status = 200;
        const doc = db.collection('categoriaProductoSemifinal').doc(req.params.id);
        const categoria = await doc.get();
        if(categoria.data().productos.length == 0){
            await doc.delete()
        }else{
            messege = 'No se puede eliminar la categoria porque hay productos asociados a ella'
            status = 400;
        }
        return res.status(status).json(messege);
    } catch (error) {
        return res.status(500).send(error);
    }
});
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

module.exports = router


//Agregar Productos
router.post('/productoSemi/post/', async (req, res) => {
    try {
        const response = await db.collection("categoriaProductoSemifinal").doc(req.body.categoria).update({
            productos: FieldValue.arrayUnion({
                codigo: req.body.codigo,
                img: req.body.img,
                materiaPrima: db.doc('listaCosechas/'+req.body.materiaPrima),
                nombre: req.body.nombre
            })
        })
        return res.status(200).json(response);
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