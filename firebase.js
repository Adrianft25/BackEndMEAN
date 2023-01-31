var admin = require("firebase-admin");
const authFirebase = require("firebase/auth");

var serviceAccount = require("./serviceAccountKey.json");

module.exports = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
//const auth = authFirebase.getAuth();
const auth = admin.auth();

const registro = (email, passwd) => {

  authFirebase
    .createUserWithEmailAndPassword(firebase.auth, email, passwd)
    .then((userCredential) => {
      // Signed in
      console.log(userCredential);
      const user = userCredential.user;
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log({errorCode, errorMessage});
      // ..
    });
}

exports.db = db;
exports.auth = auth;
exports.registro = registro;