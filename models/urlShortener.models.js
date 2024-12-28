import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true,
        unique: true,
    },
    customAlias: {
        type: String
    },
    topic: {
        type: String,
        enum: ['acquisition', 'activation', 'retention'],
        default: 'acquisition'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

const Url = mongoose.model("Url", urlSchema);
export default Url;