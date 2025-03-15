import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connectdb.js";
import couponRoutes from "./routes/couponRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();
const DATABASE_URL = process.env.MONGO_URI;
connectDB(DATABASE_URL);

const app = express();
const PORT = process.env.PORT || 5000;

// app.use(cors());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", couponRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
