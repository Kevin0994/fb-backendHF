const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')
const FieldValue = admin.firestore.FieldValue;

const db = admin.firestore()


//get de todos los documentos
router.get('/cosechas/documents', async (req, res) => {
    try {
        const query = db.collection('cosechas');
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;

        const response = docs.map(doc => ({
            id: doc.id,
            nombre: doc.data().nombre,
            codigo: doc.data().codigo,
            stock: doc.data().stock,
            lote: doc.data().lote,
        }))

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json();
    }
});

//get de todos los documentos
router.get('/cosechasHistorial/documents', async (req, res) => {
    try {
        const query = db.collection('cosechas');
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;
        const historial= Array();

        const response = docs.map(cosecha => ({
            historial: cosecha.data().historial.map(function(doc) {
                document={
                    id: cosecha.id,
                    nombre: cosecha.data().nombre,
                    codigo: cosecha.data().codigo,
                    lote: cosecha.data().lote,
                    stock: cosecha.data().stock,
                    idHistorial: doc.id,
                    ingreso: doc.ingreso,
                    fecha: doc.fecha,
                    responsable: doc.responsable,
                };
                historial.push(document);
                return document;
            })
        }))

        console.log(response);

        return res.status(200).json(historial);
    } catch (error) {
        return res.status(500).json();
    }
});

//busqueda por id
router.get('/cosechas/documents/:id', (req, res) => {
    (async () => {
        try {
            const doc = db.collection('cosechas').doc(req.params.id);
            const cosechaHistorial = await doc.get();
            const response = cosechaHistorial.data();
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).send(error);
        }
    })();
});

//busqueda de historial cosecha por id
/* router.get('/Historial/documents/:idCo/:idHis', (req, res) => {
    (async () => {
        try {
            const doc = db.collection('cosechas').doc(req.params.idCo);
            console.log(doc); 
            const cosechaHistorial = await db.collection('cosechas').doc(req.params.idCo)
            const response = cosechaHistorial.data();
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).send(error);
        }
    })();
});
 */
//buscar por nombre y lote
router.get('/cosechaStock/:nombre/:lote', (req, res) => {
    (async () => {
        try {
            const nombre = req.params.nombre;
            const lote = req.params.lote;
            const doc = db.collection("cosechas").where("nombre", "==", nombre).where("lote", "==", parseInt(lote));
            const cosecha = await doc.get();
            const docs = cosecha.docs;
            const response = docs.map(doc => ({
                id: doc.id,
                stock: doc.data().stock
            }))

            return res.status(200).json(response);

        } catch (error) {
            return res.status(500).send(error);
        }
    })();
});


//Ingreso de cosechas completo
router.post('/cosechas/post', async (req, res) => {
    try {
        await db.collection('cosechas').doc()
        .create({
            nombre: req.body.nombre,
            codigo: req.body.codigo,
            stock: req.body.stock,
            lote: req.body.lote,
            historial: req.body.historial,
        });
        return res.status(204).json('Insertado');
    } catch (error) {
        return res.status(500).send(error);
    }
});

//Ingreso de nuevas Historial de cosechas
router.post('/cosechaHistorial/post/:id', async (req, res) => {
    try {
        const { stock, idHis, ingreso, fecha, responsable } = req.body;

        const response = await db.collection("cosechas").doc(req.params.id).update({
            stock: stock,
            historial: FieldValue.arrayUnion({
                id: idHis,
                ingreso: ingreso,
                fecha: fecha,
                responsable: responsable
            })
        })
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).send(error);
    }
});


//Eliminar Historial
router.post('/cosechaHistorial/delete/:id', async (req, res) => {
    try {
        const { stock, idHis, ingreso, fecha, responsable } = req.body;

        const response = await db.collection("cosechas").doc(req.params.id).update({
            stock: stock,
            historial: FieldValue.arrayRemove({
                id: idHis,
                ingreso: ingreso,
                fecha: fecha,
                responsable: responsable
            })
        })
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).send(error);
    }
});

//Eliminar Cosechas
router.delete('/cosechas/documents/:id', async (req, res) => {
    try {
        const doc = db.collection('cosechas').doc(req.params.id);
        await doc.delete()
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

module.exports = router