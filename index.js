const yugiohApi = require("./yugiohAPI");

const express = require("express");
const app = express();
const port = 3000;

let cartas = [];

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

app.get("/", (req, res) => {
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
