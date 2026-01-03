import express, { urlencoded } from "express"
import "dotenv/config"
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoute.js"
import courseRoute from "./routes/courseRoute.js"
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();
const PORT = process.env.PORT || 3000;


// v imp to set cookies origin and credentials
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(cookieParser())

connectDB();

app.use(express.json()) 
app.use(urlencoded({extended: true}))

app.use("/auth", authRoute);
app.use("/course",courseRoute);

app.get('/',(req,res) => {
    res.send("working")
})


app.listen(PORT, () => {
    console.log("Port listening on: ", PORT);
});