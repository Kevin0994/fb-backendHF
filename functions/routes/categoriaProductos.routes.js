const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')

const db = admin.firestore()

router.get('/categoriaProducto/documents', async (req, res) => {
    try {
        const query = db.collection('categoriaProducto');
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;

        const response = docs.map(doc => ({
            nombre: doc.data().nombre,
            img: doc.data().img,
            podructos: doc.data().productos,
        }))

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json();
    }
});

module.exports = router