const yugiohApi = require("./yugiohAPI");
//const auth = require("./auth");
const miFirebase = require("./firebase");

const bodyParser = require("body-parser");
const authFirebase = require("firebase/auth");
const express = require("express");
const app = express();
const port = 3000;

let cartas = [];

// Configuración Express
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.json());

// Habilitar CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
  );
  next();
});

app.get("/", async (req, res) => {
  const docRef = miFirebase.db.collection("prueba").doc("alovelace");

  await docRef.set({
    first: "Ada",
    last: "Lovelace",
    born: 1815,
  });
  res.send("Hello World!");
});

app.get("/cartas", async (req, res) => {
  const cartasTmp =
    cartas.length === 0 ? (await yugiohApi.getAllCartas()).data : cartas;
  if (cartas.length === 0) cartas = cartasTmp;

  // res.send(cartasTmp ?? []);
  // ! TODO: datos temporales
  res.send(cartasTmp.slice(15, 59) ?? []);
});

app.get("/cartas/carta/:id", async (req, res) => {
  const cartaId = req.params.id;
  if (cartas.length === 0) cartas = (await yugiohApi.getAllCartas()).data;
  res.send(cartas.find((carta) => carta.id == cartaId));
});

/**
 * ---------------------------------------
 * ---------------------------------------
 * --------- MANEJO DE SESIONES ----------
 * ---------------------------------------
 * ---------------------------------------
 *  */
app.post("/auth/login", function (req, res) {
  console.log(req.body);
  res
    .status(200)
    .json({ token: "U55XmHlWId4NStGuN15j5b^3Cspna9uYU98!2Dd55&%3V$I@oB" });
});

app.post("/auth/registro", function (req, res) {
  const { email, passwd } = req.body;
  console.log({ email, passwd });

  miFirebase.registro(email, passwd);
  
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
