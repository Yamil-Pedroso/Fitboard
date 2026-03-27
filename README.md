<div align="center">
  <img src="/client/public/images/bg/fit_nut.webp" alt="Fitboard" width="500" />
</div>

<h1 align="center">Fitboard</h1>

<p align="center">
   A fitness and nutrition web platform to manage meals, recipes, routines, and progress, all in one place.
</p>

🔗 **Live demo:** [fitboard-six.vercel.app](https://fitboard-six.vercel.app/)

---

## Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Modules](#modules)
  - [Meals](#meals)
  - [Recipes](#recipes)
  - [Routines](#routines)
  - [Progress](#progress)
  - [Settings](#settings)
  - [Admin Dashboard](#admin-dashboard)
- [Roadmap](#roadmap)
- [About](#about)

---

## Overview

Fitboard is a full-stack web application built to centralize key areas of a fitness-oriented lifestyle. Instead of scattering information across multiple apps or notes, Fitboard brings meal logging, recipe management, workout planning, and progress tracking into one structured platform.

The goal is to provide a cleaner and more connected experience — where your data works together rather than in isolation.

**Key features:**
- Log daily meals by slot (breakfast, lunch, dinner, snack)
- Manage and reuse recipes with automatic macro calculation
- Plan and track workout routines
- Visualize fitness progress over time
- Personal settings and admin dashboard
- JWT-based authentication with cookie session support

---

## Screenshots

> 📸 Screenshots coming soon.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React + TypeScript | UI framework |
| Vite | Build tool |
| TanStack Router | Client-side routing |
| TanStack Query | Server state management |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Axios | HTTP client |
| Sonner | Toast notifications |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express | Server framework |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database and ODM |
| Zod | Schema validation |
| JWT + Cookies | Authentication |

### Services & Tooling

| Tool | Purpose |
|---|---|
| Cloudinary | Image storage |
| Swagger / OpenAPI | API documentation |
| Vercel | Deployment |

---

## Project Structure

```
fitboard/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── server.ts
│   └── package.json
└── client/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── hooks/
    │   ├── services/
    │   └── main.tsx
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB instance (local or Atlas)
- Cloudinary account (for image uploads)

### Installation

```bash
# Clone the repository
git clone https://github.com/Yamil-Pedroso/Fitboard.git
cd Fitboard

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../client && npm install
```

### Environment Variables

**Backend — create `backend/.env`:**

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=http://localhost:5173
```

**Frontend — create `client/.env`:**

```env
VITE_API_BASE_URL=http://localhost:3010/api/v1
```

### Running the App

```bash
# Start the backend (from /backend)
npm run dev

# Start the frontend (from /client)
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3010`.

---

## Modules

### Meals

The Meals module helps users log and organize daily food intake in a structured way. Each meal is assigned to a specific **date** and **slot** (breakfast, lunch, dinner, or snack).

Users can create meals in two ways:
- **Recipe-based:** link an existing recipe and define the number of servings
- **Custom item:** enter manual nutritional values (kcal, protein, carbs, fat)

**Features:**
- Create, update, and delete meals
- Filter meals by day or date range
- Automatic macro estimation for custom entries
- Pagination on the meals list
- Data isolated per authenticated user
- Validation ensures each entry is either recipe-based or custom — never both

---

### Recipes

The Recipes module allows users to create and manage reusable recipes that can be linked directly to meal entries. Each recipe stores ingredient data and nutritional information, enabling consistent macro tracking across the Meals module.

> Full documentation coming soon.

---

### Routines

The Routines module lets users plan and organize their workout schedules. Users can define exercise sets, repetitions, and rest times, and group them into named routines that can be reused across different days.

> Full documentation coming soon.

---

### Progress

The Progress module provides a visual overview of the user's fitness journey over time. It aggregates data from meals and routines to surface trends in nutrition and activity.

> Full documentation coming soon.

---

### Settings

The Settings module allows users to manage their profile information, update their password, and configure personal preferences such as daily nutrition targets.

> Full documentation coming soon.

---

### Admin Dashboard

A dedicated admin view for managing platform-level data, monitoring user activity, and handling administrative tasks. Access is restricted to users with admin privileges.

> Full documentation coming soon.

---

## Roadmap

Planned improvements across modules:

- [ ] Recipe picker in the Meals form (replace manual ID entry)
- [ ] Daily macro summary and progress bars
- [ ] Reusable frequent meals
- [ ] Meal notes and completion states
- [ ] Advanced routine tracking with rest timers
- [ ] Progress charts and historical comparisons
- [ ] Nutrition goal targets in Settings

---

## About

Fitboard is a personal portfolio project using a modern TypeScript-based stack. It covers real-world concerns such as authentication, data validation, cloud storage integration, and scalable API design.

Built by [Yamil Pedroso](https://github.com/Yamil-Pedroso).
