import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
    alias:{
        type:String,
        required:true
    },
    timestamp:{
        type:Date,
        default:Date.now
    },
    userAgent:{
        type:String
    },
    ipAddress:{
        type:String
    },
    geoLocation:{
        type:Object
    }
},{timestamps:true});

const Analytics = mongoose.model("Analytics",analyticsSchema);
export default Analytics;