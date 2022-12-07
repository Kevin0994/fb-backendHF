const functionsCrud = require('../methods/metodosCrud')
const functionsInventario = require('../methods/metodosInventario')

const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')

const db = admin.firestore();


router.get('/alimentos/documents', async (req, res) => {
    try {

        let data = await functionsCrud.obtenerAlimentos('listaCosechas');

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json();
    }
});

router.get('/alimentos/documents/:id', (req, res) => {
    (async () => {
        try {
            const doc = db.collection('listaCosechas').doc(req.params.id);
            const cosechaHistorial = await doc.get();
            const response = cosechaHistorial.data();
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).send(error);
        }
    })();
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/alimentos/validate/get', async (req, res) => {
    try {
        const materiaPrima  = req.body;

        let response = Array();

        if(materiaPrima[0].id != undefined){
            response = await functionsCrud.getNameProductosMP(materiaPrima);
        }

        if(materiaPrima[0].presentacion != undefined){
            response = await functionsCrud.getNameProductosReceta(materiaPrima);
        }


        return res.status(200).json(materiaPrima);
    } catch (error) {
        return res.status(500).send(error);
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/alimentos/post', async (req, res) => {
    try {
        const { id, nombre } = req.body;
        const categoria = {
            nombre:nombre,
        }
        await functionsCrud.insertarDocumentoId('listaCosechas',id,categoria);
        
        const status = true;

        return res.status(200).json(status);
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.put('/alimentos/put/:id', async (req, res) => {
    try {
        const idOld = req.params.id;
        const { id, nombre } = req.body;
        const alimento = {
            nombre:nombre,
        }
        await functionsCrud.editarDocumentoId('listaCosechas',idOld,id,alimento);
        const status = false;

        return res.status(200).json(status);
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.delete('/alimentos/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await functionsCrud.deleteDocumentoId('listaCosechas',id);
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

//Obtiene la informacion de la lista de coasechas, productosSemifinales y productosFinales
router.get('/productos/alldocuments', async (req, res) => {
    try {

        let data = await functionsCrud.getAlimentoProductos();

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json();
    }
});


//Valida si hay stock para fabricar un producto Final y actualiza el stock del producto semifinal a usar para la fabricacion
router.post('/inventarioProducto/stock/', async (req, res) => {
    try {
        const materiaPrima = req.body;
        let response = Array();

        await Promise.all(materiaPrima.map(async function(doc){
            let reference=doc.id._path.segments[0];
            let collecion='';
            let nameProducto='';
            let ingreso=0;

            if(reference === 'listaCosechas'){
                let resultado;
                collecion = 'cosechas';
                nameProducto = doc.nombre;
                ingreso = doc.peso;
                resultado = await functionsInventario.validateStock(collecion,nameProducto,ingreso);
                resultado = resultado.filter(e => e != null);
                resultado.map(function(result){
                    if(result != null){
                        if(result.status == 500){
                            return res.status(500).send(result);
                        }
                        response.push(result);
                        return;
                    }
                })

            }
            if(reference === 'categoriaProductoSemifinal'){
                let resultado;
                collecion = 'inventarioProductoSemifinal';
                nameProducto = doc.nombre;
                ingreso = doc.peso;
                resultado = await functionsInventario.validateStock(collecion,nameProducto,ingreso);
                resultado = resultado.filter(e => e != null);
                resultado.map(function(result){
                    if(result != null){
                        if(result.status == 500){
                            return res.status(500).send(result);
                        }
                        response.push(result);
                        return;
                    }
                })
            }
            if(reference === 'categoriaProductoFinal'){
                let resultado;
                collecion = 'inventarioProductoFinal';
                nameProducto = doc.nombre;
                ingreso = doc.peso;
                resultado = await functionsInventario.validateStock(collecion,nameProducto,ingreso);
                resultado = resultado.filter(e => e != null);
                resultado.map(function(result){
                    if(result != null){
                        if(result.status == 500){
                            return res.status(500).send(result);
                        }
                        response.push(result);
                        return;
                    }
                })
            }
        }))


        response = await functionsInventario.descontarStock(response);

        return res.status(200).send(response);

    } catch (error) {
        return res.status(500).send(error);
    }
});




module.exports = router
