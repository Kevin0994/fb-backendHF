const functionsInventario = require('../methods/metodosInventario')

const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin');
const checkAuth = require('../middleware/checkAuth');

const db = admin.firestore();

const Timestamp = admin.firestore.Timestamp;

router.get('/inventarioProSemi/documents', checkAuth, async (req, res) => {
    try {

        let data = await functionsInventario.getInventarioProductos('inventarioProductoSemifinal');
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json();
    }
});

router.get('/inventarioProductoSemifinal/proceso/documents', checkAuth, async (req, res) => {
    try {

        let data = await functionsInventario.getInventarioSemifinalProcesos('inventarioProductoSemifinal','En proceso');
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json();
    }
});

router.get('/inventarioProSemi/terminado/documents', checkAuth, async (req, res) => {
    try {

        let data = await functionsInventario.getInventarioSemifinalProcesos('inventarioProductoSemifinal','Terminado');
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json();
    }
});


router.post('/inventarioProductoSemifinal/post', checkAuth, async (req, res) => {
    try {
        const { codigo, materiaPrima, nombre, lote_mp, lote, n_proceso, fechaEntrada, responsable, estado } = req.body;

        let refDocument = materiaPrima.map(function(doc){
            return db.doc(doc._path.segments[0]+'/'+doc._path.segments[1]);
        })

        const producto = {
            codigo : codigo,
            nombre: nombre,
            materiaPrima: refDocument,
            lote: lote,
            stock: 0,
        }
        const ingreso = {
            loteMp: lote_mp,
            fechaEntrada: Timestamp.fromDate(new Date(fechaEntrada)),
            responsable: responsable,
            estado: estado,
        }
        let data = await functionsInventario.postInventarioSemifinalProceso('inventarioProductoSemifinal',n_proceso,producto,ingreso);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).send(error);
    }
});


router.put('/inventarioProductoSemifinales/put/:id', checkAuth, async (req, res) => {
    try {
        const { idIngreso, fechaSalida, unidades, stock, pesoFinal, conversion } = req.body;
        const id = {
            producto: req.params.id,
            ingreso: idIngreso,
        }
        const ingreso = {
            unidades: unidades,
            pesoFinal: pesoFinal,
            fechaSalida: Timestamp.fromDate(new Date(fechaSalida)),
            conversion: conversion,
            estado: 'Terminado',
        }
        const stockActualizado = stock;
        await functionsInventario.putInventarioSemifinalProceso('inventarioProductoSemifinal',id,ingreso,stockActualizado);
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});


module.exports = router
