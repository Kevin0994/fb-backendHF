const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin');
const checkAuth = require('../middleware/checkAuth');

const db = admin.firestore()

router.get('/listaRoles/documents', checkAuth, async (req, res) => {
    try {

        const query = db.collection('listaRolesUsuario');
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;

        const response = docs.map(doc => ({
            nombre: doc.data().nombre,
        }))

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json();
    }
});

module.exports = router
