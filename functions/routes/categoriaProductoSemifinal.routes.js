
const functionsCrud = require('../methods/metodosCrud')
const functionsCategoria = require('../methods/metodosCategoria')
const functionStorage = require('../services/firebase-storage')
const checkAuth = require('../middleware/checkAuth');
const { Router } = require('express')
const router = Router();

const admin = require('firebase-admin')

const db = admin.firestore();

//obtener todas las categorias de los productos semifinales
router.get('/categoriaProductoSemi/documents', checkAuth, async (req, res) => {
    try {
        let data = await functionsCategoria.obtenerCategorias('categoriaProductoSemifinal','productoSemifinal');
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json();
    }
});

//insertar categoria de productos semifinales
router.post('/categoriaProductoSemi/post', checkAuth, async (req, res) => {
    try {
        const { nombre, img, status } = req.body;
        let categoria;
        let imagen;

        let validacion =await functionsCrud.validarParametroRepetidoCollection('categoriaProductoSemifinal','nombre',nombre);

        if(!validacion){
            let response = {
                message : 'Ya existe un alimento con este codigo'
            }
            return res.status(500).send(response);
        }

        if(status){
            let urlImg = await functionStorage.uploadImage(img,'categoriaSemifinal/'+nombre+'/',nombre);
            imagen = {
                url:urlImg.url,
                name:urlImg.reference,
            }

            categoria = {
                nombre:nombre,
                img:imagen
            }
        }else{
            categoria = {
                nombre:nombre,
                img: img,
            }
        }

        let idDocument = await functionsCrud.insertarDocumento('categoriaProductoSemifinal' ,categoria);
        const response = {
            status: true,
            id: idDocument,
            img: imagen,
        };

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).send(error);
    }
});

//actualizar categoria de productos semifinales
router.put('/categoriaProductoSemi/put/:id', checkAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const { nombre, img, oldNombre, status } = req.body;
        let categoria;
        let imagen;
        let validacion = true;


        if(nombre != oldNombre){
            validacion = await functionsCrud.validarParametroRepetidoCollection('categoriaProductoSemifinal','nombre',nombre);
        }

        if(!validacion){
            let response = {
                message : 'Ya existe un alimento con este codigo'
            }
            return res.status(500).send(response);
        }


        if(status){ //verifica si existo alguna imagen
            let urlImg = await functionStorage.updateImage(img,'categoriaSemifinal/'+nombre+'/',nombre);
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

        await functionsCrud.editarDocumento('categoriaProductoSemifinal',id,categoria);
        const response = {
            status: false,
            img:imagen,
        };

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).send(error);
    }
});

//eliminar categoria de productos semifinales
router.delete('/categoriaProductoSemi/delete/:id', checkAuth, async (req, res) => {
    try {
        let response = await functionsCategoria.deleteCategoria('categoriaProductoSemifinal','productoSemifinal',req.params.id);
        return res.status(response.status).json(response.messege);
    } catch (error) {
        return res.status(500).send(error.error);
    }
});

//======FUNCIONES DE PRODUCTOS========

//Obtener todos los productos semifinales asociados a sus categorias
router.get('/productoSemi/documents', checkAuth, async (req, res) => {
    try {

        let data = await functionsCategoria.obtenerProductos('categoriaProductoSemifinal' ,'productoSemifinal');
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json(error);
    }
});
//Obtener todos los productos semifinales asociados a una categoria
router.get('/productoSemi/documents/:id', checkAuth, async (req, res) => {
    try {
        const id = req.params.id;
        let data = await functionsCategoria.getProductosPorCategoria('categoriaProductoSemifinal','productoSemifinal',id);
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json(error);
    }
});

//Buscar un producto por id
router.get('/productoSemi/:idCategoria/:id', checkAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const idCategoria = req.params.idCategoria;
        let data = await functionsCategoria.getProducto('categoriaProductoSemifinal','productoSemifinal',idCategoria,id);
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json(error);
    }
});

//Agregar Productos
router.post('/productoSemi/post/', checkAuth, async (req, res) => {
    try {
        //
        const { codigo, categoriaId, nombre, img, materiaPrima, status } = req.body;
        let producto;
        let imagen;

        let validacion =await functionsCrud.validarParametroRepetidoProducto('categoriaProductoSemifinal','productoSemifinal',categoriaId,'codigo',codigo);

        if(!validacion){
            let response = {
                message : 'Ya existe un alimento con este codigo'
            }
            return res.status(500).send(response);
        }

        let refMateriaPrima =  await functionsCategoria.validarMateriaPrimaSemi(materiaPrima);

        if(refMateriaPrima.length != 0){
            producto = {
                codigo:codigo,
                nombre:nombre,
                materiaPrima: refMateriaPrima,
            }
    
            if(status){
                let urlImg = await functionStorage.uploadImage(img,'productoSemifinal/'+nombre+'/',nombre);
                imagen = {
                    url:urlImg.url,
                    name:urlImg.reference,
                }
    
                producto['img'] = imagen;
            }else{
                imagen = null;
                producto['img'] = img;
            }
    
            let idDocument = await functionsCategoria.insertarProductos('categoriaProductoSemifinal',categoriaId,'productoSemifinal' ,producto);
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

    } catch (error) {
        return res.status(500).send(error);
    }
});

//Actualizar Producto
router.put('/productoSemi/put/:id', checkAuth, async (req, res) => {
    try {
        const { codigo, nombre, img, materiaPrima, categoriaId, oldProduct, status } = req.body;
        let id = req.params.id;
        let validacion = true;
        let producto;
        let imagen;

        if(codigo != oldProduct.codigo){
            validacion =await functionsCrud.validarParametroRepetidoProducto('categoriaProductoSemifinal','productoSemifinal',categoriaId,'codigo',codigo);
        }

        if(!validacion){
            let response = {
                message : 'Ya existe un alimento con este codigo'
            }
            return res.status(500).send(response);
        }


        let refMateriaPrima =  await functionsCategoria.validarMateriaPrimaSemi(materiaPrima);

        if(refMateriaPrima.length != 0){
            const refDocument = {
                id : id,
                categoriaId: categoriaId,
                oldProduct: oldProduct
            }

            producto = {
                codigo: codigo,
                nombre:nombre,
                materiaPrima: refMateriaPrima,
            }

            if(status){
                let urlImg = await functionStorage.updateImage(img,'productoSemifinal/'+nombre+'/',nombre);
                imagen = {
                    url:urlImg.url,
                    name:urlImg.reference,
                }

                producto['img'] = imagen;
            }else{
                imagen = img;
                producto['img'] = img;
            }

            await functionsCategoria.ActualizarProducto('categoriaProductoSemifinal','productoSemifinal', refDocument ,producto);
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

//eliminar productos semifinales
router.delete('/productoSemi/delete/:id/:categoria', checkAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const categoria = req.params.categoria;

        await functionsCategoria.DeleteProducto('categoriaProductoSemifinal',categoria,'productoSemifinal' ,id );

        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});



module.exports = router