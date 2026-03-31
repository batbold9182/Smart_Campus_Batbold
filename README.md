# 🏫 Smart Campus System

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/) 
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/) 
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io)](https://socket.io/) 
[![Cloudinary](https://img.shields.io/badge/Cloudinary-DB00FF?style=flat&logo=cloudinary&logoColor=white)](https://cloudinary.com/)  

**Smart Campus System** is a full-stack web application for universities, designed to manage student interactions, assignments, grades, and real-time communication. It features multi-channel chat, secure JWT authentication, file uploads via Cloudinary, and role-based access.

---

## 🌟 Features

### 🔒 Authentication & Authorization
- Secure login and registration using **JWT tokens**  
- Role-based access control (e.g., students, admins)  
- Protected routes and token expiration handling  

### 💬 Live Chat
- Real-time chat using **Socket.io**  
- Multiple chat channels:
  - 🍔 Lunch Chat  
  - 📚 Study Chat  
  - 🎉 Party Chat  
  - 📝 Assignment Discussion  
- Supports multiple users chatting simultaneously  

### 📝 Assignments & Grades
- Fully functional assignments dashboard  
- Upload and download assignments of multiple types (PDF, JPG, DOCX, etc.)  
- Maximum file size: **10 MB**  
- Cloud storage using **Cloudinary**  
- Real-time updates for submissions and grades  

### 🤖 FAQ & Chatbot
- Interactive FAQ chatbot for campus support  
- Provides quick answers for students  

### 📁 File Handling
- Handles multiple file types with ease  
- Cloud-based storage ensures scalability and reliability  

### 🖥️ Frontend
- Built with **React**  
- Responsive, user-friendly dashboards  
- Dynamic rendering of assignments, grades, and chat messages  

### ⚙️ Backend
- **Node.js** with **Express.js**  
- RESTful API endpoints for users, assignments, chat, and more  
- Real-time communication via **Socket.io**  
- JWT-based authentication for secure API access  

---

## 🛠️ Tech Stack

- **Frontend:** React, React Router
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Real-time:** Socket.io  
- **File Storage:** Cloudinary  
- **Authentication:** JWT  
- **Other:** Axios, dotenv  

---

## 🚀 Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/yourusername/smart-campus.git
cd smart-campus

### 2️⃣ install dependencies
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

### 3️⃣ Set up environment variables
create a .env file
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
