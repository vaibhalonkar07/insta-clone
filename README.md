# 📸 Instagram-Style Login Page
> Auto Sign-Up + Login with MongoDB Atlas

A full-stack Instagram-style login page where **entering your credentials automatically creates an account if you're new, or logs you in if you return**.

---

## 📁 Project Structure

```
instagram-login/
│
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   └── db.js               # MongoDB Atlas connection
│   ├── models/
│   │   └── User.js             # Mongoose User schema
│   ├── routes/
│   │   └── auth.js             # Login/Signup combined route
│   ├── server.js               # Express app entry point
│   ├── .env                    # Environment variables (YOU EDIT THIS)
│   └── package.json
│
└── frontend/                   # Vanilla HTML/CSS/JS
    └── public/
        ├── index.html          # Login page HTML
        ├── style.css           # Instagram-style CSS
        └── app.js              # Frontend JS logic
```

---

## ⚙️ Step-by-Step Setup

### Step 1: Get MongoDB Atlas URI

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account / log in
3. Create a **free M0 cluster**
4. Click **Connect → Drivers** and copy the connection string
5. It looks like:
   ```
   mongodb+srv://myuser:mypass@cluster0.abc12.mongodb.net/instagram_login?retryWrites=true&w=majority
   ```
6. Make sure to **whitelist your IP** in Network Access (or use `0.0.0.0/0` for all IPs)

---

### Step 2: Configure Backend

1. Open `backend/.env`
2. Replace the `MONGODB_URI` with your actual connection string:
   ```env
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/instagram_login?retryWrites=true&w=majority
   JWT_SECRET=make_this_a_long_random_string
   PORT=5000
   ```

---

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

---

### Step 4: Start the Backend Server

```bash
# Development (auto-restarts on change)
npm run dev

# Production
npm start
```

You should see:
```
✅ MongoDB Atlas Connected: cluster0.abc12.mongodb.net
🚀 Instagram Login Server Running
   Port: http://localhost:5000
```

---

### Step 5: Open the Frontend

Simply open `frontend/public/index.html` in your browser.

**OR** serve it with a static server:
```bash
cd frontend
npx serve public -p 3000
# Then open http://localhost:3000
```

> **VS Code users**: Install the "Live Server" extension and click "Go Live"

---

## 🔌 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| `POST` | `/api/auth/login` | Auto login or sign up |
| `GET`  | `/api/auth/me` | Get current user (needs JWT token) |
| `GET`  | `/api/auth/check/:identifier` | Check if user exists |
| `GET`  | `/api/health` | Server health check |

### POST /api/auth/login

**Request Body:**
```json
{
  "identifier": "john@example.com",
  "password": "mypassword123"
}
```

**Response (New User — 201):**
```json
{
  "success": true,
  "message": "Account created and logged in successfully! 🎉",
  "isNewUser": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "65a...",
    "identifier": "john@example.com",
    "identifierType": "email",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Returning User — 200):**
```json
{
  "success": true,
  "message": "Logged in successfully! 👋",
  "isNewUser": false,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

---

## 🔐 How It Works

```
User enters identifier + password
         ↓
  Check if user exists in MongoDB
         ↓
   ┌─────────────────────────────┐
   │ NOT FOUND → Create account  │  ← Auto Sign Up
   │   (hash password, save)     │
   └─────────────────────────────┘
         ↓
   ┌─────────────────────────────┐
   │ FOUND → Verify password     │  ← Auto Login
   │   (bcrypt compare)          │
   └─────────────────────────────┘
         ↓
   Generate JWT token
         ↓
   Return token + user data
```

---

## 🛡️ Security Features

- ✅ **Passwords hashed** with bcrypt (12 salt rounds)
- ✅ **JWT authentication** tokens
- ✅ **Password never stored** in plain text
- ✅ **Password stripped** from API responses
- ✅ **Input validation** on both client and server
- ✅ **CORS configured** for your frontend

---

## 🧪 Test Accounts You Can Create

| Type | Example |
|------|---------|
| Email | `john.doe@gmail.com` |
| Mobile | `9876543210` or `+919876543210` |
| Username | `john_doe_99` |

---

## ⚡ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (cloud) |
| ODM | Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Security | bcryptjs |
