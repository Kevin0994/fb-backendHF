const functions = require("firebase-functions");
const express = require('express')
const admin = require('firebase-admin')

const app= express();

admin.initializeApp({
    credential: admin.credential.cert('./permisos.json'),
    databaseURL: "https://hf-trazabilidad-89c0e-default-rtdb.firebaseio.com" 
})


app.use(require('./routes/cosecha.routes'))

exports.app = functions.https.onRequest(app);

