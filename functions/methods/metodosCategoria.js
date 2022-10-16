const { Router, response } = require('express')
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

module.exports = { obtenerCategorias, editarCategoria, deleteCategoria };