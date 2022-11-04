const functionsInventario = require('../methods/metodosInventario')

const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')

const db = admin.firestore();

const Timestamp = admin.firestore.Timestamp;

router.get('/inventarioProductoFinal/documents', async (req, res) => {
    try {

        let data = await functionsInventario.getInventarioProductos('inventarioProductoFinal');
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json();
    }
});

router.post('/inventarioProductoFinal/post', async (req, res) => {
    try {
        const { codigo, nombre_mp, nombre, lote_mp, lote, peso_mp, n_proceso, fechaEntrada, unidades, pesoFinal, responsable, estado } = req.body;

        const producto = {
            codigo : codigo,
            nombre: nombre,
            nombreMp: nombre_mp,
            lote: lote,
            stock: pesoFinal,
        }
        const ingreso = {
            pesoMp: peso_mp,
            loteMp: lote_mp,
            fechaEntrada: Timestamp.fromDate(new Date(fechaEntrada)),
            unidades:unidades,
            pesoFinal: pesoFinal,
            responsable: responsable,
            estado: estado,
        }
        await functionsInventario.postInventarioProductoFinal('inventarioProductoFinal',n_proceso,producto,ingreso);
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

module.exports = router
