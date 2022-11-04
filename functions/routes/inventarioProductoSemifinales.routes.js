const functionsInventario = require('../methods/metodosInventario')

const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')

const db = admin.firestore();

const Timestamp = admin.firestore.Timestamp;

router.get('/inventarioProSemi/documents', async (req, res) => {
    try {

        let data = await functionsInventario.getInventarioProductos('inventarioProductoSemifinal');
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json();
    }
});

router.get('/inventarioProductoSemifinal/proceso/documents', async (req, res) => {
    try {

        let data = await functionsInventario.getInventarioSemifinalProcesos('inventarioProductoSemifinal','En proceso');
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json();
    }
});

router.get('/inventarioProSemi/terminado/documents', async (req, res) => {
    try {

        let data = await functionsInventario.getInventarioSemifinalProcesos('inventarioProductoSemifinal','Terminado');
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json();
    }
});


router.post('/inventarioProductoSemifinal/post', async (req, res) => {
    try {
        const { codigo, nombre_mp, nombre, lote_mp, lote, peso_mp, n_proceso, fechaEntrada, responsable, estado } = req.body;

        const producto = {
            codigo : codigo,
            nombre: nombre,
            nombreMp: nombre_mp,
            lote: lote,
            stock: 0,
        }
        const ingreso = {
            pesoMp: peso_mp,
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


router.put('/inventarioProductoSemifinales/put/:id', async (req, res) => {
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


//Valida si hay stock para fabricar un producto Final y actualiza el stock del producto semifinal a usar para la fabricacion
router.put('/inventarioProductoSemifinales/stock/:codigo', (req, res) => {
    (async () => {
        try {
            const codigo = req.params.codigo;
            let ingreso = req.body.ingreso;
            let total = 0;
            let status = 500;
            const resultado= Array();
            const response= Array();
            const doc = db.collection("inventarioProductoSemifinal").where("codigo", "==", codigo);
            const inventarioSemi = await doc.get();
            const docs = inventarioSemi.docs;
            docs.map(function(doc){
                if(doc.data().stock != 0){
                    document={
                        id: doc.id,
                        lote: doc.data().lote,
                        stock: doc.data().stock,
                    };
                    total += doc.data().stock
                    resultado.push(document);
                    return document;
                }
            });

            if(resultado.length != 0){
                resultado.sort(function(a, b){
                    if(a.lote < b.lote){
                        return 1
                    } else if (a.lote > b.lote) {
                        return -1
                    } else {
                        return 0
                    }
                })

                resultado.every(function(doc){

                    if(ingreso <= total){
                        if(doc.stock >= ingreso){
                            document={
                                lote: doc.lote,
                                salida: ingreso,
                            };
                            response.push(document);
                            db.collection('inventarioProductoSemifinal').doc(doc.id).update({
                                stock: doc.stock - ingreso,
                            })
                            status = 200;
                            return false;
                        }else{
                            document={
                                lote: doc.lote,
                                salida: doc.stock,
                            };

                            db.collection('inventarioProductoSemifinal').doc(doc.id).update({
                                stock: 0,
                            })
                            ingreso -= doc.stock
                            response.push(document);
                            status = 200;
                            return true;
                        }
                    }else{
                        document = {
                            messege : 'stock insuficiente',
                            stock : ingreso - total
                        }

                        response.push(document);
                        status = 500;
                        return false;
                    }

                })
            }else{
                document = {
                    messege : 'stock insuficiente',
                    stock : ingreso
                }

                response.push(document);
                status = 500;
            }

            return res.status(status).json(response);

        } catch (error) {
            return res.status(500).send(error);
        }
    })();
});

module.exports = router
