// const express = require("express")
import express from "express"
import authRoutes from "./routes/auth.route.js"
import dotenv from "dotenv"
import { connectDB } from "./lib/db.js";


dotenv.config()
const app = express();

app.use(express.json())

app.use("/api/auth" , authRoutes)

app.listen(process.env.PORT || 5001 , () => {
    console.log("Server running on PORT - ", process.env.PORT || 5001)
    connectDB()
})