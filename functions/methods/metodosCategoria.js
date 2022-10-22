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

async function obtenerProductos(collecion){
    const query = db.collection(collecion);
    const querySnapshot = await query.get();
    const docs = querySnapshot.docs;
    let productos = Array();

    await Promise.all(docs.map(async function(categoria){ //Creamos un map asyncrono
        let consulta = query.doc(categoria.id).collection('productos'); //realizamos la consulta a la collecion productos
        let resultado = await consulta.get();
        resultado.docs.map(function (doc){
            document = {
                id: doc.id,
                categoriaId: categoria.id,
                categoria: categoria.data().nombre,
                nombre: doc.data().nombre,
                img: doc.data().img,
                materiaPrima: doc.data().materiaPrima._path.segments[1], //reorganizamos el array de referencia que nos da firebase para que solo entrege el id de la materia prima
            }
            productos.push(document);
        });
    }))

    productos.sort(function(a, b){ //Ordena el array de manera Acendente
        if(a.id > b.id){
            return 1
        } else if (a.id < b.id) {
            return -1
        } else {
            return 0
        }
    })

    return productos;
};

//Obtener productos por categoria
async function getProductosPorCategoria(collecion,id){
    const query = db.collection(collecion).doc(id).collection('productos');
    const querySnapshot = await query.get();
    const docs = querySnapshot.docs;
    let response = docs.map(categoria => ({
        id: categoria.id,
        img: categoria.data().img,
        nombre: categoria.data().nombre,
        materiaPrima: categoria.data().materiaPrima._path.segments[1],
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


async function insertarProductos(collecion,idCategoria,id,data){

    const query = db.collection(collecion).doc(idCategoria);
    await query.collection('productos').doc(id).create(data);
}

//Actualizar productos
async function ActualizarProductoSemi(collecion,document,categoria,data){

    const query = db.collection(collecion);

    if(document.idOld == document.id && categoria.idOld == categoria.id){
        await query.doc(categoria.idOld).collection('productos').doc(document.idOld).update(data);
    }

}

//Eiminar un producto de una categoria
async function DeleteProducto(collecion,id,categoria){
    await db.collection(collecion).doc(categoria).collection('productos').doc(id).delete();
}

module.exports = { obtenerCategorias,
    editarCategoria,
    deleteCategoria,
    obtenerProductos,
    insertarProductos,
    ActualizarProductoSemi,
    getProductosPorCategoria,
    DeleteProducto,
};