const { Router, response } = require('express')
const checkAuth = require('../middleware/checkAuth')
const router = Router();
const admin = require('firebase-admin')

const db = admin.firestore()

router.get('/actividades/documents', checkAuth, async (req, res) => {
  try {

    const query = db.collection('actividades');
    const querySnapshot = await query.get();
    const docs = querySnapshot.docs;
    let response = docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json();
  }
});

router.post('/actividades/post', checkAuth, async (req, res) => {
  try {
    await db.collection('actividades').doc().create(req.body);
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json();
  }
})

router.put('/actividades/documents/:id', checkAuth, async (req, res) => {
  try {
      const doc = db.collection('actividades').doc(req.params.id);
      await doc.update(req.body)
      return res.status(200).json();
  } catch (error) {
      return res.status(500).send(error);
  }
});


router.delete('/actividades/documents/:id', checkAuth, async (req, res) => {
  try {
      const doc = db.collection('actividades').doc(req.params.id);
      await doc.delete()
      return res.status(200).json();
  } catch (error) {
      return res.status(500).send(error);
  }
});

module.exports = router
