const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')

const db = admin.firestore()

router.get('/cosecha/documents', async (req, res) => {
    try {
        const query = db.collection('cosecha');
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;

        const response = docs.map(doc => ({
            id: doc.id,
            nombre: doc.data().nombre
        }))

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json();
    }
});

router.get('/cosecha/documents/:id', (req, res) => {
    (async () => {
        try {
            const doc = db.collection('cosecha').doc(req.params.id);
            const cosecha = await doc.get();
            const response = cosecha.data();
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).send(error);
        }
    })();
});

router.post('/cosecha/post', async (req, res) => {
    try {
        await db.collection('cosecha').doc()
        .create({nombre: req.body.name});
        return res.status(204).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.put('/cosecha/documents/:id', async (req, res) => {
    try {
        const doc = db.collection('cosecha').doc(req.params.id);
        await doc.update({
            nombre: req.body.nombre
        })
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.delete('/cosecha/documents/:id', async (req, res) => {
    try {
        const doc = db.collection('cosecha').doc(req.params.id);
        await doc.delete()
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

module.exports = router