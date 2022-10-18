const functionsCrud = require('../methods/metodosCrud')

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
            nombre: doc.data().nombre,
        }))

        response.sort(function(a, b){ //Ordena el array de manera Descendente
            if(a.nombre > b.nombre){
                return 1
            } else if (a.nombre < b.nombre) {
                return -1
            } else {
                return 0
            }
        })

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

router.post('/alimentos/post', async (req, res) => {
    try {
        const { id, nombre } = req.body;
        const categoria = {
            nombre:nombre,
        }
        await functionsCrud.insertarDocumentoId('listaCosechas',id,categoria);
        const status = true;

        return res.status(200).json(status);
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.put('/alimentos/put/:id', async (req, res) => {
    try {
        const idOld = req.params.id;
        const { id, nombre } = req.body;
        const alimento = {
            nombre:nombre,
        }
        await functionsCrud.editarDocumentoId('listaCosechas',idOld,id,alimento);
        const status = false;

        return res.status(200).json(status);
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.delete('/alimentos/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await functionsCrud.deleteDocumentoId('listaCosechas',id);
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});



module.exports = router
