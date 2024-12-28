import app from './app.js'
import connectDb from './dbConfig/db.js';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3000;

//connect database
connectDb();
app.use("/",(req,res)=>{
    res.send("Welcome to Url Shortener App")
})
app.listen(port,()=>{
    console.log(`Server is running at port http://localhost:${port}`);
})
