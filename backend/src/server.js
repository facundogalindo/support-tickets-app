const app = require("./app");


const pool = require("./config/db");
const PORT = 3001;
pool
  .query("SELECT NOW()")
  .then((result) => {
    console.log("Conexión a PostgreSQL OK:", result.rows[0]);
  })
  .catch((error) => {
    console.error("Error al conectar con PostgreSQL:", error.message);
  });
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
