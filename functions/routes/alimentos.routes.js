const functionsCrud = require('../methods/metodosCrud')
const functionsInventario = require('../methods/metodosInventario')
const checkAuth = require('../middleware/checkAuth')
const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')

const db = admin.firestore();


router.get('/alimentos/documents', checkAuth, async (req, res) => {
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
router.post('/alimentos/validate/get', checkAuth, async (req, res) => {
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
router.post('/alimentos/post', checkAuth, async (req, res) => {
    try {
        const { codigo, nombre } = req.body;
        const categoria = {
            codigo: codigo,
            nombre: nombre,
        }
        let validacion =await functionsCrud.validarAlimentoRepetido('listaCosechas',codigo);

        if(validacion){
            let idDocument = await functionsCrud.insertarDocumento('listaCosechas',categoria);

            let response = {
                status : true,
                id : idDocument,
            }
    
            return res.status(200).json(response);
        }else{
            let response = {
                message : 'Ya existe un alimento con este codigo'
            }
            return res.status(500).send(response);
        }

    } catch (error) {
        return res.status(500).send(error);
    }
});

router.put('/alimentos/put/:id', checkAuth, async (req, res) => {
    try {
        const id= req.params.id;
        let validacion = true;
        const { codigo, nombre, oldCodigo } = req.body;
        const alimento = {
            codigo: codigo,
            nombre: nombre,
        }
        if(codigo != oldCodigo){
            validacion = await functionsCrud.validarAlimentoRepetido('listaCosechas',codigo);
        }
        

        if(validacion){
            await functionsCrud.editarDocumento('listaCosechas',id,alimento);
            let response = {
                status : false,
            }
    
            return res.status(200).json(response);
        }else{
            let response = {
                message : 'Ya existe un alimento con este codigo'
            }
            return res.status(500).send(response);
        }
       
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.delete('/alimentos/delete/:id', checkAuth, async (req, res) => {
    try {
        const id = req.params.id;
        await functionsCrud.deleteDocumentoId('listaCosechas',id);
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

//Obtiene la informacion de la lista de coasechas, productosSemifinales y productosFinales
router.get('/productos/alldocuments', checkAuth, async (req, res) => {
    try {

        let data = await functionsCrud.getAlimentoProductos();

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json();
    }
});


//Valida si hay stock para fabricar un producto Final y actualiza el stock del producto semifinal a usar para la fabricacion
router.post('/inventarioProducto/stock/', checkAuth, async (req, res) => {
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
