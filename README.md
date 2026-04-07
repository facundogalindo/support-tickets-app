# Support Tickets App

A full stack ticket management system built with Node.js, Express, PostgreSQL, React, and Vite.  
It includes authentication, role-based access control, ticket lifecycle management, and an admin reporting dashboard with filters and charts.

---

## 🚀 Live Demo

Frontend: https://support-tickets-app.vercel.app/  
Backend: https://support-tickets-app.onrender.com/

---

## 📌 Features

- User registration and login
- JWT-based authentication
- Role-based access control (user / agent)
- Password recovery via email
- Ticket creation and lifecycle management
- Ticket assignment to agents
- Internal ticket messaging system
- Ticket status change tracking
- Transaction history for ticket actions
- Admin reporting dashboard
- Filters, pagination, and KPIs
- Bar chart and pie chart visualization

---

## 🧠 Architecture

### Backend
- Controllers → handle HTTP requests
- Services → business logic
- Repositories → database access
- Middlewares → authentication & authorization
- Observers → event-based actions (email notifications)
- Utils → helpers and state logic

### Frontend
- Pages → main views
- Components → reusable UI
- Context → global state (auth)
- Services → API calls
- Types → TypeScript models

---

## 🛠 Tech Stack

### Backend
- Node.js
- Express
- PostgreSQL
- JWT (authentication)
- bcrypt (password hashing)
- Nodemailer (email service)

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- Recharts (charts)

---

## 📸 Screenshots
Login





<img width="759" height="655" alt="image" src="https://github.com/user-attachments/assets/bcbf581d-d8ab-41f0-8902-c7434efb64f3" />


Password recovery

<img width="737" height="611" alt="image" src="https://github.com/user-attachments/assets/1a98196f-716b-4c95-96c7-9e2c7e819801" />

Register

<img width="558" height="722" alt="image" src="https://github.com/user-attachments/assets/c3385eda-cfcb-4774-a378-47045d9ba69c" />

User page

<img width="1076" height="703" alt="image" src="https://github.com/user-attachments/assets/dfc74e09-8859-47b8-ae62-b5983a881a34" />

Agent page

<img width="1051" height="907" alt="image" src="https://github.com/user-attachments/assets/cf1774f7-3243-47b7-8359-a717230e6b17" />

Report 

<img width="1194" height="905" alt="image" src="https://github.com/user-attachments/assets/74e04c00-6076-45b1-a212-a850f11a05e7" />




## ⚙️ Installation

### 1. Clone repository

git clone https://github.com/facundogalindo/support-tickets-app.git  
cd support-tickets-app  

---

### 2. Backend setup

cd backend  
npm install  
npm run dev  

---

### 3. Frontend setup

cd frontend  
npm install  
npm run dev  

---

## 🔐 Environment Variables

Create a `.env` file inside the backend folder:

PORT=3001  
DATABASE_URL=your_database_url  
JWT_SECRET=your_jwt_secret  
FRONTEND_URL=http://localhost:5173  

MAIL_USER=your_email  
MAIL_PASS=your_password  
MAIL_FROM=your_email  

NODE_ENV=development  

---

## 📊 Key Concepts Implemented

- Layered architecture (Controller / Service / Repository)
- Authentication with JWT
- Role-based authorization (RBAC)
- Password reset flow with secure token
- Transaction handling in database operations
- Event-driven logic using an event bus
- Reporting system with KPIs and filtering
- Data visualization with charts

---

## 📌 Project Structure

backend/  
  src/  
    controllers/  
    services/  
    repositories/  
    middlewares/  
    observers/  
    utils/  

frontend/  
  src/  
    pages/  
    components/  
    context/  
    services/  
    types/  

---

## 👨‍💻 Author

Facundo Galindo  

LinkedIn: https://www.linkedin.com/in/facundo-galindo/  
GitHub: https://github.com/facundogalindo  
Email: galindofacundo@gmail.com  

---

## 📈 Status

Actively maintained and continuously improving 🚀
