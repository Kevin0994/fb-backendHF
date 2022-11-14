

var admin = require('firebase-admin');

const uuid = require('uuid-v4');
const BUCKET = "hf-trazabilidad-89c0e.appspot.com";

const bucket = admin.storage().bucket();

const imagenBlanco = 'https://img.freepik.com/foto-gratis/resumen-superficie-texturas-muro-piedra-hormigon-blanco_74190-8189.jpg?w=2000'

async function getImage(img){
  if(!img) return imagenBlanco;
  const imagen = img;
  var file = bucket.file(imagen);

  return await file.getSignedUrl({
    action: 'read',
    expires: '03-09-2491'
  }).then(signedUrls => {
    return signedUrls[0];
  });
}


async function uploadImage(img,directorio,nombreFile){
    if(!img) return imagenBlanco;
    const imagen = img;
    const filename = Date.now() + "." + nombreFile;
    const reference = 'HappyFruit-images/'+ directorio + filename;
    var file = bucket.file(reference);
    base64EncodedImageString = imagen.base.replace(/^data:image\/\w+;base64,/, ''),
    imageBuffer = new Buffer.from(base64EncodedImageString, 'base64');

    const metadata = {
      metadata: {
        // This line is very important. It's to create a download token.
        firebaseStorageDownloadTokens: uuid()
      },
      contentType: imagen.type,
      cacheControl: 'public, max-age=31536000',
    };

    await file.save(imageBuffer, {
        metadata: metadata,
        public: true,
        validation: 'md5'
    })

    return await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491'
    }).then(signedUrls => {
      let response = {
        url: signedUrls[0],
        reference: reference,
      }
      return response;
    });

}

async function updateImage(img,directorio,nombreFile){
  if(!img.imgOld) return;
  const imagen = img;
  const fileOld = bucket.file(imagen.imgOld.name);
  fileOld.exists().then((exists) => {
    if (exists[0]) {
      console.log("File exists");
      fileOld.delete();
    } else {
      console.log("File does not exist");
    }
 })

  const filename = Date.now() + "." + nombreFile;
  const reference = 'HappyFruit-images/'+ directorio + filename;
  const file = bucket.file(reference);
  base64EncodedImageString = imagen.base.replace(/^data:image\/\w+;base64,/, ''),
  imageBuffer = new Buffer.from(base64EncodedImageString, 'base64');

  const metadata = {
    metadata: {
      // This line is very important. It's to create a download token.
      firebaseStorageDownloadTokens: uuid()
    },
    contentType: imagen.type,
    cacheControl: 'public, max-age=31536000',
  };


  await file.save(imageBuffer, {
      metadata: metadata,
      public: true,
      validation: 'md5'
  })

  return await file.getSignedUrl({
    action: 'read',
    expires: '03-09-2491'
  }).then(signedUrls => {
    let response = {
      url: signedUrls[0],
      reference: reference,
    }
    return response;
  });

}

async function deleteImage(img){
  if(!img) return false;
  const file = bucket.file(img)
  file.exists().then((exists) => {
    if (exists[0]) {
      console.log("File exists");
      file.delete();
    } else {
      console.log("File does not exist");
    }
 });

}

module.exports = { uploadImage, updateImage, deleteImage };