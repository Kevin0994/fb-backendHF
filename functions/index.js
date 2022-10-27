const functions = require("firebase-functions");
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app= express();

admin.initializeApp({
    credential: admin.credential.cert('./permisos.json'),
    databaseURL: "https://hf-trazabilidad-89c0e-default-rtdb.firebaseio.com" 
})

app.use(cors());

app.use(require('./routes/listaRolesUsuario.routes'))
app.use(require('./routes/cosechas.routes'))
app.use(require('./routes/usuario.routes'))
app.use(require('./routes/categoriaProductoSemifinal.routes'))
app.use(require('./routes/categoriaProductoFinal.routes'))
app.use(require('./routes/inventarioProductoSemifinales.routes'))
app.use(require('./routes/alimentos.routes'))


exports.app = functions.https.onRequest(app);

