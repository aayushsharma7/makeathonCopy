import express, { urlencoded } from "express"
import "dotenv/config"
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoute.js"
import courseRoute from "./routes/courseRoute.js"
import cors from 'cors'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors())

connectDB();

app.use(express.json()) 
app.use(urlencoded({extended: true}))

app.use("/login",authRoute);
app.use("/course",courseRoute);

app.get('/',(req,res) => {
    res.send("working")
})


app.listen(PORT, () => {
    console.log("Port listening on: ", PORT);
});