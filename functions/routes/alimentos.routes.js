const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')

const db = admin.firestore()

router.get('/alimentos/documents', async (req, res) => {
    try {

        const query = db.collection('listaCosechas');
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;

        const response = docs.map(doc => ({
            id: doc.id,
            codigo: doc.data().codigo,
            nombre: doc.data().nombre,
        }))

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json();
    }
});

router.post('/alimentos/post', async (req, res) => {
    try {
        await db.collection('listaCosechas').doc()
        .create({
            nombre: req.body.nombre,
            codigo: req.body.codigo,
        });
        return res.status(204).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.put('/alimentos/put/:id', async (req, res) => {
    try {
        const doc = db.collection('listaCosechas').doc(req.params.id);
        await doc.update({
            nombre: req.body.nombre,
            codigo: req.body.codigo,
        })
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.delete('/alimentos/delete/:id', async (req, res) => {
    try {
        const doc = db.collection('listaCosechas').doc(req.params.id);
        await doc.delete()
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});



module.exports = router
