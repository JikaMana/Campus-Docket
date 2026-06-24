# Campus Docket

A React + TypeScript + Vite dashboard for managing campus complaints, student requests, SRC officer workflows, and super admin operations.

## Overview

Campus Docket is a role-based campus management application built with Vite, React, TypeScript, Firebase, and Tailwind CSS.
It enables students to submit and track complaints, SRC officers to manage complaints and chat with students, and super admins to manage universities, view analytics, and access admin chat.

## Features

- Student complaint submission, tracking, and detail views
- SRC officer complaint management and communication
- Super admin university management, analytics, and chat
- Role-based protected routing for `student`, `src_officer`, and `super_admin`
- Firebase authentication, Firestore, and storage integration
- React Query for data fetching and caching
- Reusable UI components with Radix UI and Tailwind CSS
- Notifications via Sonner

## Tech Stack

- React 19
- TypeScript 6
- Vite
- Firebase
- Tailwind CSS 4
- React Router DOM 7
- @tanstack/react-query
- Radix UI
- Zod
- Sonner

## Project Structure

- `src/main.tsx` — application entry point
- `src/App.tsx` — router setup with public and protected routes
- `src/lib/firebase.ts` — Firebase config and initialization
- `src/hooks/use-auth.tsx` — authentication context and provider
- `src/components/layout/ProtectedRoute.tsx` — role-based route guard
- `src/components/layout/GuestRoute.tsx` — guest-only route guard
- `src/pages/` — top-level page components
  - `LandingPage`, `LoginPage`, `SignupPage`
  - `student/` pages
  - `admin/` pages
  - `super-admin/` pages

## Routes

Public routes:

- `/`
- `/login`
- `/signup`

Student routes:

- `/dashboard`
- `/complaints`
- `/complaints/new`
- `/complaints/:id`

SRC officer routes:

- `/admin/dashboard`
- `/admin/complaints`
- `/admin/complaints/:id`
- `/admin/chat`

Super admin routes:

- `/super-admin/universities`
- `/super-admin/universities/new`
- `/super-admin/analytics`
- `/super-admin/chat`

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Lint the codebase

```bash
npm run lint
```

## Firebase Setup

The app uses Firebase in `src/lib/firebase.ts`.
If you want to use your own Firebase project, replace the config object in that file with your project credentials or add environment-based config support.

> The current repository uses a hard-coded Firebase configuration object. For production use, move secrets into environment variables and secure your Firebase config.

## Notes

- This project is primarily a frontend application.
- Authentication and authorization flows are built into the app, but Firestore rules and backend validation should be configured separately for production.
- Add tests, environment configuration, and explicit license information before publishing.
