
<p align="center">
  <img src="/public/img/logo.jpeg" alt="TaskWave Logo" width="200"/>
</p>

**TaskWave** is a full-stack, team-based project and task management system. It helps teams manage projects, assign tasks, track progress, and collaborate effectively — all with a focus on best practices, clean structure, and real-world simulation.

---

## 📌 Project Overview

TaskWave is built to simulate a professional collaboration platform. It includes:

- Secure user authentication (including Google OAuth)
- Role-based access control (Admin, Member, Guest)
- Task boards and project tracking
- User invites and notifications
- RESTful APIs and Swagger docs
- Email-based password reset and notification system

Ideal for practicing and showcasing full-stack backend development skills using modern technologies.

---

## 🔧 Tech Stack

### Backend
- **Node.js** + **Express.js**
- **MongoDB Atlas** + **Mongoose**

### Authentication & Security
- **Passport.js** – Google OAuth2.0
- **bcrypt** – Password hashing
- **express-session** + **connect-mongo** – Session management
- **express-rate-limit** + **rate-limit-mongo** – Brute-force protection
- **dotenv** – Environment variable management
- **express-validator** – Server-side validation
- **method-override** – Support for PUT/PATCH in forms

### Views & User Interface
- **EJS** – Templating engine
- **axios** – Fetching Google profile pictures
- **HTML+CSS+Bootstrap** - Styling the interface

### Utilities
- **multer** – Profile picture uploads
- **nodemailer** – Email notifications and password resets
- **pino** + **pino-pretty** – Logging

### API Docs & Testing
- **swagger-jsdoc** + **swagger-ui-express** – API documentation
- *(Planned)* **Jest** + **Supertest** – Unit/integration testing

---

## ✨ Features

### 🧑‍💼 Authentication & Authorization
- Email/password login with hashed storage
- Google OAuth 2.0
- Password reset via email
- Role-based access (Admin, Member, Guest)
- Session-based login with persistent cookies

### 🗂️ Project & Task Management
- Create and manage multiple projects
- Add tasks with priority levels
- Assign tasks to team members
- Invite other users to collaborate

### 📤 Profile & Media
- Upload profile pictures via **Multer**
- Fetch Google profile photos using **Axios**
- Edit personal profile info

### 🔐 Security & Best Practices
- Environment configs via `.env`
- Input validation and sanitation
- Session management and protection
- Rate limiting to prevent abuse

### 📧 Notifications
- Project invites via email
- Task updates via **NodeMailer**

### 📘 API & Docs
- RESTful API with meaningful HTTP status codes
- JSON responses for all API routes
- Swagger docs hosted at `/api-docs`
- Plans for public API exposure

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/seifsheikhelarab/Taskwave.git
cd Taskwave
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with:

```
# Server Configuration
PORT = 3000
NODE_ENV = development

#Session Secret and MongoURI
SESSION_SECRET = secret
MONGO_URI = mongodb://localhost:27017/taskwave

# Email Configuration
SMTP_HOST = host.com
SMTP_PORT = 587
SMTP_SECURE = false
SMTP_USER = user@host.com
SMTP_PASS = password
SMTP_FROM = user@host.com
APP_URL = http://localhost:3000

# Google OAuth Configuration
GOOGLE_CLIENT_ID = googleid
GOOGLE_CLIENT_SECRET = googlesecret
GOOGLE_REDIRECT_URI = http://localhost:3000/auth/google/callback

```

### 4. Run the App

```bash
npm run dev
```

### 5. Open in Browser

Visit [http://localhost:3000](http://localhost:3000)

---

## 📁 Folder Structure

```
public/
├── avatars/
├── css/
├── img/
└── js/

views/

src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── .env.example
└── app.ts

package.json
README.md
tsconfig.json
```

---

## 🔮 Roadmap

* [ ] Unit & integration testing with Jest + Supertest
* [ ] Deployment to Render or Railway
* [ ] Public API with token-based access
* [ ] Dark/light theme toggle

---

## 🧑‍💻 Contributing

Contributions are welcome!
Feel free to fork, submit issues, or create PRs to improve the project.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 💬 Acknowledgments

Big thanks to the open-source community and the maintainers of the amazing tools powering this project.
