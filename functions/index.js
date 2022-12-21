const functions = require("firebase-functions");
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const serviceAccount = admin.credential.cert("./permisos.json");

const UrlDatabase = "https://hf-trazabilidad-89c0e-default-rtdb.firebaseio.com";

const BUCKET = "hf-trazabilidad-89c0e.appspot.com";

const app= express();

admin.initializeApp({
    credential: serviceAccount,
    databaseURL: UrlDatabase,
    storageBucket:  BUCKET,
})

let corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }

app.use(cors(corsOptions));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
// app.use(express.json());

app.use(require('./routes/listaRolesUsuario.routes'))
app.use(require('./routes/cosechas.routes'))
app.use(require('./routes/usuario.routes'))
app.use(require('./routes/categoriaProductoSemifinal.routes'))
app.use(require('./routes/categoriaProductoFinal.routes'))
app.use(require('./routes/inventarioProductoSemifinales.routes'))
app.use(require('./routes/inventarioProductoFinales.routes'))
app.use(require('./routes/alimentos.routes'))
app.use(require('./routes/actividades.routes'))


exports.app = functions.https.onRequest(app);

