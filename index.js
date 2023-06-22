const yugiohApi = require("./yugiohAPI");
const { db, registroEmailPassword, loginEmailPassword } = require("./firebase");

const fs = require("fs");
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
const ARCHIVO_CARTAS_STOCK_ID = "cartas_stock_id.json";

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
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
  );
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
app.get("/", (req, res) => {
  //if (cartas.length > 0) addStockCartas();

  res.send("Hola");
});

// Añadir stock aleatorio a cada carta
async function addStockCartas() {
  let cartasIdStock = [...cartas];
  cartasIdStock = cartasIdStock.map((carta) => {
    const stock = Math.floor(Math.random() * 100);
    return {
      id: carta.id,
      stock: stock,
    };
  });

  fs.writeFile(
    ARCHIVO_CARTAS_STOCK_ID,
    JSON.stringify(cartasIdStock),
    (err) => {
      if (err) console.log(err);
      console.log("Escrito con éxito");
    }
  );
}

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
  const page = parseInt(req.query.page) || 1; // Página actual
  const limit = parseInt(req.query.limit) || 30; // Cantidad de elementos por página
  
  if (cartas.length === 0) {
    const cartasTmp = (await yugiohApi.getAllCartas()).data;
    cartas = await mapeoStockCartas(cartasTmp);
  }

  const numTotalPaginas = Math.ceil(cartas.length / limit);

  // ❌🚪
  if (cartas.length == 0){
    res.status(200).json({ data: [], prevPag: null, nextPag: null, numPag: numTotalPaginas, count: null, countTotalCartas: cartas.length });
    return;
  }

  // ❌🚪
  if (page < 1) {
    res.status(200).json({ data: [], prevPag: null, nextPag: 1, numPag: numTotalPaginas, count: null, countTotalCartas: cartas.length });
    return;
  }

  // ❌🚪
  if (page > numTotalPaginas) {
    res.status(200).json({ data: [], prevPag: numTotalPaginas, nextPag: null, numPag: numTotalPaginas, count: null, countTotalCartas: cartas.length });
    return;
  }

  // ✅
  const prevPag = (page == 1) ? null : page - 1;
  const nextPag = (page == numTotalPaginas) ? null : page + 1;
  const data = cartas.slice((page - 1) * limit, page * limit);
  res.status(200).json({ data, prevPag, nextPag, numPag: numTotalPaginas, count: data.length, countTotalCartas: cartas.length });
});

// Añadir a cada carta su stock almacenado en el JSON
async function mapeoStockCartas(cartasTmp) {
  const cartasIdStockJSON = fs.readFileSync(ARCHIVO_CARTAS_STOCK_ID, "utf-8");
  let cartasIdStock = JSON.parse(cartasIdStockJSON);
  cartasTmp = cartasTmp.map((carta) => {
    const cartaStockIndex = cartasIdStock.findIndex((c) => c.id == carta.id);
    if (cartaStockIndex > -1) {
      const stockCarta = cartasIdStock[cartaStockIndex];
      cartasIdStock.splice(cartaStockIndex, 1);
      return { ...carta, stock: stockCarta.stock };
    }
  });
  return cartasTmp;
}

// Obtener carta por id
app.get("/cartas/carta/:id", async (req, res) => {
  const cartaId = req.params.id;
  if (cartas.length === 0) cartas = (await yugiohApi.getAllCartas()).data;
  res.send(cartas.find((carta) => carta?.id == cartaId));
});

// Obtener cartas del carrito
app.post("/cartas/carrito", async (req, res) => {
  const itemsCarrito = req.body.itemsCarrito;
  if (cartas.length === 0) cartas = (await yugiohApi.getAllCartas()).data;
  let cartasCarrito = [];
  for (let i = 0; i < itemsCarrito.length; i++) {
    const carta = cartas.find((carta) => carta?.id == itemsCarrito[i].id);
    cartasCarrito.push({
      ...carta,
      cantidad: itemsCarrito[i].cantidad,
    });
  }
  res.send(cartasCarrito);
});

app.get("/admin/sync", async (req, res) => {
  const cartasAPI = (await yugiohApi.getAllCartas()).data;
  const fileJSON = fs.readFileSync(ARCHIVO_CARTAS_STOCK_ID, "utf-8");
  let cartasJSON = JSON.parse(fileJSON);

  if (cartasAPI.length === cartasJSON.length) {
    res.send("son iguales");
  } else {
    cartasJSON.forEach((cartaJSON) => {
      const cartaAPIIndex = cartasAPI.findIndex((c) => c.id == cartaJSON.id);
      cartasAPI.splice(cartaAPIIndex, 1);
    });

    for (let i = 0; i < cartasAPI.length; i++) {
      const cartaAPI = cartasAPI[i];

      const stock = Math.floor(Math.random() * 100);
      cartasJSON.push({
        id: cartaAPI.id,
        stock: stock,
      });
    }

    fs.writeFile(ARCHIVO_CARTAS_STOCK_ID, JSON.stringify(cartasJSON), (err) => {
      if (err) console.log(err);
      console.log("escrito con exito");
    });

    res.send("datos actualizados");
  }
});


app.get("/refresh/:id", async (req, res) => {
  const id = req.params.id;
  let user = (await db.collection("usuarios").doc(id).get()).data();
  res.status(200).json({ ...user, id });
})

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
  const { email, passwd } = req.body;
  loginEmailPassword(email, passwd)
    .then(async (userCredential) => {
      const userData = (
        await db.collection("usuarios").doc(userCredential.uid).get()
      ).data();

      // ! TODO: Enviar TOKEN
      res.status(200).json({ ...userData, id: userCredential.uid });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      res
        .status(500)
        .json({ error: "algo ha salido mal", errorCode, errorMessage });
    });
});

// REGISTRO
app.post("/auth/registro", function (req, res) {
  const { email, passwd } = req.body;
  registroEmailPassword(email, passwd)
    .then(async (userCredential) => {
      const docRef = db.collection("usuarios").doc(userCredential.uid);

      await docRef.set({
        email: userCredential.email ?? "",
        emailVerified: userCredential.emailVerified ?? false,
        disabled: userCredential.disabled ?? false,
      });
      // ! TODO: Enviar TOKEN
      res.status(200).json({
        email: userCredential.email ?? "",
        emailVerified: userCredential.emailVerified ?? false,
        disabled: userCredential.disabled ?? false,
        id: userCredential.uid,
      });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      res
        .status(500)
        .json({ error: "algo ha salido mal", errorCode, errorMessage });
    });
});

// RECEPCION DE DATOS DE COMPRA
app.post("/compra", function (req, res) {
  const { details, userId } = req.body;

  console.log(details.id);

  const docRef = db.collection("facturas").doc(details.id);
  docRef.set({
    idUsuario: userId,
    numeroPedido: details.id,
    fecha: details.create_time,
    datosEnvio: details.purchase_units[0].shipping,
    datosPago: details.payer,
    datosItems: details.purchase_units[0].items,
    total: details.purchase_units[0].amount.value,
  });

  const docRefUsuarios = db.collection("usuarios").doc(userId);
  docRefUsuarios.get().then((doc) => {
    const facturas = doc.data().facturas || [];
    facturas.push(details.id);
    docRefUsuarios.update({ facturas });
  });

  // ! TODO: revisar fallo
  //actualizarStock(details.purchase_units[0].items);

  res.status(200).json({
    idUsuario: userId,
    numeroPedido: details.id,
    fecha: details.create_time,
    datosEnvio: details.purchase_units[0].shipping,
    datosPago: details.payer,
    datosItems: details.purchase_units[0].items,
    total: details.purchase_units[0].amount.value,
  });
});

// MOSTRAR FACTURAS DEL USUARIO
app.post("/facturas", async function (req, res) {
  const { userId } = req.body;

  let idFacturas = [];

  const docRefUsuarios = db.collection("usuarios").doc(userId);

  idFacturas = (await docRefUsuarios.get()).data().facturas || [];

  let facturas = [];

  for (let i = 0; i < idFacturas.length; i++) {
    const factura = db.collection("facturas").doc(idFacturas[i]);
    facturas.push(await factura.get());
  }

  res.status(200).json({
    facturas: facturas
  });
});

function actualizarStock(items) {
  const cartasJSONFile = fs.readFileSync(ARCHIVO_CARTAS_STOCK_ID, "utf-8");
  let cartasJSON = JSON.parse(cartasJSONFile);

  items.forEach((item) => {
    //actualizar array Cartas
    const cartaIndex = cartas.findIndex((carta) => carta.name == item.name);
    if (cartaIndex > -1) {
      const cartaTMP = cartas[cartaIndex];
      cartas[cartaIndex].stock -= item.quantity;
      //actualizar JSON
      const cartaJSONIndex = cartasJSON.findIndex(
        (carta) => carta.id == cartaTMP.id
      );
      cartasJSON[cartaJSONIndex].stock -= item.quantity;
    }
  });

  fs.writeFile(ARCHIVO_CARTAS_STOCK_ID, JSON.stringify(cartasJSON), (err) => {
    if (err) console.log(err);
    console.log("escrito con exito");
  });
}

// #endregion
