import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    name: String,
    description: String,
    value: Number,
    expiryDate: Date,
    claimed: { type: Boolean, default: false }, 
});

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
