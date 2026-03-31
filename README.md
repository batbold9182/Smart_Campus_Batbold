Smart Campus System 🏫💻

Smart Campus System is a full-stack web application designed for universities to manage student interactions, assignments, grades, and real-time communication. The system includes multi-channel live chat, secure authentication, file uploads, and role-based access, providing a comprehensive digital campus experience.

🌟 Features
Authentication & Authorization
Secure login and registration using JWT tokens
Role-based access control (e.g., students, admins)
Token expiration and protected routes for sensitive data
Live Chat
Real-time chat using Socket.io
Multiple channels for different purposes:
Lunch Chat
Study Chat
Party Chat
Assignment Discussion
Supports multiple users chatting simultaneously
Assignments & Grades
Fully functional assignments dashboard
Upload and download assignments of multiple types (PDF, JPG, etc.)
Maximum file size: 10 MB
Cloud storage via Cloudinary
Real-time updates for submissions and grades
FAQ & Chatbot
Interactive FAQ chatbot for campus support
Helps students get quick answers without admin intervention
File Handling
Upload and store various file types (PDF, JPG, DOCX, etc.)
Cloudinary integration ensures scalable and reliable storage
Frontend
Built with React
Responsive and user-friendly dashboards
Dynamic rendering of assignments, grades, and chat messages
Backend
Node.js with Express.js
RESTful API endpoints for users, assignments, chat, and more
Real-time communication with Socket.io
JWT-based authentication for secure API access
📦 Tech Stack
Frontend: React, React Router, Context API / Redux
Backend: Node.js, Express.js
Database: MongoDB / PostgreSQL (your choice)
Real-time: Socket.io
File Storage: Cloudinary
Authentication: JWT tokens
Other: Axios for HTTP requests, dotenv for environment variables
Enviroment variables
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
