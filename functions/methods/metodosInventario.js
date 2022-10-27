const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')
const FieldValue = admin.firestore.FieldValue;

const db = admin.firestore();

async function getInventarioSemifinalProcesos(coleccion,estado){
    const query = db.collection(coleccion);
    const querySnapshot = await query.get();
    const docs = querySnapshot.docs;
    let response = Array();

    if(estado === 'En proceso'){
        await Promise.all(docs.map(async function (producto){
            let querySubcollection =  db.collection(coleccion).doc(producto.id).collection('ingresos');
            let ingresos = await querySubcollection.get();
            if(ingresos.docs.length != 0){
                ingresos.docs.map(function (ingreso){
                    let fechaFormat = ingreso.data().fechaEntrada.toDate();
                    document = {
                        loteMp_st: ingreso.data().loteMp.map(function(doc) { //lote materia prima
                            cadena = doc.lote.toString()+ ' ';
                            return cadena;
                        }),
                        loteMp : ingreso.data().loteMp,
                        idProducto: producto.id,
                        id: ingreso.id, //numero de proceso
                        stock: producto.data().stock,
                        nombreMp:producto.data().nombreMp, //nombre matria prima
                        nombre: producto.data().nombre, //nombre producto semifinal
                        lote: producto.data().lote, //lote producto semifinal
                        pesoMp: ingreso.data().pesoMp, //peso materia prima
                        fechaEntrada: fechaFormat.toLocaleString('en-US', { timeZone: 'America/Guayaquil' }),
                        responsable: ingreso.data().responsable,
                        estado: ingreso.data().estado,
                    }
                    response.push(document);
                    return document;
                })
            }
        }))
    }
    if(estado === 'Terminado'){
        await Promise.all(docs.map(async function (producto){
            let querySubcollection =  db.collection(coleccion).doc(producto.id).collection('ingresos');
            let ingresos = await querySubcollection.get();
            if(ingresos.docs.length != 0){
                ingresos.docs.map(function (ingreso){
                    let fechaFormatE = ingreso.data().fechaEntrada.toDate();
                    let fechaFormatS = ingreso.data().fechaSalida.toDate();
                    document = {
                        loteMp_st: ingreso.data().loteMp.map(function(doc) { //lote materia prima
                            cadena = doc.lote.toString()+ ' ';
                            return cadena;
                        }),
                        loteMp : ingreso.data().loteMp,
                        idProducto: producto.id,
                        id: ingreso.id, //numero de proceso
                        stock: producto.data().stock,
                        nombreMp:producto.data().nombreMp, //nombre matria prima
                        nombre: producto.data().nombre, //nombre producto semifinal
                        lote: producto.data().lote, //lote producto semifinal
                        pesoMp: ingreso.data().pesoMp, //peso materia prima
                        fechaEntrada: fechaFormatE.toLocaleString('en-US', { timeZone: 'America/Guayaquil' }),
                        fechaSalida: fechaFormatS.toLocaleString('en-US', { timeZone: 'America/Guayaquil' }),
                        unidades: ingreso.data().unidades,
                        pesoFinal: ingreso.data().pesoFinal,
                        conversion: ingreso.data().conversion,
                        responsable: ingreso.data().responsable,
                        estado: ingreso.data().estado,
                    }
                    response.push(document);
                    return document;
                })
            }
        }))
    }

   if(response.length != 0){
    response.sort(function(a, b){
            if(a.id > b.id){
                return 1
            } else if (a.id < b.id) {
                return -1
            } else {
                return 0
            }
        })
    } 
    return response;
}

async function getInventarioSemifinal(coleccion){
    const query = db.collection(coleccion).where("stock", ">", 0);
    const querySnapshot = await query.get();
    const docs = querySnapshot.docs;

    response = docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombre,
        nombreMp: doc.data().nombreMp,
        stock: doc.data().stock,
    }))

    return response;
}
async function postInventarioSemifinalProceso(coleccion,id,producto,ingreso){
    const doc = db.collection(coleccion).doc(id.producto); 
    const response = await doc.get();

    if (!response.exists) {
        await doc.create(producto);
        await doc.collection('ingresos').doc(id.ingreso.toString()).create(ingreso); 
    } else {
        await doc.collection('ingresos').doc(id.ingreso.toString()).create(ingreso);
    }

}

async function putInventarioSemifinalProceso(coleccion,id,data,stockActualizado){
    const producto = db.collection(coleccion).doc(id.producto);
        await producto.update({
            stock: stockActualizado,
        });
    const ingreso = db.collection(coleccion).doc(id.producto).collection('ingresos').doc(id.ingreso);
        await ingreso.update(data);
}


module.exports = { getInventarioSemifinalProcesos, postInventarioSemifinalProceso, putInventarioSemifinalProceso, getInventarioSemifinal };