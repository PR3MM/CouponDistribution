# Coupon Distribution System

A web application for distributing coupons with robust anti-abuse mechanisms and user tracking.

![image](https://github.com/user-attachments/assets/55abccd1-78e9-4bd6-8580-87b2ad62a878)


## Overview

This application allows businesses to create and distribute coupons to users while preventing abuse through a sophisticated tracking system. It leverages IP and cookie-based tracking to enforce cooldown periods between claims and provides real-time feedback to users.

## Features

- **Coupon Management**
  - Browse available coupons in a responsive grid layout
  - Claim coupons with a single click
  - Admin reset functionality for testing purposes

- **Anti-Abuse System**
  - IP address tracking and verification
  - Cookie-based claim history
  - Configurable cooldown period between claims (default: 1 hour)
  - Visual countdown timer for users

- **User Experience**
  - Real-time feedback on coupon availability and claim status
  - Clear error and success messaging
  - Fully responsive design for all device sizes

## Tech Stack

### Frontend
- React (built with Vite)
- Tailwind CSS for styling
- Axios for API communication
- React hooks for state management

### Backend
- Express.js server
- MongoDB with Mongoose ODM
- RESTful API architecture
- Secure cookie handling

## Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (v4+)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/coupon-distribution-system.git
   cd coupon-distribution-system
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment setup**
   
   Create `.env` files in both the server and client directories:

   **Server .env**
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/coupon-system
   CLIENT_URL=http://localhost:3000
   COOLDOWN_PERIOD=3600000  # 1 hour in milliseconds
   ```

   **Client .env**
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the application**
   ```bash
   # Start the backend server
   cd server
   npm run dev

   # In a new terminal, start the frontend
   cd client
   npm run dev
   ```


## Data Models

### Coupon
```javascript
{
  name: String,
  description: String,
  value: Number,
  expiryDate: Date,
  claimed: Boolean,
}
```

### IPRecord
```javascript
{
  ip: String,
  lastClaim: Date,
  claimHistory: [
    {
      couponId: ObjectId,
      claimDate: Date
    }
  ]
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

