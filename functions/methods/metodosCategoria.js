const { Router} = require('express')
const router = Router();
const functionsCrud = require('../methods/metodosCrud')
const functionStorage = require('../services/firebase-storage')

const admin = require('firebase-admin')
const FieldValue = admin.firestore.FieldValue;

const db = admin.firestore();

async function obtenerCategorias(collecion,subcollecion){
    const query = db.collection(collecion);
    const querySnapshot = await query.get();
    const docs = querySnapshot.docs;
    let response = await Promise.all(docs.map(async function(doc){ //Creamos un map asyncrono
        let consulta = query.doc(doc.id).collection(subcollecion); //realizamos la consulta a la collecion productos
        let resultado = await consulta.get();
        let cant = resultado.docs.map(doc => { doc.id }); //Creamos un array con los id de los productos encontrados
        document = {
            id:doc.id,
            nombre: doc.data().nombre,
            img: doc.data().img,
            nProductos: cant.length,
        }
        return document
    }))

    response.sort(function(a, b){ //Ordena el array de manera Acendente
        if(a.nombre > b.nombre){
            return 1
        } else if (a.nombre < b.nombre) {
            return -1
        } else {
            return 0
        }
    })

    return response;
};


async function editarCategoria(collecion,subcollecion,idOld,id,data){

    const queryCategoria = db.collection(collecion).doc(idOld);

    //Verifica si se edito el id de la categoria
    if(idOld === id){ //si no se edito el id solo se actualiza el nombre e imagen de la categoria
        queryCategoria.update(data);

    }else{

        const queryProductos = queryCategoria.collection(subcollecion);
        const resultado = await queryProductos.get();
        let productos = await resultado.docs.map(doc => ({ //Busca y crea un array con los productos asociados a la categoria que se edito el id
            id: doc.id,
            nombre: doc.data().nombre,
            img: doc.data().img,
            materiaPrima: doc.data().materiaPrima,
        }));


        await db.collection(collecion).doc(id) //Ingresa una nueva categoria con el id editado
        .set(data);

        if(productos.length != 0){ //Verifica si hay productos asociados en la anterior categoria
            query = db.collection(collecion).doc(id).collection(subcollecion); // si encuentra productos los ingresa en la nueva
            await Promise.all(productos.map(async function(pro){
                await query.doc(pro.id)
                .set({
                    img: pro.img,
                    nombre: pro.nombre,
                    materiaPrima: pro.materiaPrima,
                })
            }))

            await queryCategoria.collection(subcollecion).listDocuments().then(val => {// Borra los productos asociados de la anterior categoria
                val.map(doc => {
                    doc.delete();
                })
            })

            await queryCategoria.delete(); //Borra la categoria definitivamente
        }else{
            await queryCategoria.delete(); //Borra la categoria definitivamente
        }

    }
}

async function deleteCategoria(collecion, subcollecion,id){

    let response;
    const doc = db.collection(collecion).doc(id);
    let productos = await  db.collection(collecion).doc(id).collection(subcollecion).listDocuments();
    if(productos.length == 0){
        const refImg = await doc.get();
        await functionStorage.deleteImage(refImg.data().img.name);
        await doc.delete();
        return response ={
            messege : 'Ok',
            status : 200
        }
    }else{
        return response ={
            messege : 'No se puede eliminar la categoria porque hay productos asociados a ella',
            status : 400
        }
    }
}

//Productos

async function obtenerProductos(collecion, subcollecion){
    const query = db.collection(collecion);
    const querySnapshot = await query.get();
    const docs = querySnapshot.docs;
    let response = Array();

    await Promise.all(docs.map(async function(categoria){
        let querySubcollection =  query.doc(categoria.id).collection(subcollecion);
        let productos = await querySubcollection.get();
        if(productos.docs.length != 0){
            productos.docs.map(function (producto){
                
                if(subcollecion === 'productoFinal'){
                    document = {
                        id: producto.id,
                        categoriaId: categoria.id,
                        categoria: categoria.data().nombre,
                        nombre: producto.data().nombre,
                        img: producto.data().img,
                        receta: producto.data().receta,
                    }
                    response.push(document);
                    return;
                }

                if(subcollecion === 'productoSemifinal'){
                    document = {
                        id: producto.id,
                        categoriaId: categoria.id,
                        categoria: categoria.data().nombre,
                        nombre: producto.data().nombre,
                        img: producto.data().img,
                        materiaPrima: producto.data().materiaPrima,
                    }
                    response.push(document);
                    return;
                }
            })
        }
    }))

    response.sort(function(a, b){ //Ordena el array de manera Acendente
        if(a.id > b.id){
            return 1
        } else if (a.id < b.id) {
            return -1
        } else {
            return 0
        }
    }) 

    return response;
};

//Obtener productos por categoria
async function getProductosPorCategoria(collecion,subcollecion,id){

    const queryCategoria = db.collection(collecion).doc(id);
    const querySnapshotCategoria = await queryCategoria.get();
    const queryProducto = queryCategoria.collection(subcollecion);
    const querySnapshotProducto = await queryProducto.get();
    const docs = querySnapshotProducto.docs;
    let response = await Promise.all(docs.map(async function (productos){
        if(subcollecion === 'productoFinal'){
            document = {
                id: productos.id,
                img: productos.data().img,
                categoriaId: querySnapshotCategoria.id,
                categoria: querySnapshotCategoria.data().nombre,
                nombre: productos.data().nombre,
                receta: productos.data().receta,
            }
            return document;
        }
        if(subcollecion === 'productoSemifinal'){
            document = {
                id: productos.id,
                img: productos.data().img,
                categoriaId: querySnapshotCategoria.id,
                categoria: querySnapshotCategoria.data().nombre,
                nombre: productos.data().nombre,
                materiaPrima: productos.data().materiaPrima,
            }
            return document;
        }
        
    }));


    response.sort(function(a, b){ //Ordena el array de manera Acendente
        if(a.id > b.id){
            return 1
        } else if (a.id < b.id) {
            return -1
        } else {
            return 0
        }
    })

    return response;
};

//Obtener los datos de un producto mediante una busqueda de id
async function getProducto(collecion,subcollecion,idCategoria,id){

    const query = db.collection(collecion).doc(idCategoria).collection(subcollecion).doc(id);
    const producto = await query.get();
    let response = {
        id: producto.id,
        nombre: producto.data().nombre,
    }

    return response;
};

//validar Materia Prima
async function validarMateriaPrimaSemi(array){
    let query;
    let doc;
    let response = Array();

    await Promise.all(array.map(async function(file){
        query = db.collection('listaCosechas').doc(file.id);
        doc = await query.get();
            if (doc.exists) {
                let document = {
                    id:db.doc('listaCosechas/'+file.id),
                    peso: file.peso,
                }
                response.push(document);
                return;
            }
        query = db.collectionGroup('productoSemifinal').where('nombre' , '==', file.nombre);
        doc = await query.get();
        doc.forEach(docSemi => {
                if(docSemi.id === file.id){
                    let document = {
                        id:db.doc('categoriaProductoSemifinal/'+docSemi._ref._path.segments[1]+'/productoSemifinal/'+file.id),
                        peso: file.peso,
                    }
                    response.push(document);
                    return;
                }
        });
        query = db.collectionGroup('productoFinal').where('nombre' , '==', file.nombre);
        doc = await query.get();
        doc.forEach(docSemi => {
                if(docSemi.id === file.id){
                    let document = {
                        id:db.doc('categoriaProductoFinal/'+docSemi._ref._path.segments[1]+'/productoFinal/'+file.id),
                        peso: file.peso,
                    }
                    response.push(document);
                    return;
                }
        });
    }))

    return response;
}

async function validarMateriaPrimaFinal(array){
    let query;
    let response = Array();

    await Promise.all(array.map(async function(file){
        let ref = {
            presentacion: file.presentacion,
            materiaPrima: Array(),
        };
        await Promise.all(file.materiaPrima.map(async function(refdoc){
            query = db.collection('listaCosechas').doc(refdoc.id);
            doc = await query.get();
                if (doc.exists) {
                    let document = {
                        id:db.doc('listaCosechas/'+refdoc.id),
                        peso: refdoc.peso,
                    }
                    ref['materiaPrima'].push(document);
                    return;
                }
            query = db.collectionGroup('productoSemifinal').where('nombre' , '==', refdoc.nombre);
            doc = await query.get();
            doc.forEach(docSemi => {
                    if(docSemi.id === refdoc.id){
                        let document = {
                            id:db.doc('categoriaProductoSemifinal/'+docSemi._ref._path.segments[1]+'/productoSemifinal/'+refdoc.id),
                            peso: refdoc.peso,
                        }
                        ref['materiaPrima'].push(document);
                        return;
                    }
            });
            query = db.collectionGroup('productoFinal').where('nombre' , '==', refdoc.nombre);
            doc = await query.get();
            doc.forEach(docFinal => {
                    if(docFinal.id === refdoc.id){
                        let document = {
                            id:db.doc('categoriaProductoFinal/'+docFinal._ref._path.segments[1]+'/productoFinal/'+refdoc.id),
                            peso: refdoc.peso,
                        }
                        ref['materiaPrima'].push(document);
                        return;
                    }
            });
        }))

        response.push(ref);
    }))

    return response;
}


//Insertar productos
async function insertarProductos(collecion,idCategoria,subcollecion,id,data){

    const query = db.collection(collecion).doc(idCategoria);
    await query.collection(subcollecion).doc(id).create(data);
}

//Actualizar productos
async function ActualizarProductoSemi(collecion, subcollecion, document,data){

    const query = db.collection(collecion);

    if(document.idOld == document.id && document.categoriaId == document.oldProduct.categoriaId){

        await query.doc(document.categoriaId).collection(subcollecion).doc(document.idOld).update(data);
        return;
    }

    if(document.idOld != document.id && document.categoriaId == document.oldProduct.categoriaId){

        await query.doc(document.categoriaId).collection(subcollecion).doc(document.idOld).delete();
        await query.doc(document.categoriaId).collection(subcollecion).doc(document.id).create(data);
        return;
    }

    if(document.idOld == document.id && document.categoriaId != document.oldProduct.categoriaId){
        await query.doc(document.oldProduct.categoriaId).collection(subcollecion).doc(document.id).delete();
        await query.doc(document.categoriaId).collection(subcollecion).doc(document.id).create(data);
        return;
    }

    if(document.idOld != document.id && document.categoriaId != document.oldProduct.categoriaId){
        await query.doc(document.oldProduct.categoriaId).collection(subcollecion).doc(document.idOld).delete();
        await query.doc(document.categoriaId).collection(subcollecion).doc(document.id).create(data);
        return;
    }

}

//Eiminar un producto de una categoria
async function DeleteProducto(collecion,categoria, subcollecion, id,){

    const queryRef = db.collection(collecion).doc(categoria).collection(subcollecion).doc(id);
    const refImg = await queryRef.get();
    await functionStorage.deleteImage(refImg.data().img.name);
    await queryRef.delete();
}

module.exports = { obtenerCategorias,
    editarCategoria,
    deleteCategoria,
    obtenerProductos,
    getProducto,
    validarMateriaPrimaSemi,
    validarMateriaPrimaFinal,
    insertarProductos,
    ActualizarProductoSemi,
    getProductosPorCategoria,
    DeleteProducto,
};