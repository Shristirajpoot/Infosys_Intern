

# ♻️ WasteZero Backend

![WasteZero Banner](https://img.shields.io/badge/WasteZero-Backend-success?style=for-the-badge&logo=node.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-Fast%20API-blue?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?style=for-the-badge&logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime%20Chat-black?style=for-the-badge&logo=socket.io)

---

## 🌍 Overview
The **WasteZero Backend** powers all real-time communication, authentication, and data management between users, NGOs, and admins.

It’s built with **Express.js**, connected to **MongoDB Atlas**, and integrated with **Socket.IO** for instant messaging and updates.

---

## ✨ Key Features
- 🔑 JWT-based Authentication for Users, NGOs & Admins  
- 💬 Real-time Messaging via Socket.IO  
- 📨 Application Management (Apply, Accept, Reject)  
- 📅 Attendance Tracking & Report Export  
- ⚙️ Robust Role-based Access Control  
- 📡 API integration with the React Frontend  
- 🖼️ Image Upload Support for NGOs  

---

## 🧭 Folder Structure

 ```bash
wastezero-backend/
│____
    ├── controllers/                        # Request handlers
    │   ├── admin.controller.js
    │   ├── auth.controller.js
    │   ├── ApplicationController.js
    │   ├── matching.controller.js
    │   ├── message.controller.js
    │   ├── ngo.controller.js
    │   ├── notification.controller.js
    │   ├── opportunityController.js
    │   ├── pickup.controller.js
    │   ├── reset.controller.js
    │   ├── user.controller.js
    │   └── volunteer.controller.js
    │
    ├── models/                             # Database models
    │   ├── application.model.js
    │   ├── conversation.model.js
    │   ├── Message.js
    │   ├── message.model.js
    │   ├── ngo.controller.js
    │   ├── notification.model.js
    │   ├── opportunity.model.js
    │   ├── pickup.model.js
    │   └── user.model.js
    │
    ├── routes/                             # API routes
    │   ├── admin.routes.js
    │   ├── auth.routes.js
    │   ├── applicationRoutes.js
    │   ├── matching.routes.js
    │   ├── message.routes.js
    │   ├── ngo.routes.js
    │   ├── notification.routes.js
    │   ├── opportunity.routes.js
    │   ├── pickup.routes.js
    │   ├── user.routes.js
    │   └── volunteer.routes.js
    │
    ├── middleware/                         # Custom middleware
    ├── services/                           # Business logic
    ├── socket/                             # WebSocket handlers
    ├── utils/                              # Utility functions
    ├── lib/                                # External libraries
    ├── src/
    │   └── server.js                       # Main server file
    │
    ├── server.js                           # Entry point
    ├── create-test-users.js
    ├── fix-db-indexes.js
    ├── test-imports.js
    ├── env                                 # Environment variables
    └── Readme.md

 ```


## ⚙️ Setup Instructions
### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/WasteZero.git
cd wastezero-backend
```
### 2️⃣ Install Dependencies
```bash
npm install
```
### 3️⃣ Configure Environment Variables
Create a .env file with:
```bash
PORT=4000
MONGO_URI=your_mongo_uri_here
JWT_SECRET=your_secret_key
```
### 4️⃣ Start the Server
```bash
npm run dev
```
Server runs at: 🌐 http://localhost:4000


---

## 📡 API Endpoints

| Method  | Endpoint                         | Description                     |
| ------- | -------------------------------- | ------------------------------- |
| `POST`  | `/api/auth/register`             | Register user/NGO               |
| `POST`  | `/api/auth/login`                | Login user                      |
| `POST`  | `/api/opportunities/create`      | Create new opportunity          |
| `POST`  | `/api/applications`              | Apply for opportunity           |
| `PATCH` | `/api/ngo/reviewApplication/:id` | NGO accepts/rejects application |
| `GET`   | `/api/ngo/exportAttendance`      | Export attendance report        |

---

## 🧪 Testing Credentials

| Role      | Email                                                 | Password         |
| --------- | ----------------------------------------------------- | ---------------- |
| Admin     | [admin@example.com](mailto:admin@example.com)         | AdminPass123     |
| NGO       | [ngo@example.com](mailto:ngo@example.com)             | NGOpass123       |
| Volunteer | [volunteer@example.com](mailto:volunteer@example.com) | VolunteerPass123 |

---
## 📸 Sample Demo Screens

| Page | Screenshot |
|------|-------------|
| 🏠 Register | ![Register](../frontend/demo/Screenshot%202025-11-13%20182922.png) |
| 👥 Login | ![Login](../frontend/demo/Screenshot%202025-11-13%20183239.png) |
| 🏠 Verify | ![Verify](../frontend/demo/Screenshot%202025-11-13%20183239.png) |
| 🏠 Create_Opportunity | ![Verify](../frontend/demo/Screenshot%202025-11-13%20185521.png) |
| 🏠 NGO_Events | ![Verify](../frontend/demo/Screenshot%202025-11-13%20185758.png) |
| 🏠 Events | ![Verify](../frontend/demo/Screenshot%202025-11-13%20185808.png) |
| 🏠 Update_Opportunity | ![Verify](../frontend/demo/Screenshot%202025-11-13%20185822.png) |
| 🏠 Applications_Page | ![Verify](../frontend/demo/Screenshot%202025-11-13%20185853.png) |
| 🏠 Delete_Opportunity | ![Verify](../frontend/demo/Screenshot%202025-11-13%20185911.png) |
| 🏠 NGO_notification| ![Verify](../frontend/demo/Screenshot%202025-11-13%20185930.png) |
| 🏠 Database | ![Verify](../frontend/demo/Screenshot%202025-11-13%20190004.png) |
| 🏠 Database | ![Verify](../frontend/demo/Screenshot%202025-11-13%20190018.png) |
| 🏠 Database | ![Verify](../frontend/demo/Screenshot%202025-11-13%20190031.png) |
| 🏠 Database | ![Verify](../frontend/demo/Screenshot%202025-11-13%20190045.png) |
| 🏠 Database | ![Verify](../frontend/demo/Screenshot%202025-11-13%20190056.png) |
| 🏠 Database | ![Verify](../frontend/demo/Screenshot%202025-11-13%20190124.png) |
| 🏠 Database | ![Verify](../frontend/demo/Screenshot%202025-11-13%20190140.png) |

---

## 👩‍💻 Author
### Shristi Rajpoot  
[LinkedIn](https://www.linkedin.com/in/shristi-rajpoot-36774b281/) • [GitHub](https://github.com/Shristirajpoot)


## 💚 Acknowledgments
Special thanks to my internship mentors and teammates for guidance and feedback.
WasteZero is developed as part of an internship project promoting Zero Waste & Green Living 🌱

