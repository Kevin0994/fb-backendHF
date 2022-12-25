const { Router } = require('express')
const router = Router();
const bcrypt = require('bcrypt');
const admin = require('firebase-admin')
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/checkAuth')
const db = admin.firestore()

const encryptPassword = async (passsword) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(passsword, salt);
}

//Validar usuario 
router.get('/usuario/:email/:password', (req, res) => {
    (async () => {
        try {
            const email = req.params.email;
            const password = req.params.password;
            const doc = db.collection("usuario").where("email", "==", email);
            const usuario = await doc.get();
            const docs = usuario.docs;
            const response = docs.map(doc => ({
                id: doc.id,
                UserName: doc.data().apellidos,
                email: doc.data().email,
                rol: doc.data().rol,
                password: doc.data().password
            }))
            const validatePassword = await bcrypt.compare(password, response[0].password);

            if(validatePassword) {
              const token = jwt.sign({ id: response[0].id }, "secretpassw", { expiresIn: 60 * 60 });
              return res.status(201).send({auth: true, token: token, user: response[0]});
            }
            else
              return res.status(401).send({message: '¡Contraseña incorrecta!'});
            // return res.status(200).json(response);
        } catch (error) {
            return res.status(500).send(error);
        }
    })();
});

router.post('/usuario/login', async (req, res) => {
    const password = req.body.password;
    const email = req.body.email;

    const doc = db.collection("usuario").where("email", "==", email);
    
    const usuario = await doc.get();
    const docs = usuario.docs;
    const response = docs.map(doc => ({
        id: doc.id,
        UserName: doc.data().apellidos,
        email: doc.data().email,
        rol: doc.data().rol,
        password: doc.data().password
    }))

    if(response.length === 0)
        return res.status(401).send({message: '¡Usuario no registrado!'});

    const validatePassword = await bcrypt.compare(password, response[0].password);

    if(validatePassword) {
      const token = jwt.sign({ id: response[0].id }, "secretpassw", { expiresIn: 60 * 60 });
      return res.status(201).send({auth: true, token: token, user: response[0]});
    }
    else
      return res.status(401).send({message: '¡Usuario o contraseña incorrecta!'});
});

//validar rol
router.get('/usuario/documents/rol/:id', (req, res) => {
    (async () => {
        try {
            const doc = db.collection("usuario").doc(req.params.id)
            const usuario = await doc.get();
            const response = usuario.data();
            return res.status(200).json(response.rol);

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
router.get('/usuarios/documents', checkAuth, async (req, res) => {
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
router.post('/usuario/post', checkAuth,async (req, res) => {
    try {
        let passwordCrypt = await encryptPassword(req.body.password);
        await db.collection('usuario').doc()
        .create({
            nombres: req.body.nombres,
            apellidos: req.body.apellidos,
            email: req.body.email,
            userName: req.body.userName,
            rol: req.body.rol,
            password: passwordCrypt,
        });
        return res.status(204).json({message: '¡Usuario guardado con éxito!'});
    } catch (error) {
        return res.status(500).send(error);
    }
});

//editar usuario
router.put('/usuario/documents/:id', checkAuth,async (req, res) => {
    try {
        const doc = db.collection('usuario').doc(req.params.id);
        let passwordCrypt = await encryptPassword(req.body.password);
        await doc.update({
            nombres: req.body.nombres,
            apellidos: req.body.apellidos,
            email: req.body.email,
            userName: req.body.userName,
            rol: req.body.rol,
            password: passwordCrypt,
        })
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});








router.delete('/usuario/documents/:id', checkAuth,async (req, res) => {
    try {
        const doc = db.collection('usuario').doc(req.params.id);
        await doc.delete()
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});




module.exports = router