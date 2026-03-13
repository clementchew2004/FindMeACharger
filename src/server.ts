import { toNodeHandler } from "better-auth/node";
import express from "express";
import { auth } from "./lib/auth";

const app = express();
const port = 8000;

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json());

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});