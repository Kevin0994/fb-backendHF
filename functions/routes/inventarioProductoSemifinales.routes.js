const functionsInventario = require('../methods/metodosInventario')

const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin');
const checkAuth = require('../middleware/checkAuth');

const db = admin.firestore();

const Timestamp = admin.firestore.Timestamp;

//Obtiene todos los lotes de los productos Semifinales
router.get('/inventarioProSemi/documents', checkAuth, async (req, res) => {
    try {

        let data = await functionsInventario.getInventarioProductos('inventarioProductoSemifinal');
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json();
    }
});

//Obtiene todos los productos que esten asociados a un lote
router.get('/inventarioProSemi/documents/:id', checkAuth, async (req, res) => {
    try {
        const id = req.params.id;
        let data = await functionsInventario.getProductoLoteId('inventarioProductoSemifinal',id);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json();
    }
});


//Obtiene todos los productos que esten en elaboracion en curso
router.get('/inventarioProductoSemifinal/proceso/documents', checkAuth, async (req, res) => {
    try {

        let data = await functionsInventario.getInventarioSemifinalProcesos('inventarioProductoSemifinal','En proceso');
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json();
    }
});

//Obtiene todos los productos que esten terminados
router.get('/inventarioProSemi/terminado/documents', checkAuth, async (req, res) => {
    try {

        let data = await functionsInventario.getInventarioSemifinalProcesos('inventarioProductoSemifinal','Terminado');
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json();
    }
});

//ingresa productos en el lote que corresponden
router.post('/inventarioProductoSemifinal/post', checkAuth, async (req, res) => {
    try {
        const { codigo, nombre, lote_mp, lote, loteMes, n_proceso, fechaEntrada, responsable, estado } = req.body;

        const producto = {
            codigo : codigo,
            nombre: nombre,
            loteMes: loteMes,
            lote: lote,
            stock: 0,
        }
        const ingreso = {
            loteMp: lote_mp,
            fechaEntrada: Timestamp.fromDate(new Date(fechaEntrada)),
            responsable: responsable,
            estado: estado,
        }

        await functionsInventario.postInventarioSemifinalProceso('inventarioProductoSemifinal',n_proceso,producto,ingreso);
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

//actualiza los productos que hayan terminado su elaboracion
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
