const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
// db.settings({ ignoreUndefinedProperties: true });
const auth = admin.auth(app);

const registroEmailPassword = (email, passwd) => {
    return auth.createUser({
        email,
        password: passwd,
        disabled: false,
    });
};

const loginEmailPassword = (email, passwd) => {
    return auth.getUserByEmail(email);
}

exports.db = db;
exports.registroEmailPassword = registroEmailPassword;
exports.loginEmailPassword = loginEmailPassword;
