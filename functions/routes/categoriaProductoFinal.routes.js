
const functionsCrud = require('../methods/metodosCrud')
const functionsCategoria = require('../methods/metodosCategoria')
const functionStorage = require('../services/firebase-storage')
const checkAuth = require('../middleware/checkAuth')
const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')

const db = admin.firestore()

//obtener todas las categorias de los productos finales
router.get('/categoriaProductoFinal/documents', checkAuth, async (req, res) => {
    try {

        let data = await functionsCategoria.obtenerCategorias('categoriaProductoFinal','productoFinal');
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json();
    }
});

//insertar categoria de productos finales
router.post('/categoriaProductoFinal/post', checkAuth, async (req, res) => {
    try {

        const { nombre, img, status } = req.body;
        let categoria;
        let imagen;
        
        let validacion =await functionsCrud.validarParametroRepetidoCollection('categoriaProductoFinal','nombre',nombre);

        if(!validacion){
            let response = {
                message : 'Ya existe un alimento con este codigo'
            }
            return res.status(500).send(response);
        }

        if(status){
            let urlImg = await functionStorage.uploadImage(img,'categoriaFinal/'+nombre+'/',nombre);
            imagen = {
                url:urlImg.url,
                name:urlImg.reference,
            }

            categoria = {
                nombre:nombre,
                img:imagen
            }
        }else{
            imagen = null;
            categoria = {
                nombre:nombre,
                img: img,
            }
        }

        let idDocument = await functionsCrud.insertarDocumento('categoriaProductoFinal' ,categoria);
        const response = {
            status: true,
            id: idDocument,
            img: imagen,
        };

        //
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).send(error);
    }
});

//actualizar categoria de productos finales
router.put('/categoriaProductoFinal/put/:id', checkAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const { nombre, img, oldNombre, status } = req.body;
        let categoria;
        let imagen;
        let validacion = true;

        if(nombre != oldNombre){
            validacion = await functionsCrud.validarParametroRepetidoCollection('categoriaProductoFinal','nombre',nombre);
        }

        if(!validacion){
            let response = {
                message : 'Ya existe un alimento con este codigo'
            }
            return res.status(500).send(response);
        }

        if(status){
            let urlImg = await functionStorage.updateImage(img,'categoriaFinal/'+nombre+'/',nombre);
            imagen = {
                url:urlImg.url,
                name:urlImg.reference,
            }

            categoria = {
                nombre:nombre,
                img: imagen,
            }
        }else{
            imagen = img;
            categoria = {
                nombre:nombre,
                img: imagen,
            }
        }

        await functionsCrud.editarDocumento('categoriaProductoFinal',id,categoria);
        const response = {
            status: false,
            img:imagen,
        };

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).send(error);
    }
});

//eliminar categoria de productos finales
router.delete('/categoriaProductoFinal/delete/:id', checkAuth, async (req, res) => {
    try {

        let response = await functionsCategoria.deleteCategoria('categoriaProductoFinal', 'productoFinal',req.params.id);
        return res.status(response.status).json(response.messege);

    } catch (error) {
        return res.status(500).send(error);
    }
});


// ======Productos Finales========

//Obtener todos los productos finales asociados a sus categorias
router.get('/productoFinal/documents', checkAuth, async (req, res) => {

    let data = await functionsCategoria.obtenerProductos('categoriaProductoFinal', 'productoFinal');
    return res.status(200).json(data);
});

//Obtener todos los productos Finales asociados a una categoria
router.get('/productoFinal/documents/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let data = await functionsCategoria.getProductosPorCategoria('categoriaProductoFinal', 'productoFinal',id);
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json(error);
    }
});

//Agregar Productos Finales
router.post('/productoFinal/post/', checkAuth, async (req, res) => {
    try {
        const { codigo, categoriaId, nombre, img, receta, status } = req.body;
        let producto;
        let imagen;

        let validacion = await functionsCrud.validarParametroRepetidoProducto('categoriaProductoFinal','productoFinal',categoriaId,'codigo',codigo);

        if(!validacion){
            let response = {
                message : 'Ya existe un alimento con este codigo'
            }
            return res.status(500).send(response);
        }

        let refMateriaPrima =  await functionsCategoria.validarMateriaPrimaFinal(receta);


        if(refMateriaPrima.length != 0){
            producto = {
                codigo:codigo,
                nombre:nombre,
                receta: refMateriaPrima,
            }
    
            if(status){
                let urlImg = await functionStorage.uploadImage(img,'productoFinal/'+nombre+'/',nombre);
                imagen = {
                    url:urlImg.url,
                    name:urlImg.reference,
                }

                producto['img'] = imagen;

            }else{
                imagen = null;
                producto['img'] = img;
            }

            let idDocument = await functionsCategoria.insertarProductos('categoriaProductoFinal',categoriaId, 'productoFinal' ,producto);
            const response = {
                status: true,
                id:idDocument,
                img: imagen,
                refMateriaPrima: refMateriaPrima,
            };

            return res.status(200).json(response);
        }else{
            return res.status(500).send('No se encontro ningun documento referente a la materia prima que se quizo ingresar');
        } 

        return res.status(200).json(refMateriaPrima);

    } catch (error) {
        return res.status(500).send(error);
    }
});

//Actualizar Producto
router.put('/productoFinal/put/:id', checkAuth, async (req, res) => {
    try {
        const { codigo, nombre, img, receta, categoriaId, oldProduct, status } = req.body;
        let id = req.params.id;
        let validacion = true;
        let producto;
        let imagen;

        if(codigo != oldProduct.codigo){
            validacion =await functionsCrud.validarParametroRepetidoProducto('categoriaProductoFinal','productoFinal',categoriaId,'codigo',codigo);
        }

        if(!validacion){
            let response = {
                message : 'Ya existe un alimento con este codigo'
            }
            return res.status(500).send(response);
        }

        let refMateriaPrima =  await functionsCategoria.validarMateriaPrimaFinal(receta);

        if(refMateriaPrima.length != 0){

            const refDocument = {
                id : id,
                categoriaId: categoriaId,
                oldProduct: oldProduct
            }
    
            producto = {
                codigo: codigo,
                nombre:nombre,
                receta: refMateriaPrima,
            }
    
            if(status){ //verifica si existo alguna imagen
                let urlImg = await functionStorage.updateImage(img,'productoFinal/'+nombre+'/',nombre);
                imagen = {
                    url:urlImg.url,
                    name:urlImg.reference,
                }
                producto['img']= imagen;
            }else{
                imagen = img;
                producto['img']= imagen;
            }

            await functionsCategoria.ActualizarProducto('categoriaProductoFinal', 'productoFinal',refDocument ,producto);
            const response = {
                status: false,
                img: imagen,
                refMateriaPrima: refMateriaPrima,
            };

            return res.status(200).json(response);
        }else{
            return res.status(500).send('No se encontro ningun documento referente a la materia prima que se quizo ingresar');
        }

    } catch (error) {
        return res.status(500).send(error);
    }
});


//Eliminar productos Finales
router.delete('/productoFinal/delete/:id/:categoria', checkAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const categoria = req.params.categoria;

        await functionsCategoria.DeleteProducto('categoriaProductoFinal',categoria,'productoFinal' ,id );

        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

module.exports = router