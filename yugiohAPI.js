const getAllCartas = () => {
  return fetch("https://db.ygoprodeck.com/api/v7/cardinfo.php")
    .then((response) => response.json())
    .catch((err) => console.error(err));
};

exports.getAllCartas = getAllCartas;
