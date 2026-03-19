import express from "express"
import "dotenv/config"
import dbConnector from "./config/dbConnector.js"
import router from "./routes/allRoutes.js"
import session from "express-session"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import multer from "multer"


const app = express()
const PORT = process.env.PORT || 3000


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json())
app.use(cors({
    origin : "http://localhost:5173",
    credentials : true
}))


app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false , sameSite : "lax" , httpOnly : false }
}))

app.get("/" , (req , res) => {
    res.send("The server is working!")
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

dbConnector()

app.use("/api" , router)

app.listen(PORT , () => {
    console.log("The server is working");
})