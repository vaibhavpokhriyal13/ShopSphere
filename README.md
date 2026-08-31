# 🛍️ ShopSphere — Modern Luxury E-Commerce Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://frontend-liart-eight-37.vercel.app/)
[![API Status](https://img.shields.io/badge/Backend_API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://shopsphere-3xp5.onrender.com/)

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-0C2340?logo=razorpay&logoColor=white)](https://razorpay.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

ShopSphere is a full-stack, production-grade MERN luxury e-commerce platform engineered with a minimalist aesthetic, high-performance product browsing, integrated **AI Shopping Concierge**, live order tracking, and seamless **Razorpay** payment gateway integration.

🌐 **Live Storefront**: [https://frontend-liart-eight-37.vercel.app/](https://frontend-liart-eight-37.vercel.app/)  
⚡ **API Endpoint**: [https://shopsphere-3xp5.onrender.com/](https://shopsphere-3xp5.onrender.com/)

---

## ✨ Key Features

### 🛍️ Storefront & Shopping Experience
- **Curated Luxury Catalog**: Rich product cards with high-resolution imagery, pricing, discounts, and real-time inventory checks.
- **Dynamic Filtering & Sorting**: Filter products by Category, Color, Features, and Price ranges with instant reset and sorting by price/popularity.
- **Expandable Search Experience**: Smooth, non-disruptive expandable search bar with real-time keyword suggestions and recent search history.
- **Interactive Shopping Bag & Drawer**: Slide-over bag drawer with instant item updates, quantity controls, delivery estimators, and order summary.
- **Wishlist & Recently Viewed**: Local and user-persisted product wishlists and recent browsing tracking.

### 🤖 Intelligent AI Concierge (Powered by Gemini)
- **Natural Language Shopping Assistant**: Conversational product discovery, technical spec breakdowns, and personalized gift recommendations.
- **Interactive Product Cards in Chat**: Recommendations render with photos, live prices, and instant `+ Bag` actions directly inside the chat.
- **Automated Order Tracking**: Look up real-time delivery status, tracking numbers, and Bluedart Express Air couriers.
- **Automated Order Cancellation**: Instant cancellation and refund triggers for pending orders.
- **Store Policy Expert**: Answers instant queries on 7-Day Returns, 3-Year Warranty, and Pan-India Delivery.

### 💳 Checkout & Payments
- **Razorpay Payment Gateway**: Seamless integration supporting UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, and Cash on Delivery (COD).
- **Multi-Step Checkout Flow**: Address management, PIN code validation, shipping method selection, and order review.
- **Instant Order Verification**: Cryptographic HMAC SHA256 signature verification for secure payment processing.

### 👤 Customer & Admin Management
- **JWT Authentication**: Secure user registration, login, profile management, and password reset flows.
- **Order Management & History**: Detailed order receipts, status timelines (Pending ➔ Processing ➔ Shipped ➔ Delivered), and invoice lookups.
- **Admin Dashboard**: Catalog management, order fulfillment controls, inventory updates, and sales analytics.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Redux Toolkit, Context API, Vanilla CSS (Design Tokens), Material Symbols |
| **Backend** | Node.js, Express.js, MongoDB Atlas, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **AI Engine** | Google Generative AI SDK (`gemini-3.6-flash`) with Function Calling |
| **Payments** | Razorpay Node SDK & Razorpay Checkout.js |
| **Media / Storage** | Cloudinary API, Multer |
| **Email** | Nodemailer (Order confirmations & receipts) |

---

## 📁 Project Structure

```
ShopSphere/
├── Backend/
│   ├── config/             # DB and Cloudinary configuration
│   ├── controllers/        # Route controllers (AI, Auth, Orders, Payments, Products, Users)
│   ├── middleware/         # JWT Auth & Admin guard middleware
│   ├── model/              # Mongoose schemas (User, Product, Order)
│   ├── routes/             # Express API route declarations
│   ├── utils/              # Email & helper utilities
│   ├── .env.example        # Environment variables template
│   └── index.js            # Express application entry point
│
├── Frontend/
│   ├── public/             # Static assets & favicons
│   ├── src/
│   │   ├── components/     # UI components (Navbar, Footer, ProductCard, AIConcierge)
│   │   ├── context/        # React Contexts (Auth, Cart, Wishlist, Toast)
│   │   ├── data/           # Mock data and seed catalogs
│   │   ├── pages/          # Application views (Home, Shop, ProductDetail, Cart, Checkout, Profile)
│   │   ├── redux/          # Redux Toolkit store & slices
│   │   ├── services/       # Axios API client services
│   │   └── styles/         # Scoped & global CSS stylesheets
│   └── vite.config.js      # Vite build configuration
│
├── .gitignore              # Secure multi-tier gitignore rules
├── package.json            # Root workspace scripts
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or local MongoDB instance
- [Google AI Studio API Key](https://aistudio.google.com/) (for AI Concierge)
- [Razorpay Test Account](https://dashboard.razorpay.com/) (for Payments)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/ShopSphere.git
cd ShopSphere
```

### 3. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm install
cd Backend && npm install
cd ../Frontend && npm install
cd ..
```

### 4. Configure Environment Variables
Create a `.env` file in the `Backend/` directory based on [`Backend/.env.example`](./Backend/.env.example):

```env
# Backend/.env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ShopSphere
JWT_SECRET=your_jwt_secret_key_here

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# AI Shopping Concierge
GEMINI_API_KEY=your_google_gemini_api_key

# Email Notifications
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Image Uploads (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 5. Seed the Product Catalog
Populate the database with luxury essentials:
```bash
cd Backend
node seed.js
cd ..
```

### 6. Run the Application
Start both the backend API server and the frontend dev server concurrently:

```bash
# In the root directory:
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 📡 API Reference Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new customer account | No |
| `POST` | `/api/auth/login` | Authenticate customer / admin | No |
| `GET` | `/api/products` | Retrieve catalog with filters & search | No |
| `GET` | `/api/products/:id` | Get individual product details | No |
| `POST` | `/api/orders` | Create a new customer order | Yes |
| `POST` | `/api/payment/create-order` | Create Razorpay payment transaction | Yes |
| `POST` | `/api/payment/verify-payment` | Verify Razorpay payment signature | Yes |
| `POST` | `/api/ai/chat` | AI Concierge interactive shopping query | Optional |

---

## 🔒 Security Best Practices
- **Protected Secrets**: Sensitive keys and database URIs are isolated in `.env` and strictly excluded via `.gitignore`.
- **Cryptographic Verification**: Payment transactions are validated on the backend using HMAC SHA-256 before orders are confirmed.
- **Sanitized Inputs**: AI prompt inputs and query strings are sanitized to enforce store-domain boundaries.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
