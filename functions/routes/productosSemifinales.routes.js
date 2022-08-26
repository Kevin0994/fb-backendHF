const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')

const db = admin.firestore()

router.get('/productosSemi/documents', async (req, res) => {
    try {

        const query = db.collection('productoSemifinal');
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;

        const response = docs.map(doc => ({
            id: doc.id,
            nombre_mp:doc.data().nombre_mp, //nombre matria prima
            nombre_ps: doc.data().nombre_ps, //nombre producto semifinal
            lote_mp: doc.data().lote_mp, //lote materia prima
            lote_ps: doc.data().lote_ps, //lote producto semifinal
            peso_mp: doc.data().peso_mp, //peso materia prima
            n_proceso: doc.data().n_proceso, //numero de proceso
            fechaEntrada: doc.data().fechaEntrada,
            fechaSalida: doc.data().fechaSalida,
            n_fundas: doc.data().n_fundas, //numero de fundas
            peso_ps: doc.data().peso_ps, //peso producto semifinal
            conversion: doc.data().conversion,
            responsable: doc.data().responsable,
            estado: doc.data().estado,
        }))

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json();
    }
});


router.post('/productoSemi/post', async (req, res) => {
    try {
        await db.collection('productoSemifinal').doc()
        .create({
            nombre_mp: req.body.nombre_mp, //nombre matria prima
            nombre_ps: req.body.nombre_ps, //nombre producto semifinal
            lote_mp: req.body.lote_mp, //lote materia prima
            lote_ps: req.body.lote_ps, //lote producto semifinal
            peso_mp: req.body.peso_mp, //peso materia prima
            n_proceso: req.body.n_proceso, //numero de proceso
            fechaEntrada: req.body.fechaEntrada,
            fechaSalida: req.body.fechaSalida,
            n_fundas: req.body.n_fundas, //numero de fundas
            peso_ps: req.body.peso_ps, //peso producto semifinal
            conversion: req.body.conversion,
            responsable: req.body.responsable,
            estado: req.body.estado,
        });
        return res.status(204).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

module.exports = router
