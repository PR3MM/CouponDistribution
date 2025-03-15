import express from "express";
import requestIp from "request-ip";
import Coupon from "../models/couponModel.js";
import IPRecord from "../models/ipModel.js";

const router = express.Router();
const COOLDOWN_PERIOD = process.env.COOLDOWN_PERIOD || 3600000; // 1 hour

router.post("/claim-coupon", async (req, res) => {
    const userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    // console.log(req.body);
    const { couponId } = req.body;
    const currentTime = Date.now();

    try {
        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            return res.status(404).json({ error: "❌ Coupon not found" });
        }
        if (coupon.claimed) {
            return res.status(403).json({ error: "⚠️ This coupon has already been claimed!" });
        }

        if (req.cookies.coupon_claimed) {
            return res.status(403).json({ 
                error: "❌ You have already claimed a coupon recently. Please wait before claiming again."
            });
        }

        const record = await IPRecord.findOne({ ip: userIp });

        if (record) {
            const lastClaimTime = record.lastClaimTime;
            if (currentTime - lastClaimTime < COOLDOWN_PERIOD) {
                const remainingTime = Math.ceil((COOLDOWN_PERIOD - (currentTime - lastClaimTime)) / 60000);
                return res.status(403).json({ 
                    error: `❌ You cannot redeem another coupon for ${remainingTime} minutes`
                });
            }
            await IPRecord.updateOne({ ip: userIp }, { lastClaimTime: currentTime });
        } else {
            await IPRecord.create({ ip: userIp, lastClaimTime: currentTime });
        }

        await Coupon.updateOne({ _id: couponId }, { claimed: true });
        console.log(Coupon);
        res.cookie("coupon_claimed", true, { maxAge: COOLDOWN_PERIOD, httpOnly: true });
        
        res.json({ success: true, message: "🎉 Coupon successfully redeemed!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "🚨 Server error" });
    }
});

router.get("/coupons", async (req, res) => {
    try {
        const coupons = await Coupon.find(); 
        res.json({ success: true, coupons });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "🚨 Server error" });
    }
});


router.post("/reset-coupons", async (req, res) => {
    try {
        const couponResult = await Coupon.updateMany({}, { $set: { claimed: false } });
        
        const ipResult = await IPRecord.deleteMany({});
        
        const domain = req.get('host').split(':')[0]; 
        
        
        res.clearCookie("coupon_claimed", {
            httpOnly: true,
            path: '/'
        });
        
        res.clearCookie("coupon_claimed", {
            httpOnly: true,
            path: '/',
            domain: domain === 'localhost' ? undefined : domain
        });
        
        res.cookie("coupon_claimed", "", {
            httpOnly: true,
            path: '/',
            expires: new Date(1), // Set to past date
            maxAge: -1 
        });
        console.log(`Attempting to clear cookie on domain: ${domain}`);
        
        res.json({ 
            success: true,
            message: "All coupons have been reset successfully. Please refresh your browser.",
            stats: {
                couponsReset: couponResult.modifiedCount,
                ipRecordsDeleted: ipResult.deletedCount
            }
        });
    } catch (error) {
        console.error("Error resetting coupons:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error resetting coupons", 
            error: error.message 
        });
    }
});
  
  


export default router;
