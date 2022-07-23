const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')

const db = admin.firestore()

//Validar usuario 
router.get('/usuario/:email/:password', (req, res) => {
    (async () => {
        try {
            const email = req.params.email;
            const password = req.params.password;
            const doc = db.collection("usuario").where("email", "==", email).where("password", "==", password);
            const usuario = await doc.get();
            const docs = usuario.docs;
            const response = docs.map(doc => ({
                id: doc.id,
                UserName: doc.data().apellidos,
                email: doc.data().email,
            }))
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).send(error);
        }
    })();
});

//validar rol
router.get('/usuario/documents/rol/:id', (req, res) => {
    (async () => {
        try {
            const doc = db.collection("usuario").doc(req.params.id)
            const usuario = await doc.get();
            const response = usuario.data();
            if(response.rol == 'Administrador'){
                return res.status(200).json(true);
            }
            return res.status(200).json(false);

        } catch (error) {
            return res.status(500).send(error);
        }
    })();
});

//Buscar usuario por id
router.get('/usuario/:id', (req, res) => {
    (async () => {
        try {
            const doc = db.collection("usuario").doc(req.params.id)
            const usuario = await doc.get();
            const response = usuario.data();
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).send(error);
        }
    })();
});

//get de todos los documentos
router.get('/usuarios/documents', async (req, res) => {
    try {
        
        const query = db.collection('usuario');
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;

        const response = docs.map(doc => ({
            id: doc.id,
            nombres: doc.data().nombres,
            apellidos: doc.data().apellidos,
            email: doc.data().email,
            userName: doc.data().userName,
            rol: doc.data().rol,
            password: doc.data().password,
            
        }))
        
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json();
    }
});

//Ingresar usuario
router.post('/usuario/post', async (req, res) => {
    try {
        await db.collection('usuario').doc()
        .create({
            nombres: req.body.nombres,
            apellidos: req.body.apellidos,
            email: req.body.email,
            userName: req.body.userName,
            rol: req.body.rol,
            password: req.body.password,
        });
        return res.status(204).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

//editar usuario
router.put('/usuario/documents/:id', async (req, res) => {
    try {
        const doc = db.collection('usuario').doc(req.params.id);
        await doc.update({
            nombres: req.body.nombres,
            apellidos: req.body.apellidos,
            email: req.body.email,
            userName: req.body.userName,
            rol: req.body.rol,
            password: req.body.password,
        })
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.delete('/usuario/documents/:id', async (req, res) => {
    try {
        const doc = db.collection('usuario').doc(req.params.id);
        await doc.delete()
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});




module.exports = router