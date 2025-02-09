import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import { connectDB } from "./lib/db.js";
import cors from "cors"

import { app,server } from "./lib/socket.js"

app.use(cookieParser())
app.use(express.json())
app.use(cors({
        origin: ["http://localhost:5173"],
        credentials: true
    }
))

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

dotenv.config()
const port = process.env.PORT

server.listen(port, ()=>{
    console.log("server running on "+ port);
    connectDB()
})