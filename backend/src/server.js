const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 3001;

pool
  .query("SELECT NOW()")
  .then((result) => {
    console.log("Conexión a PostgreSQL OK:", result.rows[0]);
  })
  .catch((error) => {
    console.error("Error al conectar con PostgreSQL:", error.message);
  });

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log("NODE_ENV actual:", process.env.NODE_ENV);
});