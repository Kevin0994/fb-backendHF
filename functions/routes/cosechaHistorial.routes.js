const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')

const db = admin.firestore()

//get de todos los documentos
router.get('/cosechaHistorial/documents', async (req, res) => {
    try {
        const query = db.collection('cosechaHistorial');
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;

        const response = docs.map(doc => ({
            id: doc.id,
            nombre: doc.data().nombre,
            codigo: doc.data().codigo,
            fecha: doc.data().fecha,
            peso_stock: doc.data().peso_stock,
            lote: doc.data().lote,
            responsable: doc.data().responsable,
        }))

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json();
    }
});

//busqueda por id
router.get('/cosechaHistorial/documents/:id', (req, res) => {
    (async () => {
        try {
            const doc = db.collection('cosechaHistorial').doc(req.params.id);
            const cosechaHistorial = await doc.get();
            const response = cosechaHistorial.data();
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).send(error);
        }
    })();
});


router.post('/cosechaHistorial/post', async (req, res) => {
    try {
        await db.collection('cosechaHistorial').doc()
        .create({
            nombre: req.body.nombre,
            codigo: req.body.codigo,
            fecha: req.body.fecha,
            peso_stock: req.body.peso_stock,
            lote: req.body.lote,
            responsable: req.body.responsable,
        });
        return res.status(204).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.put('/cosechaHistorial/documents/:id', async (req, res) => {
    try {
        const doc = db.collection('cosechaHistorial').doc(req.params.id);
        await doc.update({
            nombre: req.body.nombre,
            codigo: req.body.codigo,
            fecha: req.body.fecha,
            peso_stock: req.body.peso_stock,
            lote: req.body.lote,
            responsable: req.body.responsable,
        })
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.delete('/cosechaHistorial/documents/:id', async (req, res) => {
    try {
        const doc = db.collection('cosechaHistorial').doc(req.params.id);
        await doc.delete()
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

module.exports = router