import express from "express";
import { userRoutes } from "./src/routes/user.routes.js";

const app = express();
app.use(express.json());

// Rota raiz
app.get("/", (req, res) => {
  res.send(`
    <div style="text-align:center; font-family:sans-serif; margin-top:50px;">
      <h1>🎉 Easy Express API está rodando!</h1>
      <p>Use os endpoints abaixo:</p>
      <h2>Available Routes</h2>
    <pre>
      GET, POST /usuarios
      GET, PUT, DELETE /vendas e muito mas/:id
    </pre>
    </div>
  `);
});

// Rota de usuários
app.use("/api/users", userRoutes);

app.listen(3000, () => {
  console.log("API rodando na porta 3000");
});
