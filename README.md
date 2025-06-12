# JABBER: Room Management System

<p align="center">
  <img src="https://img.shields.io/github/license/yourusername/room_management_system?style=flat-square&color=purple" alt="License"/>
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white&style=flat-square" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Frontend-Next.js-000?logo=next.js&logoColor=white&style=flat-square" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white&style=flat-square" alt="MySQL"/>
  <img src="https://img.shields.io/github/contributors/yourusername/room_management_system?style=flat-square&color=blueviolet" alt="Contributors"/>
  <img src="https://img.shields.io/github/last-commit/yourusername/room_management_system?style=flat-square&color=blue" alt="Last Commit"/>
</p>

---

<h2 align="center">🚀 Project Overview</h2>

> **Jabber** is a modern, full-stack web application for managing classroom bookings. Built with ❤️ using FastAPI, Next.js, and MySQL, it empowers instructors and admins to efficiently manage room reservations, view real-time availability, and streamline campus logistics.

---

## ✨ Features

- 🔐 **Instructor registration and login**
- 🔒 Secure session-based authentication
- 🔎 Search and filter classrooms by type, capacity, equipment, and status
- 🗓️ Book classrooms for specific time slots
- 📝 View, edit, and cancel your bookings
- ✅ Mark bookings as ended (manual release)
- 🟢 Real-time classroom status updates
- 📱 Responsive, modern UI

---

## 🛠️ Tech Stack

| Frontend | Backend | Database | UI/UX |
|----------|---------|----------|-------|
| ![Next.js](https://img.shields.io/badge/Next.js-000?logo=next.js) | ![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi) | ![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql) | ![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss) |
| React, TypeScript | Python | MySQL | Radix UI, Lucide Icons, Sonner |

---

## 📦 Project Structure

```text
room_management_system/
├── index.py                # FastAPI backend
├── models.py               # Pydantic models
├── db_con.py               # Database connection
├── frontend/
│   └── jabber-management/  # Next.js frontend app
│       ├── app/            # Pages and routes
│       ├── components/     # UI components
│       └── ...
├── db_structure.sql        # Database schema
├── .gitignore
└── README.md
```

---

## ⚡ Setup Instructions

### 1. 🚥 Clone the repository
```bash
git clone https://github.com/yourusername/room_management_system.git
cd room_management_system
```

### 2. 🐍 Backend Setup (FastAPI)
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install fastapi uvicorn mysql-connector-python bcrypt python-dotenv
```
- Configure your database connection in `db_con.py` and ensure your MySQL server is running.
- Start the backend server:
```bash
uvicorn index:app --reload
```

### 3. ⚛️ Frontend Setup (Next.js)
```bash
cd frontend/jabber-management
npm install
npm run dev
```
- The frontend will run on [http://localhost:3000](http://localhost:3000)

---

## 🧑‍💻 Usage Instructions

- 📝 Register as an instructor and log in.
- 🏫 Browse classrooms, filter by type, status, or equipment.
- 📅 Book a classroom for a specific time slot.
- 📋 View your bookings, edit or cancel them as needed.
- ✅ When finished with a booking, click "Mark as Ended" to release the room.
- 🟢 Only available rooms can be booked.

---

## 📚 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/auth/register` | Register a new instructor |
| POST   | `/auth/login`    | Log in |
| GET    | `/auth/logout`   | Log out |
| GET    | `/auth/user`     | Get current user info |
| GET    | `/classroom/search` | Search/filter classrooms |
| GET    | `/classroom/{id}`   | Get classroom details |
| POST   | `/create-booking`   | Create a booking |
| GET    | `/bookings/user`    | List your bookings |
| PUT    | `/booking/{booking_id}` | Edit a booking |
| DELETE | `/booking/{booking_id}` | Delete a booking |
| POST   | `/finish-usage/{booking_id}` | Mark a booking as ended |

---

## 💡 Tips

- 🎯 Use the filters on the classrooms page to quickly find the right room.
- ⏰ Only one active booking per classroom per time slot is allowed.
- ✅ Always "Mark as Ended" when you finish using a room to free it for others.
- 🐞 If you encounter issues, check your backend and frontend logs for errors.

---

## 🤝 Contributing

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/yourusername/room_management_system/pulls)

1. Fork the repo and create your branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -am 'Add some feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a pull request

---

## 📞 Support
For questions or support, open an issue on GitHub or contact the maintainer.

---

## 📝 License

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg?style=flat-square)](LICENSE) 
