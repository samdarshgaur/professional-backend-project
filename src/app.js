import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from './routes/user.routes.js';

// routes declaration
// when a user goes to "/users", then the app will give control to userRouter in user.router.js file, which further goes to "/register" and make a post request that hits registerUser method in user.controller.js file.
// http://localhost:8000/api/v1/users/register
app.use("/api/v1/users", userRouter);

export { app };