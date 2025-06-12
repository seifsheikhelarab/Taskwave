
# TaskWave - Work in Progress

TaskWave is a team-based project and task management system. It helps teams manage projects, assign tasks, track progress, and collaborate effectively.

## Project Overview

TaskWave is built to simulate a real-world team collaboration platform. It includes authentication, role management, task boards, notifications, and more. Ideal for practicing and showcasing full-stack backend skills.

## 🔧 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas + Mongoose
- **Authentication**: Passport.js (Local + OAuth2.0 - Google/GitHub)
- **Templating**: EJS (for server-rendered views)
- **Email Service**: NodeMailer (SMTP)
- **Session Management**: express-session + connect-mongo
- **Validation**: express-validator
- **Security**: bcrypt, express-rate-limit, dotenv
- **Testing** *(Planned)*: Jest + Supertest
- **API Documentation**: Postman / Swagger *(Planned)*

## ✨ Features

### 🧑‍💼 Authentication & Authorization

- Signup/Login with email and password
- OAuth2.0 with Google/GitHub
- Session-based authentication
- Role-based access: Admin, Member, Guest
- Protected routes based on roles

### 🗂️ Project & Task Management

- Create or join projects
- Task boards with columns: To Do, In Progress, Done
- Assign members to tasks
- File attachments with Multer *(Coming Soon)*

### 🔐 Security & Best Practices

- Environment variables with `.env`
- Server-side input validation
- Rate limiting to protect against brute-force attacks
- Password hashing with bcrypt

### 🔁 Sessions & State

- Session management via MongoDB store
- Cookie-based login persistence
- Clear comparison between sessions vs tokens

### 📧 Notification System

- Email invites to projects
- Notifications for task updates via NodeMailer

### 📄 API

- RESTful routing and responses
- JSON responses for API endpoints
- Proper HTTP status codes
- Plans to expose public APIs for integration

### 📘 Documentation & Testing

- API documentation with Postman or Swagger *(Planned)*
- Unit and integration tests with Jest & Supertest *(Planned)*

## 🛠️ Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/seifsheikhelarab/Taskwave.git
   cd Taskwave

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory:

   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   GMAIL_USER=your_email@gmail.com
   GMAIL_PASS=your_app_password
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Run the App**

   ```bash
   npm run dev
   ```

5. **Visit**

   Open `http://localhost:3000` in your browser.

## 📦 Folder Structure

```file
src/
├── controllers/
├── models/
├── routes/
├── views/
├── middleware/
├── utils/
├── public/
├── tests/               # Coming soon
├── config/
├── .env.example
├── app.js
└── README.md
```

## 📌 Roadmap

- Attachments via Multer
- Unit/Integration Testing
- Swagger API Docs
- Frontend SPA or Mobile App Integration
- Deploy to Render or Railway

## 🧑‍💻 Contributing

Contributions are welcome! Feel free to open issues or submit PRs to enhance functionality, fix bugs, or improve documentation.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 💬 Acknowledgments

Thanks to the open-source community and the amazing tools powering this project.
