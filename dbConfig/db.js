import mongoose from 'mongoose';

const connectDb = async()=>{
    try {
        const connectToDb = await mongoose.connect(process.env.MONGO_URI);
        console.log("Database Connected Successfully!");
    } catch (error) {
        console.log("Something Going Wrong When Connecting To Database!");
    }
}
export default connectDb;