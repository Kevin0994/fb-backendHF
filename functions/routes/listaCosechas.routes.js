const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')

const db = admin.firestore()

router.get('/listaCosechas/documents', async (req, res) => {
    try {
        
        const query = db.collection('listaCosechas');
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;

        const response = docs.map(doc => ({
            nombre: doc.data().nombre,
            codigo: doc.data().codigo,
        }))
        
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json();
    }
});

router.get('/cosechas/documents/:id', (req, res) => {
    (async () => {
        try {
            const doc = db.collection('listaCosechas').doc(req.params.id);
            const cosechaHistorial = await doc.get();
            const response = cosechaHistorial.data();
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).send(error);
        }
    })();
});

module.exports = router

