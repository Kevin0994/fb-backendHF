const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')
const FieldValue = admin.firestore.FieldValue;

const db = admin.firestore();

async function getProductosID(materiaPrima){

    await Promise.all(materiaPrima.map(async function(doc,index,array){
        let segments = doc.id._path.segments;
        let query;
        let querySnapshot;
        if(segments[0] === 'listaCosechas'){
            query = db.collection('listaCosechas').doc(segments[1]);
            querySnapshot = await query.get();
            if (querySnapshot.exists) {
                array[index]['nombre'] = querySnapshot.data().nombre;
            }else{
                array[index]['nombre']='no encontrado';
            }
        }

        if(segments[0] === 'categoriaProductoSemifinal'){
            query = db.collection('categoriaProductoSemifinal').doc(segments[1]).collection('productoSemifinal').doc(segments[3]);
            querySnapshot = await query.get();
            if (querySnapshot.exists) {
                array[index]['nombre'] = querySnapshot.data().nombre;
            }else{
                array[index]['nombre']='no encontrado';
            }

        }

        if(segments[0] === 'categoriaProductoFinal'){
            query = db.collection('categoriaProductoFinal').doc(segments[1]).collection('productoFinal').doc(segments[3]);
            querySnapshot = await query.get();
            if (querySnapshot.exists) {
                array[index]['nombre'] = querySnapshot.data().nombre;
            }else{
                array[index]['nombre']='no encontrado';
            }

        }
    }))

    return materiaPrima;

}

async function getAlimentoProductos(){

    const queryAlimentos = db.collection('listaCosechas');
    const querySnapshotA = await queryAlimentos.get();
    const docsAlimentos = querySnapshotA.docs;

    let response = docsAlimentos.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombre,
    }))

    const querySemifinal = db.collectionGroup('productoSemifinal');
    const querySnapshotSemi = await querySemifinal.get();
    const docsProductosSemi = querySnapshotSemi.docs;

    docsProductosSemi.map(async function(producto){

        document = {
            id: producto.id,
            categoria: producto._ref._path.segments[1],
            nombre: producto.data().nombre,
        }
        response.push(document);

    })
   
    const queryFinal = db.collectionGroup('productoFinal');
    const querySnapshotFinal = await queryFinal.get();
    const docsProductosFinal = querySnapshotFinal.docs;

    docsProductosFinal.map(async function(producto){

        document = {
            id: producto.id,
            categoria: producto._ref._path.segments[1],
            nombre: producto.data().nombre,
        }
        response.push(document);

    })

    response.sort(function(a, b){ //Ordena el array de manera Descendente
        if(a.nombre > b.nombre){
            return 1
        } else if (a.nombre < b.nombre) {
            return -1
        } else {
            return 0
        }
    })

    return response;
}

async function obtenerAlimentos(coleccion){
    let query = db.collection(coleccion);
    let querySnapshot = await query.get();
    let response = querySnapshot.docs.map(doc =>({
        id: doc.id,
        nombre: doc.data().nombre,
    }))

    return response;
}

async function insertarDocumento(coleccion,data){
    await db.collection(coleccion).doc().create(data);
}

async function insertarDocumentoId(coleccion,id,data){
    console.log(data);
    await db.collection(coleccion).doc(id).create(data);
}

async function editarDocumentoId(coleccion,idOld,id,data){
    await db.collection(coleccion).doc(idOld).delete();
    await db.collection(coleccion).doc(id).create(data);
}

async function deleteDocumentoId(coleccion,id){
    await db.collection(coleccion).doc(id).delete();
}


module.exports = { getProductosID, insertarDocumento, insertarDocumentoId, editarDocumentoId, deleteDocumentoId, obtenerAlimentos, getAlimentoProductos };