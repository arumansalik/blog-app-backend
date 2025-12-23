import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import exploreRoutes from "./routes/exploreRoutes.js";


dotenv.config();
const app = express();
const allowedOrigins = [
    "http://localhost:3000",
    /^https:\/\/blog-app-frontend-.*\.vercel\.app$/
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);

            const isAllowed = allowedOrigins.some((allowed) =>
                allowed instanceof RegExp
                    ? allowed.test(origin)
                    : allowed === origin
            );

            if (isAllowed) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS: " + origin));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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