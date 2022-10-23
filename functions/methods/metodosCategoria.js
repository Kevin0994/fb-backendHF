const { Router} = require('express')
const router = Router();

const admin = require('firebase-admin')
const FieldValue = admin.firestore.FieldValue;

const db = admin.firestore();

async function obtenerCategorias(collecion){
    const query = db.collection(collecion);
    const querySnapshot = await query.get();
    const docs = querySnapshot.docs;
    let response = await Promise.all(docs.map(async function(doc){ //Creamos un map asyncrono
        let consulta = query.doc(doc.id).collection('productos'); //realizamos la consulta a la collecion productos
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

async function editarCategoria(collecion,idOld,id,data){

    const queryCategoria = db.collection(collecion).doc(idOld);

    //Verifica si se edito el id de la categoria
    if(idOld === id){ //si no se edito el id solo se actualiza el nombre e imagen de la categoria
        queryCategoria.update(data);

    }else{

        const queryProductos = queryCategoria.collection('productos');
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
            query = db.collection(collecion).doc(id).collection('productos'); // si encuentra productos los ingresa en la nueva
            await Promise.all(productos.map(async function(pro){
                await query.doc(pro.id)
                .set({
                    img: pro.img,
                    nombre: pro.nombre,
                    materiaPrima: pro.materiaPrima,
                })
            }))

            await queryCategoria.collection('productos').listDocuments().then(val => {// Borra los productos asociados de la anterior categoria
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

async function deleteCategoria(collecion,id){

    let response;
    const doc = db.collection(collecion).doc(id);
    let productos = await  db.collection(collecion).doc(id).collection('productos').listDocuments();
    if(productos.length == 0){
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

async function obtenerProductos(collecion,tabla){
    const query = db.collectionGroup(collecion);
    const querySnapshot = await query.get();
    const docs = querySnapshot.docs;
    const response =  await Promise.all(docs.map(async function(productos){
        let producto;
        let nombreCategoria;
            if(tabla === 'Semi'){
                nombreCategoria = await db.collection('categoriaProductoSemifinal').doc(productos._ref._path.segments[1]).get();
                producto = productos.data().materiaPrima._path.segments[1];
            }
            if(tabla === 'Final'){
                nombreCategoria = await db.collection('categoriaProductoFinal').doc(productos._ref._path.segments[1]).get();
                producto = {
                    categoria: productos.data().materiaPrima._path.segments[1],
                    producto:  productos.data().materiaPrima._path.segments[3]
                }
            }
            document = {
                id: productos.id,
                categoriaId: productos._ref._path.segments[1],
                categoria: nombreCategoria.data().nombre,
                nombre: productos.data().nombre,
                img: productos.data().img,
                materiaPrima: producto, //reorganizamos el array de referencia que nos da firebase para que solo entrege el id de la materia prima
            }
            return document;
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
async function getProductosPorCategoria(collecion,subcollecion,tabla,id){

    const query = db.collection(collecion).doc(id).collection(subcollecion);
    const querySnapshot = await query.get();
    const docs = querySnapshot.docs;
    let response = await Promise.all(docs.map(async function (productos){
        if(tabla === 'Semi'){
            categoria = await db.collection('categoriaProductoSemifinal').doc(productos._ref._path.segments[1]).get();
            producto = productos.data().materiaPrima._path.segments[1];
        }
        if(tabla === 'Final'){
            categoria = await db.collection('categoriaProductoFinal').doc(productos._ref._path.segments[1]).get();
            producto = {
                categoria: productos.data().materiaPrima._path.segments[1],
                producto:  productos.data().materiaPrima._path.segments[3]
            }
        }
        document = {
            id: productos.id,
            img: productos.data().img,
            categoriaId: productos._ref._path.segments[1],
            categoria: categoria.data().nombre,
            nombre: productos.data().nombre,
            materiaPrima: producto,
        }
        return document;
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


async function insertarProductos(collecion,idCategoria,subcollecion,id,data){

    const query = db.collection(collecion).doc(idCategoria);
    await query.collection(subcollecion).doc(id).create(data);
}

//Actualizar productos
async function ActualizarProductoSemi(collecion,categoria, subcollecion, document,data){

    const query = db.collection(collecion);

    if(document.idOld == document.id && categoria.idOld == categoria.id){
        await query.doc(categoria.idOld).collection(subcollecion).doc(document.idOld).update(data);
    }

}

//Eiminar un producto de una categoria
async function DeleteProducto(collecion,categoria, subcollecion, id,){
    await db.collection(collecion).doc(categoria).collection(subcollecion).doc(id).delete();
}

module.exports = { obtenerCategorias,
    editarCategoria,
    deleteCategoria,
    obtenerProductos,
    getProducto,
    insertarProductos,
    ActualizarProductoSemi,
    getProductosPorCategoria,
    DeleteProducto,
};