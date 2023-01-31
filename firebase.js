const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth(app);

const registroEmailPassword = (email, passwd) => {
    return auth.createUser({
        email,
        emailVerified: false,
        password: passwd,
        photoURL: "http://t2.gstatic.com/licensed-image?q=tbn:ANd9GcQPjutZ9txmd5DBd_DK_pLRo5eMWVHq5MpZBgAxYi6EGXfdv2cj53_zbNR8VZH932q9",
        disabled: false,
    });
};

exports.db = db;
exports.registroEmailPassword = registroEmailPassword;
