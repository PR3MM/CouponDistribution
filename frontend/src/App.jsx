import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [coupons, setCoupons] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(null);

  // Effect for countdown timer
  useEffect(() => {
    // Check if there's a stored expiration time
    const cooldownExpires = localStorage.getItem('couponCooldownExpires');
    
    // Only start the timer if there's an expiration time
    if (cooldownExpires) {
      // Calculate initial countdown display
      const now = Date.now();
      const timeLeft = parseInt(cooldownExpires) - now;
      
      // If the timer has already expired, clear it
      if (timeLeft <= 0) {
        setCooldownRemaining(null);
        localStorage.removeItem('couponCooldownExpires');
        return;
      }
      
      // Calculate and set initial countdown
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      setCooldownRemaining(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      setLocked(true); // Lock UI when on cooldown
      
      // Set up an interval to update the countdown
      const interval = setInterval(() => {
        const now = Date.now();
        const timeLeft = parseInt(cooldownExpires) - now;
        
        if (timeLeft > 0) {
          // Calculate minutes and seconds
          const minutes = Math.floor(timeLeft / 60000);
          const seconds = Math.floor((timeLeft % 60000) / 1000);
          setCooldownRemaining(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        } else {
          // Cooldown expired
          setCooldownRemaining(null);
          localStorage.removeItem('couponCooldownExpires');
          setLocked(false); // Unlock UI when cooldown ends
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      // No cooldown set
      setCooldownRemaining(null);
    }
  }, []);

  // Fetch coupons on component mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = () => {
    axios
      .get("http://localhost:5000/coupons", { withCredentials: true })
      .then((response) => {
        setCoupons(response.data.coupons || []);
      })
      .catch((error) => {
        console.error("Error fetching coupons:", error);
        setError("Failed to load coupons. Please try again.");
      });
  };

  const handleClaimCoupon = (couponId) => {
    setLocked(true); // Lock the UI during the request
    setMessage(""); // Clear any previous messages
    
    axios
      .post(
        "http://localhost:5000/claim-coupon",
        { couponId },
        { 
          headers: { "Content-Type": "application/json" },
          withCredentials: true 
        }
      )
      .then((response) => {
        // Update the coupon state to reflect the claimed status
        setCoupons(coupons.map(coupon => 
          coupon._id === couponId ? { ...coupon, claimed: true } : coupon
        ));
        
        // Set cooldown expiration time in localStorage (1 hour from now)
        const expirationTime = Date.now() + 3600000; // 1 hour in milliseconds
        localStorage.setItem('couponCooldownExpires', expirationTime);
        
        // Show success message with coupon code
        setMessage(`🎉 Coupon successfully redeemed`);
        
        // Keep UI locked during cooldown
        // Will be unlocked when cooldown ends via the useEffect
      })
      .catch((error) => {
        console.error(error.response?.data || "Error claiming coupon");
        
        // Check if the error response contains a time restriction
        if (error.response?.data?.error && error.response?.data?.error.includes("minutes")) {
          setMessage(`❌ ${error.response.data.error}`);
          
          // Also update the cooldown timer based on server response
          const minutesMatch = error.response.data.error.match(/(\d+)\s*minutes/);
          if (minutesMatch && minutesMatch[1]) {
            const remainingMinutes = parseInt(minutesMatch[1]);
            const expirationTime = Date.now() + (remainingMinutes * 60000);
            localStorage.setItem('couponCooldownExpires', expirationTime);
          }
        } else {
          setMessage(`❌ ${error.response?.data?.error || "Error claiming coupon"}`);
        }
        
        setLocked(false); // Unlock the UI if there's an error that's not cooldown related
      });
  };
  
  const handleReset = () => {
    // Reset local state
    localStorage.removeItem('couponCooldownExpires');
    setCooldownRemaining(null);
    setLocked(false);
    setMessage("");
    setError("");
    
    // Reset server state
    axios
      .post("http://localhost:5000/reset-coupons", {}, {
        withCredentials: true 
      })
      .then((response) => {
        // Refresh the page to get everything in sync
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error resetting coupons:", error);
        setError(error.response?.data?.error || "Error resetting coupons");
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        Round-Robin Coupon Distribution
      </h1>

      {cooldownRemaining && (
        <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md mb-4 max-w-xs w-full text-center">
          <p>Cooldown remaining:</p>
          <p className="text-2xl font-bold">{cooldownRemaining}</p>
          <p className="text-sm">until next coupon claim</p>
        </div>
      )}
      
      {message && (
        <div className={`${message.includes("❌") ? "bg-red-500" : "bg-green-500"} text-white p-4 rounded-lg shadow-md mb-4 max-w-xs w-full`}>
          <p>{message}</p>
          <button
            onClick={() => setMessage("")}
            className="mt-4 bg-white text-gray-800 py-2 px-4 rounded-full hover:bg-gray-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg shadow-md mb-4 max-w-xs w-full">
          <p>{error}</p>
          <button
            onClick={() => setError("")}
            className="mt-4 bg-white text-gray-800 py-2 px-4 rounded-full hover:bg-gray-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-4xl px-4">
        {coupons.map((coupon) => (
          <div
            key={coupon._id}
            className={`p-6 rounded-lg shadow-lg text-center flex flex-col justify-between h-40
              ${coupon.claimed || locked ? "bg-gray-300" : "bg-white"}
            `}
          >
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {coupon.name}
              </h3>
              <p className={`text-sm ${coupon.claimed || locked ? "text-gray-500" : "text-gray-600"}`}>
                Code: {coupon.claimed ? coupon.code : "**********"}
              </p>
            </div>
            
            <button
              onClick={() => handleClaimCoupon(coupon._id)}
              className={`text-white py-2 px-4 rounded-full transition duration-200 ${
                coupon.claimed || locked
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={coupon.claimed || locked}
            >
              {coupon.claimed ? "Claimed" : "Claim Coupon"}
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleReset}
        className="mt-8 bg-red-500 text-white py-2 px-4 rounded-full hover:bg-red-600 transition duration-200"
      >
        Reset All Coupons
      </button>
      <div className="text-center mt-4 text-sm text-gray-600">
        Reset Button for testing purposes only
      </div>
    </div>
  );
}

export default App;