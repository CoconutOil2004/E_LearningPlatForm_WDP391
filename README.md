# LearnX - Modern E-Learning Platform

LearnX is a comprehensive full-stack E-Learning platform designed for students, instructors, and administrators. It features course management, real-time notifications, secure payments, and a premium user interface.

## 🚀 Key Features

- **Student Hub**: Browse, search, and enroll in courses. Track progress through lessons and quizzes.
- **Instructor Dashboard**: Create and manage courses, upload video content via Cloudinary, and track student enrollment and revenue.
- **Admin Panel**: Approve/reject courses, manage users, and monitor platform analytics.
- **Real-time Interaction**: Integrated chat and live notifications using Socket.IO.
- **Secure Authentication**: JWT-based auth with Google OAuth integration and OTP verification.
- **Infrastructure**: Dockerized services for both Frontend and Backend, with Nginx reverse proxy and monitoring (Prometheus/Grafana) readiness.

---

## 🛠 Tech Stack

### Backend
- **Core**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: Passport.js (Google Strategy), JWT, bcryptjs
- **Validation**: Centralized `express-validator` middleware
- **Real-time**: Socket.IO
- **Storage**: Cloudinary (Images & Videos)

### Frontend
- **Core**: React.js 18 (Vite)
- **State Management**: Redux Toolkit, Zustand, React Query
- **Styling**: Vanilla CSS with modern Design Tokens, Framer Motion for animations
- **Routing**: React Router 6

---

## 📂 Project Structure

```text
.
├── back-end/           # Node.js Express API
│   ├── src/
│   │   ├── config/     # Database, Passport, Cloudinary configs
│   │   ├── controller/ # Business logic
│   │   ├── middleware/ # Auth, Error, Validation, Rate Limiting
│   │   ├── models/     # Mongoose Schemas
│   │   ├── routes/     # API Endpoints
│   │   └── validations/# express-validator rules
│   └── server.js       # Entry point
├── front-end/          # React Vite App
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route pages (Admin, Instructor, Student)
│   │   ├── services/   # API abstraction layer
│   │   └── store/      # Redux/Zustand state
│   └── App.js          # Main entry
├── infrastructure/     # Docker, Nginx, Prometheus configurations
└── docker-compose.yml  # Orchestration
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Docker & Docker Compose (Optional)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd E_LearningPlatForm_WDP391
   ```

2. **Backend Setup**:
   ```bash
   cd back-end
   npm install
   # Create .env file based on .env.example
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd front-end
   npm install
   npm run dev
   ```

---

## 📝 API Documentation
Once the backend is running, you can access the Swagger documentation at:
`http://localhost:9999/api-docs`

---

## 🏗 Recent Improvements
We recently performed a major architectural refactor:
- **Consolidated Auth**: Unified authentication logic into a single middleware.
- **Global Error Handling**: Integrated a centralized error handler for consistent API responses.
- **Centralized Validation**: Moved all input validation to the middleware layer using `express-validator`.

---

## ⚖️ License
Distributed under the MIT License.
