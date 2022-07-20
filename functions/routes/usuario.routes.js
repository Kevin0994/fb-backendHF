const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')

const db = admin.firestore()

//busqueda por id
router.get('/usuario/documents/:email/:password', (req, res) => {
    (async () => {
        try {
            const email = req.params.email;
            const password = req.params.password;
            const doc = db.collection("usuario").where("email", "==", email).where("password", "==", password);
            const usuario = await doc.get();
            const docs = usuario.docs;
            const response = docs.map(doc => ({
                UserName: doc.data().userName,
                email: doc.data().email,
                rol: doc.data().rol,
            }))
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).send(error);
        }
    })();
});


module.exports = router