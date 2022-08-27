const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')

const db = admin.firestore()

router.get('/productosSemi/documents', async (req, res) => {
    try {

        const query = db.collection('productoSemifinal');
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;
        const productos= Array();

        const response = docs.map(producto => ({
            lote_mp: producto.data().lote_mp.map(function(doc) { //lote materia prima
                cadena = doc.lote.toString()+ ' ';
                return cadena;
            }),
            id: producto.id,
            nombre_mp:producto.data().nombre_mp, //nombre matria prima
            nombre_ps: producto.data().nombre_ps, //nombre producto semifinal
            lote_ps: producto.data().lote_ps, //lote producto semifinal
            peso_mp: producto.data().peso_mp, //peso materia prima
            n_proceso: producto.data().n_proceso, //numero de proceso
            fechaEntrada: producto.data().fechaEntrada,
            //fechaSalida: producto.data().fechaSalida,
            //n_fundas: producto.data().n_fundas, //numero de fundas
            //peso_ps: producto.data().peso_ps, //peso producto semifinal
            //conversion: producto.data().conversion,
            responsable: producto.data().responsable,
            estado: producto.data().estado,
        }))

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json();
    }
});


router.post('/productoSemi/post', async (req, res) => {
    try {
       const doc = db.collection('productoSemifinal').orderBy('n_proceso', 'desc');
        const snapshot = await doc.get();
        const docs = snapshot.docs;
        let proceso = 1;
        const response = docs.map(doc => ({
            proceso: doc.data().n_proceso + 1,
        }))

       if(response.length != 0){
            proceso = response[0].proceso;
        }

        await db.collection('productoSemifinal').doc()
        .create({
            nombre_mp: req.body.nombre_mp, //nombre matria prima
            nombre_ps: req.body.nombre_ps, //nombre producto semifinal
            lote_mp: req.body.lote_mp, //lote materia prima
            lote_ps: req.body.lote_ps, //lote producto semifinal
            peso_mp: req.body.peso_mp, //peso materia prima
            n_proceso: proceso, //numero de proceso
            fechaEntrada: req.body.fechaEntrada,
            //fechaSalida: req.body.fechaSalida,
            //n_fundas: req.body.n_fundas, //numero de fundas
            //peso_ps: req.body.peso_ps, //peso producto semifinal
            //conversion: req.body.conversion,
            responsable: req.body.responsable,
            estado: req.body.estado,
        });
        return res.status(204).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});


router.get('/productosSemi/proceso', async (req, res) => {
    try {

        const doc = db.collection('productoSemifinal').orderBy('n_proceso', 'desc');
        const snapshot = await doc.get();
        const docs = snapshot.docs;
        const response = docs.map(doc => ({
            procesos: doc.data().n_proceso,
        }))

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json();
    }
});

module.exports = router