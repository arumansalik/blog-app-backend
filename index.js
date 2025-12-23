import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "../server/routes/authRoutes.js";
import postRoutes from "../server/routes/postRoutes.js";
import commentRoutes from "../server/routes/commentRoutes.js";
import userRoutes from "../server/routes/userRoutes.js";
import searchRoutes from "../server/routes/searchRoutes.js";
import exploreRoutes from "../server/routes/exploreRoutes.js";

dotenv.config();
const app = express();
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
    })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/explore", exploreRoutes);


app.get("/", (req, res) => {
    res.send("Blog API running");
});

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("MongoDB Connected");
        app.listen(PORT, () =>
            console.log(`Server running on port ${PORT}`)
        );
    })
    .catch((err) => console.error(err));