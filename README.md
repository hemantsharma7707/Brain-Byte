# 📚 BrainByte Books — Digital E-Book Store & Secure PDF Delivery

**BrainByte Books** is a production-oriented, full-stack MERN digital e-book platform built with React 19, Vite, Tailwind CSS, Express.js, MongoDB Atlas, Razorpay payments, and private cloud PDF vault storage (Amazon S3 / encrypted local vault).

---

## 🚀 Key Features

### 🛍️ Customer Experience
- **Explore & Filter**: Instant search by title, author, and category filtering (Programming, AI & Machine Learning, Web Development, DevOps, etc.).
- **Product Details & Preview**: Rich book overview, specifications (pages, ISBN, language), and preview metadata.
- **Cart & Checkout**: Persistent shopping cart, subtotal calculation, free digital delivery, and Razorpay modal integration.
- **Razorpay Integration**: Full test mode support with UPI, cards, and net banking with backend HMAC-SHA256 signature verification.
- **Instant Digital Delivery**: Dynamic, cryptographically unpredictable download tokens with expiry and download count enforcement.
- **Customer Library**: Lifetime purchase history with on-demand token regeneration.
- **Secure Download Page**: Token verification badge, real-time expiration countdown timer, and direct streaming without exposing storage buckets.

### 🛡️ Admin Management & PDF Vault
- **Admin Dashboard**: Real-time sales KPIs, total revenue (₹), paid orders count, user analytics, and top-selling e-books.
- **E-Book CRUD**: Create, edit, and delete e-books with file upload dropzones for covers and PDF files.
- **Dual PDF Storage Architecture**:
  - **Amazon S3 (Private Bucket)**: Secure cloud storage with pre-signed download URLs and private server-side streaming.
  - **Local Private Vault (Fallback)**: Non-public local directory (`uploads/pdfs/`) served strictly via authorized token streaming.
- **Role-Based Access Control**: HTTP-only JWT cookies with `admin` role authorization middleware.
- **Order Audit Table**: Transaction log containing Razorpay Order and Payment verification IDs.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router v7, React Helmet Async, React Hot Toast, React Icons.
- **Backend**: Node.js, Express.js, Mongoose (MongoDB Atlas), Multer, Bcrypt.js, JSON Web Tokens.
- **Cloud Storage**: AWS SDK v3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`).
- **Payment Gateway**: Razorpay SDK (`razorpay`).

---

## 📁 Project Architecture

```
BrainByte/
├── client/                     # Frontend (React 19 + Vite)
│   ├── public/                 # Static public assets (favicons, icons)
│   ├── src/
│   │   ├── components/         # Header, Footer, BookCard, Route Guards
│   │   ├── context/            # AuthContext, CartContext
│   │   ├── pages/              # Home, Explore, BookDetail, Cart, Checkout,
│   │   │                       # PaymentSuccess, PaymentFailure, PurchaseHistory,
│   │   │                       # SecureDownload, Login, Register, Legal pages
│   │   │   └── admin/          # Dashboard, ManageBooks, AddEditBook, ManageOrders
│   │   ├── services/           # Axios API services
│   │   ├── App.jsx             # React Router and global providers
│   │   └── index.css           # Modern design system & Tailwind styling
│   └── vite.config.js          # API & upload proxy setup
│
├── server/                     # Backend API (Express.js)
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   ├── razorpay.js         # Razorpay instance
│   │   └── s3.js               # AWS S3 Client & presigned URL helpers
│   ├── controllers/            # admin, auth, book, download, order, payment
│   ├── middleware/             # auth, admin, upload, rateLimiter, errorHandler
│   ├── models/                 # Book, User, Order, DownloadToken
│   ├── routes/                 # admin, auth, books, download, orders, payment
│   ├── utils/                  # downloadToken, email, generateToken
│   ├── uploads/                # Non-public storage
│   │   ├── covers/             # Publicly served book covers
│   │   └── pdfs/               # PRIVATE vault (NEVER served statically)
│   ├── seed.js                 # Database seeder with sample books & demo users
│   └── server.js               # Express application entry point
└── README.md
```

---

## ⚙️ Environment Variables

Create a `server/.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Database URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/brainbyte?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long
JWT_EXPIRE=7d

# Amazon S3 (Private PDF Cloud Storage - Optional)
# If unset, automatically falls back to secure private local server storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET=your-private-brainbyte-bucket

# Razorpay Payment Gateway (Test Mode)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Email (Nodemailer / SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_google_app_password
FROM_EMAIL=noreply@brainbytebooks.com
FROM_NAME=BrainByte Books

# Frontend Application URL
CLIENT_URL=http://localhost:5173

# Secure Download Tokens Configuration
DOWNLOAD_TOKEN_EXPIRY_HOURS=24
MAX_DOWNLOADS_PER_TOKEN=5
```

---

## ☁️ How to Configure Amazon S3 for Private PDF Storage

1. **Create an S3 Bucket**:
   - Log into AWS Management Console → Amazon S3 → **Create bucket**.
   - Bucket name: e.g. `brainbyte-private-books`.
   - **Block all public access**: Keep **ENABLED** (All 4 checkboxes checked). The bucket must remain 100% private.
   - **Default encryption**: Enable Server-side encryption (SSE-S3 / AES256).

2. **Create IAM User with Limited Permissions**:
   - Go to AWS IAM → Users → **Create user** (e.g. `brainbyte-app-user`).
   - Attach policies directly:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Action": [
             "s3:PutObject",
             "s3:GetObject",
             "s3:DeleteObject"
           ],
           "Resource": "arn:aws:s3:::brainbyte-private-books/*"
         }
       ]
     }
     ```
   - Generate Access Key (type: *Application running outside AWS*) and copy `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

3. **Hybrid Mode**:
   - If AWS credentials are not provided or during offline local development, the system seamlessly uses the local private vault (`server/uploads/pdfs/`), keeping files safe from public web access.

---

## 💳 How to Configure Razorpay Test Mode

1. Log into your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Switch to **Test Mode** (toggle on top bar).
3. Navigate to **Settings** → **API Keys** → Click **Generate Key**.
4. Copy the `Key Id` (`rzp_test_...`) and `Key Secret`.
5. Add them to `server/.env` as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
6. Use Razorpay's test credentials during checkout:
   - **UPI**: Any dummy VPA (e.g. `success@razorpay`).
   - **Card**: Any standard test card provided in the Razorpay test modal.

---

## 🏁 Quickstart Guide

### 1. Install Dependencies
```bash
# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
```

### 2. Seed Database
Run the database seeder to create sample e-books and test accounts:
```bash
cd server
npm run seed
```

**Pre-seeded Demo Accounts:**
- **Admin**: `admin@brainbyte.com` / `Admin123!Secure`
- **Customer**: `user@brainbyte.com` / `Password123!`

### 3. Run Development Servers
In two separate terminal windows:

```bash
# Terminal 1: Backend (Runs on http://localhost:5000)
cd server
npm run dev

# Terminal 2: Frontend (Runs on http://localhost:5173)
cd client
npm run dev
```

Visit **`http://localhost:5173`** to use the bookstore!
# Brain-Byte
