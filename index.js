const yugiohApi = require("./yugiohAPI");
const { db, registroEmailPassword } = require("./firebase");

const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const port = 3000;

/**
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 * -------------------------------- VARIABLES ----------------------------------
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

let cartas = [];

/**
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 * ---------------------------------- CONFIG -----------------------------------
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

// Configuración Express
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.json());

// Habilitar CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
    next();
});

// Puerto de escucha
app.listen(port, () => {
    console.log(`Aplicación funcionando por el puerto: ${port}`);
});

/**
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 * ----------------------------------- BASE ------------------------------------
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

// #region GET

// Root
app.get("/", async (req, res) => {
    const docRef = db.collection("prueba").doc("alovelace");

    await docRef.set({
        first: "Ada",
        last: "Lovelace",
        born: 1815,
    });
    res.send("Hello World!");
});

// #endregion

/**
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 * ---------------------------------- CARTAS -----------------------------------
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

// #region GET

// Obtener cartas
app.get("/cartas", async (req, res) => {
    const cartasTmp = cartas.length === 0 ? (await yugiohApi.getAllCartas()).data : cartas;
    if (cartas.length === 0) cartas = cartasTmp;

    // res.send(cartasTmp ?? []);
    // ! TODO: datos temporales
    res.send(cartasTmp.slice(15, 59) ?? []);
});

// Obtener carta por id
app.get("/cartas/carta/:id", async (req, res) => {
    const cartaId = req.params.id;
    if (cartas.length === 0) cartas = (await yugiohApi.getAllCartas()).data;
    res.send(cartas.find((carta) => carta.id == cartaId));
});

// #endregion

/**
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 * ---------------------------- MANEJO DE SESIONES -----------------------------
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

// #region POST

// LOGIN
app.post("/auth/login", function (req, res) {
    console.log(req.body);
    res.status(200).json({ token: "U55XmHlWId4NStGuN15j5b^3Cspna9uYU98!2Dd55&%3V$I@oB" });
});

// REGISTRO
app.post("/auth/registro", function (req, res) {
    const { email, passwd } = req.body;
    registroEmailPassword(email, passwd)
        .then((userCredential) => {
            const user = userCredential.user;
            // ! TODO: Enviar TOKEN
            res.status(200).json(user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            res.status(500).json({ error: "algo ha salido mal", errorCode, errorMessage });
        });
});

// #endregion
