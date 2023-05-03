import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import { dbConnect } from "./config/db.js";
import { userRoutes } from "./routes/userRoutes.js";
import { postRoutes } from "./routes/postRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3002;
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

dbConnect();

app.get("/", (req, res) => {
    res.send("SM-Clone");
});

app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);

app.listen(PORT, () => console.log(`Server connected to PORT: ${PORT}`));


