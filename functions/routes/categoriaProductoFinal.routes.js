const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')

const db = admin.firestore()

router.get('/categoriaProductoFinal/documents', async (req, res) => {
    try {
        const query = db.collection('categoriaProductoFinal');
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;

        const response = docs.map(doc => ({
            id: doc.id,
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

router.post('/categoriaProductoFinal/post', async (req, res) => {
    try {
        await db.collection('categoriaProductoFinal').doc()
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

router.put('/categoriaProductoFinal/put/:id', async (req, res) => {
    try {
        const doc = db.collection('categoriaProductoFinal').doc(req.params.id);
        await doc.update({
            nombre:req.body.nombre,
            img:req.body.img,
        })
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.delete('/categoriaProductoFinal/delete/:id', async (req, res) => {
    try {
        let messege = 'Ok';
        let status = 200;
        const doc = db.collection('categoriaProductoFinal').doc(req.params.id);
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