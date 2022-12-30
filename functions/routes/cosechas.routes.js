const { Router } = require('express')
const router = Router();
const checkAuth = require('../middleware/checkAuth');
const admin = require('firebase-admin')
const FieldValue = admin.firestore.FieldValue;
const Timestamp = admin.firestore.Timestamp;

const db = admin.firestore();


//get de todos los documentos
router.get('/cosechas/documents', checkAuth, async (req, res) => {
    try {
        const query = db.collection('cosechas');
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;

        const response = docs.map(doc => ({
            id: doc.id,
            nombre: doc.data().nombre,
            codigo: doc.data().codigo,
            stock: doc.data().stock / 1000 ,
            lote: doc.data().lote,
            loteMes: doc.data().loteMes,
        }))

        response.sort(function(a, b){ //Ordena el array de manera Descendente
            if(a.lote < b.lote){
                return 1
            } else if (a.lote > b.lote) {
                return -1
            } else {
                return 0
            }
        })

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json(false);
    }
});

//get de todos los documentos
router.get('/cosechasHistorial/documents', checkAuth, async (req, res) => {
    try {
        const query = db.collection('cosechas');
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;
        const historial= Array();

        const response = docs.map(cosecha => ({
            historial: cosecha.data().historial.map(function(doc) {
                let fechaFormat = doc.fecha.toDate(); //Trnasformamos la fecha a un objete tipo Date
                document={
                    id: cosecha.id,
                    nombre: cosecha.data().nombre,
                    codigo: cosecha.data().codigo,
                    lote: cosecha.data().lote,
                    stock: cosecha.data().stock / 1000,
                    idHistorial: doc.id,
                    ingreso: doc.ingreso /1000,
                    fecha : doc.fecha, // fecha en formato timestamp
                    fechaF: fechaFormat.toLocaleString('en-US', { timeZone: 'America/Guayaquil' }), //formato de fecha legible
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


//Ingreso de cosechas completo
router.post('/cosechas/post/:nombre/:lote', checkAuth, async (req, res) => {
    try {

        const { stockN, nombreN, codigo, loteN, historial } = req.body;

        const nombre = req.params.nombre;
        const loteMes = parseInt(req.params.lote);
        var idArrays;
        let status;
        const doc = db.collection("cosechas").where("nombre", "==", nombre).where("loteMes", "==",loteMes); //Busca las cosecha por nombre y lote 
        const cosecha = await doc.get();
        const docs = cosecha.docs;

        if (cosecha.empty) { //Si no se encontro ninguna cosecha se ingresa una cosecha nueva
            await db.collection('cosechas').doc()
            .create({
                nombre: nombreN,
                codigo: codigo,
                stock: stockN,
                loteMes: loteMes,
                lote: loteN,
                historial: FieldValue.arrayUnion({
                    id: 1,
                    ingreso: historial[0].ingreso,
                    fecha: Timestamp.fromDate(new Date(historial[0].fecha)),
                    responsable: historial[0].responsable,
                }),
            });
            status = true;

            return res.status(200).json(status);
        }

        if(docs[0].data().historial.length === 0){
            await db.collection('cosechas').doc(docs[0].id)
            .update({
                stock: historial[0].ingreso,
                historial: FieldValue.arrayUnion({
                    id: 1,
                    ingreso: historial[0].ingreso,
                    fecha: Timestamp.fromDate(new Date(historial[0].fecha)),
                    responsable: historial[0].responsable,
                }),
            });
            status = false;

            return res.status(200).json(status);

        }else{

            const resultado = docs.map(doc => ({ //Guarda el resultado de la busqueda en un variable
                id: doc.id,
                stock: doc.data().stock,
                history: doc.data().historial,
            }));

            resultado[0].history.map(function(doc){ //crea un array con las id del los historiales
                idArrays={
                    id: doc.id
                }
            })
            await db.collection('cosechas').doc(resultado[0].id)
            .update({
                stock: resultado[0].stock + historial[0].ingreso,
                historial: FieldValue.arrayUnion({
                    id: Math.max(idArrays.id)+1,
                    ingreso: historial[0].ingreso,
                    fecha: Timestamp.fromDate(new Date(historial[0].fecha)),
                    responsable: historial[0].responsable
                })
            })
            status = false

            return res.status(200).json(status);
        }

    } catch (error) {
        return res.status(500).send(error);
    }
});

//Eliminar Historial
router.post('/cosechaHistorial/delete/:id', checkAuth, async (req, res) => {
    try {
        const { stock, idHis, ingreso, fecha, responsable } = req.body;
        let fechaFormat = new Timestamp(fecha._seconds,fecha._nanoseconds)
        await db.collection("cosechas").doc(req.params.id).update({
            stock: stock * 1000,
            historial: FieldValue.arrayRemove({
                id: idHis,
                ingreso: ingreso * 1000,
                fecha:  fechaFormat,
                responsable: responsable
            })
        })
        return res.status(200).json(fechaFormat);
    } catch (error) {
        return res.status(500).send(error);
    }
});

//Eliminar Cosechas
router.delete('/cosechas/documents/:id', checkAuth, async (req, res) => {
    try {
        const doc = db.collection('cosechas').doc(req.params.id);
        await doc.delete()
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

/* //Valida si exite stock para fabricar un producto semifinal y actualiza el stock de la casecha a usar para la fabricacion
router.put('/stock/:nombre', (req, res) => {
    (async () => {
        try {
            const nombre = req.params.nombre;
            let ingreso = req.body.ingreso;
            let total = 0;
            let status = 500;
            const resultado= Array();
            const response= Array();
            const doc = db.collection("cosechas").where("nombre", "==", nombre);
            const cosecha = await doc.get();
            const docs = cosecha.docs;
            docs.map(function(doc){
                if(doc.data().stock != 0){
                    document={
                        id: doc.id,
                        lote: doc.data().lote,
                        stock: doc.data().stock,
                    };
                    total += doc.data().stock
                    resultado.push(document);
                    return document;
                }
            });

            if(resultado.length != 0){
                resultado.sort(function(a, b){
                    if(a.lote < b.lote){
                        return 1
                    } else if (a.lote > b.lote) {
                        return -1
                    } else {
                        return 0
                    }
                })

                resultado.every(function(doc){

                    if(ingreso <= total){
                        if(doc.stock >= ingreso){
                            document={
                                lote: doc.lote,
                                salida: ingreso,
                            };
                            response.push(document);
                            db.collection('cosechas').doc(doc.id).update({
                                stock: doc.stock - ingreso,
                            })
                            status = 200;
                            return false;
                        }else{
                            document={
                                lote: doc.lote,
                                salida: doc.stock,
                            };

                            db.collection('cosechas').doc(doc.id).update({
                                stock: 0,
                            })
                            ingreso -= doc.stock
                            response.push(document);
                            status = 200;
                            return true;
                        }
                    }else{
                        document = {
                            messege : 'stock insuficiente',
                            stock : ingreso - total
                        }

                        response.push(document);
                        status = 500;
                        return false;
                    }

                })
            }else{
                document = {
                    messege : 'stock insuficiente',
                    stock : ingreso
                }

                response.push(document);
                status = 500;
            }

            return res.status(status).json(response);

        } catch (error) {
            return res.status(500).send(error);
        }
    })();
});
 */

module.exports = router