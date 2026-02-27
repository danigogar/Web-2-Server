import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dbConnect from "./config/db.js";
import router from "./routes/index.js";
import errorMiddleware from "./middleware/error.middleware.js";

dotenv.config();
dbConnect();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", router);
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
