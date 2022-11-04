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
            let querySubcollection =  db.collection(coleccion).doc(producto.id).collection('ingresos').where("estado", "==", estado);
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
                        codigo: producto.data().codigo,
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
            let querySubcollection =  db.collection(coleccion).doc(producto.id).collection('ingresos').where("estado", "==", estado);
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
                        codigo: producto.data().codigo,
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

//Obtienes los datos principales de los productos Semifinales y Finales segun sus lotes
async function getInventarioProductos(coleccion){
    const query = db.collection(coleccion).where("stock", ">", 0);
    const querySnapshot = await query.get();
    const docs = querySnapshot.docs;

    response = docs.map(doc => ({
        id: doc.id,
        codigo: doc.data().codigo,
        nombre: doc.data().nombre,
        nombreMp: doc.data().nombreMp,
        lote:  doc.data().lote,
        stock: doc.data().stock,
    }))

    return response;
}


async function postInventarioSemifinalProceso(coleccion,idIngreso,producto,ingreso){

    const queryInventario = db.collection(coleccion);
    const query = db.collection(coleccion).where("nombre", "==", producto.nombre).where("lote", "==", parseInt(producto.lote)); //Busca el inventario por nombre y lote 
    const inventario = await query.get();
    
    if (inventario.docs.length == 0) { //Si no se encontro ningun inventario se ingresa un nuevo inventario
        await queryInventario.add(producto).then(async function(docRef){
            await queryInventario.doc(docRef.id).collection('ingresos').doc(idIngreso.toString()).create(ingreso); 
            });
    } else {
        let idInventario = inventario.docs.map(data =>({id: data.id}))
        await queryInventario.doc(idInventario[0].id).collection('ingresos').doc(idIngreso.toString()).create(ingreso);
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


//Productos Finales

async function getInventarioFinal(coleccion){
    const query = db.collection(coleccion);
    const querySnapshot = await query.get();
    const docs = querySnapshot.docs;
    let response = Array();

        await Promise.all(docs.map(async function (producto){
            let querySubcollection =  db.collection(coleccion).doc(producto.id).collection('ingresos');
            let ingresos = await querySubcollection.get();
            if(ingresos.docs.length != 0){
                ingresos.docs.map(function (ingreso){
                    let fechaFormatE = ingreso.data().fechaEntrada.toDate();
                    document = {
                        loteMp_st: ingreso.data().loteMp.map(function(doc) { //lote materia prima
                            cadena = doc.lote.toString()+ ' ';
                            return cadena;
                        }),
                        loteMp : ingreso.data().loteMp,
                        idProducto: producto.id,
                        codigo: producto.data().codigo,
                        id: ingreso.id, //numero de proceso
                        stock: producto.data().stock,
                        nombreMp:producto.data().nombreMp, //nombre matria prima
                        nombre: producto.data().nombre, //nombre producto semifinal
                        lote: producto.data().lote, //lote producto semifinal
                        pesoMp: ingreso.data().pesoMp, //peso materia prima
                        fechaEntrada: fechaFormatE.toLocaleString('en-US', { timeZone: 'America/Guayaquil' }),
                        unidades: ingreso.data().unidades,
                        pesoFinal: ingreso.data().pesoFinal,
                        responsable: ingreso.data().responsable,
                        estado: ingreso.data().estado,
                    }
                    response.push(document);
                    return document;
                })
            }
        }))
    

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


async function postInventarioProductoFinal(coleccion,idIngreso,producto,ingreso){

    const queryInventario = db.collection(coleccion);
    const query = db.collection(coleccion).where("nombre", "==", producto.nombre).where("lote", "==", parseInt(producto.lote)); //Busca el inventario por nombre y lote 
    const inventario = await query.get();
 
    if (inventario.docs.length == 0) { //Si no se encontro ningun inventario se ingresa un nuevo inventario
        await queryInventario.add(producto).then(async function(docRef){
            await queryInventario.doc(docRef.id).collection('ingresos').doc(idIngreso.toString()).create(ingreso); 
        });
    } else {
       let idInventario = inventario.docs.map(data =>({id: data.id}))
        let queryStock = queryInventario.doc(idInventario[0].id);
        let doc = await queryStock.get();
        let stockInventario = doc.data().stock + ingreso.pesoFinal;
        await queryStock.update({
            stock:stockInventario,
        }) 
        await queryInventario.doc(idInventario[0].id).collection('ingresos').doc(idIngreso.toString()).create(ingreso);
    }

}



module.exports = { getInventarioSemifinalProcesos, postInventarioSemifinalProceso, putInventarioSemifinalProceso, getInventarioProductos ,getInventarioFinal ,postInventarioProductoFinal };