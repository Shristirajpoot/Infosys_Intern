# ♻️ WasteZero — Frontend

![WasteZero Banner](https://img.shields.io/badge/WasteZero-Frontend-success?style=for-the-badge&logo=vercel&logoColor=white)
![React](https://img.shields.io/badge/React-18.0+-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge&logo=node.js)
![CSS3](https://img.shields.io/badge/CSS3-Responsive%20Design-orange?style=for-the-badge&logo=css3)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?style=for-the-badge&logo=mongodb)

---

## 🌍 Project Overview

**WasteZero** is a digital platform promoting **responsible waste management**.  
It allows users to:
- Schedule waste pickups efficiently 🗓️  
- Categorize recyclables ♻️  
- Connect with NGOs and volunteers based on **location** 📍  
- Track and manage waste reduction progress 👣  

The frontend is built using **React.js + Node.js**, offering a seamless and responsive user experience.

---

## 🧭 Features Implemented

### 🔐 Authentication
- Login and Signup pages (fully responsive)
- Secure JWT-based authentication
- Validation and error handling

### 👥 Role-Based Dashboard
- Dynamic dashboards for **Volunteers** and **NGOs**
- Personalized profile pages
- Editable user information and bio

### 🧩 UI & UX
- Clean, modern, mobile-friendly UI
- Custom CSS styling with gradient themes
- Smooth animations and form transitions

### 📅 Core Functionalities (Planned/Upcoming)
- Schedule Pickups & Manage Requests  
- View and Edit Volunteering Opportunities  
- Real-time Messaging Interface  
- Notifications Panel with live updates  
- Theme Toggle (Light / Dark Mode)

---

## 🧱 Folder Structure
 ```bash
frontend/
│
├── public/
│ ├── index.html
│ ├── images # Images, icons, etc.
│ ├── favicon.ico
|
│ ├── components/
│ │ ├── Sidebar/
│ │ ├── Dashboard/
│ │ ├── Profile/
│ │ ├── Opportunities/
│ │ ├── SchedulePickup/
│ │ └── Messages/
├── src/
│ ├── assets/ 
│ ├── components/ # Reusable components
│ ├── pages/
│ │ ├── Login.jsx
│ │ ├── Signup.jsx
│ │ ├── login.css
│ │ ├── signup.css
│ ├── App.jsx
│ ├── Api.js
│ ├── App.css
│ ├── index.js
│ ├── index.css
│ ├── main.jsx
│ ├── protectedRoute.jsx
│
├── package.json
├── README.md
└── .env
 ```



---




## 🖼️ Screenshots  

| Page | Screenshot |
|------|-------------|
| 🏠 Schedule_Pickup| ![Pickup](./demo/Screenshot%202025-11-13%20184517.png) |
| 🏠 Schedule_Pickup| ![Pickup](./demo/Screenshot%202025-11-13%20184710.png) |
| 🏠 Edit_Schedule_Pickup| ![Pickup](./demo/Screenshot%202025-11-13%20185156.png) |
| 📊 Edit_Profile | ![Edit_Profil](./demo/Screenshot%202025-11-13%20184606.png) |
| 👥 Help | ![Help](./demo/Screenshot%202025-11-13%20184634.png) |
| 📋 Help | ![Help](./demo/Screenshot%202025-11-13%20184654.png) |
| 📋 Analytics | ![Analytics](./demo/Screenshot%202025-11-13%20184917.png) |
| 📋 Analytics | ![Analytics](./demo/Screenshot%202025-11-13%20185020.png) |
| 📋 Analytics | ![Analytics](./demo/Screenshot%202025-11-13%20185033.png) |
| 🏠Notification | ![Notification](./demo/Screenshot%202025-11-13%20184732.png) |
| 📋 Customize_user | ![Customize_user ](./demo/Screenshot%202025-11-13%20184946.png) |
| 🏠 NGO_Dashboard | ![Verify](../frontend/demo/Screenshot%202025-11-13%20185538.png) |
| 🏠 Volunteers | ![Verify](../frontend/demo/Screenshot%202025-11-13%20185608.png) |
| 🏠 Attendance | ![Verify](../frontend/demo/Screenshot%202025-11-13%20185623.png) |
| 🏠 NGO_Report | ![Verify](../frontend/demo/Screenshot%202025-11-13%20185728.png) |
| 📊 Reset_Password | ![Dashboard](./demo/Screenshot%202025-11-13%20185435.png) |

---
## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/WasteZero-Frontend.git
   cd WasteZero-Frontend
    ```
2. Install dependencies

 ```bash

npm install
 ```
3. Run the frontend server


 ```bash
 
npm start
 ```
4. Connect Backend

- Ensure your backend server (Node.js + Express + MongoDB) is running.

- Update the API URL in src/config.js or .env:

env
 ```bash
REACT_APP_API_URL=http://localhost:5000/api
 ```
## 🎯 Weekly Objectives

### 🗓️ Current & Upcoming Tasks
#### 🔹 Setup
- Initialize **Frontend (React + Node.js)** and **Backend (Node.js + Express)** applications.
- Configure **MongoDB** as the project database.

#### 🔹 Frontend Milestones
1. **Authentication**
   - ✅ Create Login Page (responsive, with backend integration)
   - ✅ Create Signup Page (responsive, role-based)
2. **Role-Based Pages**
   - ✅ Implement User Role-Based **Dashboard**
   - ✅ Implement User Role-Based **Profile Page**
3. **UI/UX Enhancements**
   - ✳️ Add **Theme Toggle (Dark/Light mode)**
   - ✳️ Add **Mockups for Edit, Create, and Manage Opportunities**
   - ✳️ Implement **Messages Page** (mockup + real-time chat)
   - ✳️ Implement **Schedule Pickup Page** (mockup + functional)

#### 🔹 Backend Milestones (for reference)
1. **Users API**
   - Create User model with the following schema:
     ```
     {
       id, name, email, password, role, skills, location, bio
     }
     ```
   - Implement CRUD APIs:
     - Create a User
     - Read all Users
     - Update a User
     - Delete a User
   - Integrate MongoDB and validate successful database queries.

2. **Additional Entities**
   - Applications  
   - Messages  
   - Notifications  
   - Pickups  
   - Opportunities  

3. **API Endpoints**
   - CRUD APIs for all entities.
   - WebSocket-based real-time chat feature.
   - Location-based volunteer-opportunity matching.
   - Notification system for updates.

---

## 🔗 Integration Specifications

| Feature | Description |
|----------|--------------|
| 🧾 **Authentication** | Secure Signup & Login via JWT |
| 🧑‍🤝‍🧑 **Role-Based Dashboard** | Dynamic pages for Volunteers and NGOs |
| 📍 **Smart Matching** | Location-based volunteer-opportunity linking |
| 💬 **Real-Time Chat** | Instant messaging powered by WebSockets |
| 🔔 **Notifications** | Instant updates for opportunities and messages |
| 🗓️ **Scheduling System** | Pickup scheduling with assigned agents |

---
## 🖥️ Expected Outcome

- ✅ Fully functional **frontend integrated** with backend APIs  
- ✅ Interactive **chat interface** for real-time communication  
- ✅ Smart **matching dashboard** showing relevant opportunities  
- ✅ Complete **profile management** with editing support  
- ✅ Responsive design across all devices 

## 🧩 Tech Stack
| Category               | Technologies               |
| ---------------------- | -------------------------- |
| **Frontend Framework** | React.js                   |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Real-Time Communication** | Socket.io |
| **Styling**            | CSS3, Flexbox, Gradient UI |
| **State Management**   | React Hooks                |
| **API Integration**    | Axios                      |
| **UI/UX** | Responsive design using CSS modules & Poppins font |
| **Authentication** | JWT (JSON Web Tokens) |
| **Version Control**    | Git & GitHub               |


## 👩‍💻 Author
### Shristi Rajpoot  
[LinkedIn](https://www.linkedin.com/in/shristi-rajpoot-36774b281/) • [GitHub](https://github.com/Shristirajpoot)


## 💚 Acknowledgments
Special thanks to my internship mentors and teammates for guidance and feedback.
WasteZero is developed as part of an internship project promoting Zero Waste & Green Living 🌱
