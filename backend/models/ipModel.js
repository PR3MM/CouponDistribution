import mongoose from "mongoose";

const ipSchema = new mongoose.Schema({
    ip: { type: String, unique: true },
    lastClaimTime: { type: Number, required: true }
});

const IPRecord = mongoose.model("IPRecord", ipSchema);
export default IPRecord;
