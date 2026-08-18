# Limitly - Smart Finance Management

Limitly is a modern, full-stack finance application designed to help friends and groups split expenses, track spending, and settle debts seamlessly. With a focus on user experience and smart features, Limitly makes managing shared finances effortless.

## 🚀 Features

### 🔐 Authentication & Security
- **Secure Login/Register**: Email and password authentication with encryption.
- **Google Authentication**: One-click login using Google OAuth 2.0.
- **JWT Protection**: Secure, stateless authentication using JSON Web Tokens.

### 💰 Expense Tracking (Personal & Group)
- **Personal Expenses**: Track your daily individual spending with categories and detailed insights.
- **Group Expenses**: Log shared expenses, split bills (Equal/Exact/Percentage) with friends.
- **Full Control**: Edit or **Delete** expenses seamlessly (with permission checks).
- **Smart Date Grouping**: View expenses organized by "Today", "Yesterday", and specific dates.

### 👥 Group Management
- **Create & Join**: Create groups for trips or roommates, or join via invite code.
- **Admin Controls**: Group creators can **Edit details** (currency, name) or **Delete** the group entirely.
- **Settlements**: Automatically calculate debts and track who owes whom.
- **Multi-Currency Support**: Handle expenses in INR, USD, EUR, etc., with automatic symbol display.

### 🤖 AI-Powered Assistant (Groq)
- **Financial Insights**: Get smart analysis of your spending habits powered by **OpenAI GPT-OSS 20B (via Groq)**.
- **Budget Advice**: Receive personalized tips to stay within your monthly budget.
- **Smart Chat**: Ask personal-finance questions and get instant, context-aware answers based on your recent expenses.
- **Finance-Only Scope**: The assistant answers questions about personal finance, budgeting, expenses, saving, debt, and the supplied expense data. For unrelated requests, it directs users back to these topics.

### 📱 Premium UI/UX
- **Modern Design**: Sleek Dark/Light theme usage with Glassmorphism effects.
- **Split Layout Login**: Beautiful, professional login page with illustration.
- **Responsive**: Fully optimized for mobile, tablet, and desktop.
- **Interactive Elements**: Smooth transitions, hover effects, and intuitive modals.

## 🛠️ Technology Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS (Styling)
- React Router DOM (Navigation)
- Axios (API Communication)

**Backend:**
- Node.js & Express.js
- MongoDB (Database)
- Mongoose (CDM)
- Passport.js (Google Auth)
- Groq API / Axios (OpenAI GPT-OSS 20B AI integration)
- JSON Web Token (JWT)

## ⚡ Getting Started

### Prerequisites
- Node.js installed
- MongoDB connection string
- Google Cloud Console Credentials (for Google Login)
- Groq API Key (for AI features)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd finance-app
    ```

2.  **Setup Server**
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GROQ_API_KEY=your_groq_api_key
    ```
    Start the server:
    ```bash
    npm run dev
    ```

3.  **Setup Client**
    ```bash
    cd ../client
    npm install
    ```
    Start the frontend:
    ```bash
    npm run dev
    ```

4.  **Access the App**
    Open `http://localhost:5173` in your browser.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
