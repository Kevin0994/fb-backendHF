const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')
const FieldValue = admin.firestore.FieldValue;

const db = admin.firestore();

async function insertarDocumento(coleccion,data){
    await db.collection(coleccion).doc().create(data);
}

async function insertarDocumentoId(coleccion,id,data){
    await db.collection(coleccion).doc(id).create(data);
}

module.exports = { insertarDocumento, insertarDocumentoId };