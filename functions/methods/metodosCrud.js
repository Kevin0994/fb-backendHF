const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')
const FieldValue = admin.firestore.FieldValue;

const db = admin.firestore();

async function insertarDocumento(coleccion,data){
    await db.collection(coleccion).doc().create(data);
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


module.exports = { insertarDocumento, insertarDocumentoId, editarDocumentoId, deleteDocumentoId, getAlimentoProductos };