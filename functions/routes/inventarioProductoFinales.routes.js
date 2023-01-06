const functionsInventario = require('../methods/metodosInventario')
const checkAuth = require('../middleware/checkAuth');
const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')

const db = admin.firestore();

const Timestamp = admin.firestore.Timestamp;

router.get('/inventarioProductoFinal/documents', checkAuth, async (req, res) => {
    try {

        let data = await functionsInventario.getInventarioProductos('inventarioProductoFinal');
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json();
    }
});

//Obtiene todos los productos que esten asociados a un lote
router.get('/inventarioProductoFinal/documents/:id', checkAuth, async (req, res) => {
    try {
        const id = req.params.id;
        let data = await functionsInventario.getProductoLoteId('inventarioProductoFinal',id);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json();
    }
});


router.get('/inventarioProductoFinal/all/documents', checkAuth, async (req, res) => {
    try {

        let data = await functionsInventario.getInventarioFinal('inventarioProductoFinal');
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json();
    }
});

router.post('/inventarioProductoFinal/post', checkAuth, async (req, res) => {
    try {
        const { codigo, nombre, lote_mp, loteMes, lote, n_proceso, fechaEntrada, unidades, pesoFinal, responsable, conversion, estado } = req.body;

        const producto = {
            codigo : codigo,
            nombre: nombre,
            loteMes: loteMes,
            lote: lote,
            stock: pesoFinal,
        }
        const ingreso = {
            loteMp: lote_mp,
            fechaEntrada: Timestamp.fromDate(new Date(fechaEntrada)),
            unidades:unidades,
            pesoFinal: pesoFinal,
            responsable: responsable,
            conversion: conversion,
            estado: estado,
        }
        await functionsInventario.postInventarioProductoFinal('inventarioProductoFinal',n_proceso,producto,ingreso);
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

module.exports = router
