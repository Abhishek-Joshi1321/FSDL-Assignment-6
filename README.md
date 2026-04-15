# ✦ Appointly — Online Appointment Booking System

A full-stack healthcare appointment booking application built with **Node.js**, **Express**, and an in-memory data store (MongoDB-compatible architecture). Features a beautiful, responsive UI with a refined medical luxury aesthetic.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Open in browser
http://localhost:3000
```

---

## 📁 Project Structure

```
appointly/
├── server.js              # Express server + all API routes
├── package.json
├── public/
│   ├── index.html         # Single Page Application
│   ├── css/
│   │   └── style.css      # Complete design system
│   └── js/
│       └── app.js         # Frontend logic
└── README.md
```

---

## 🔗 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | User login |
| POST | `/api/logout` | Logout |
| GET | `/api/me` | Get current user |
| GET | `/api/services` | List all services |
| GET | `/api/appointments` | Get user appointments |
| POST | `/api/appointments` | Book new appointment |
| PUT | `/api/appointments/:id` | Update appointment |
| DELETE | `/api/appointments/:id` | Delete appointment |
| GET | `/api/slots?date=YYYY-MM-DD` | Get available time slots |
| GET | `/api/stats` | Dashboard statistics |

---

## 🏥 Features

- **6 Healthcare Services**: Consultation, Checkup, Dental, Eye, Physio, Nutrition
- **Smart Booking Flow**: 4-step guided booking (Service → Date/Time → Auth → Confirm)
- **Real-time Slot Availability**: Conflict detection prevents double booking
- **User Authentication**: Session-based login/register
- **Personal Dashboard**: Track all appointments with status filters
- **Admin Features**: Confirm/cancel any appointment
- **Responsive Design**: Works on mobile, tablet, desktop

---

## 🎨 Design System

- **Fonts**: Playfair Display (headings) + DM Sans (body)
- **Colors**: Deep Teal primary, Coral accent, Warm Ivory background
- **Aesthetic**: Refined Medical Luxury — elegant, clean, trustworthy

---

## 🔄 Switching to Real MongoDB

Replace the `dataStore` in `server.js` with actual Mongoose models:

```js
// .env
MONGODB_URI=mongodb://localhost:27017/appointly
SESSION_SECRET=your-secret-key

// server.js
mongoose.connect(process.env.MONGODB_URI);
```

The API structure is fully compatible — just swap the in-memory arrays for Mongoose queries.

---

## 🧪 Test Credentials

Register any account via the UI. First registered user can book appointments.
To make an admin: manually set `role: 'admin'` in the dataStore.users array.
