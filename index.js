const yugiohApi = require("./yugiohAPI");

const express = require("express");
const app = express();
const port = 3000;

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
  const cartas = await yugiohApi.getAllCartas();
  res.send(cartas);
});

app.get("/cartas/carta", (req, res) => {
    res.send("Hello World!");
  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
