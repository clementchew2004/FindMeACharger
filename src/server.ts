import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./lib/auth";


const app = express();
const port = 8000;

app.use(cors());
app.all('/api/auth/{*any}', toNodeHandler(auth));
app.use(express.json());

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});