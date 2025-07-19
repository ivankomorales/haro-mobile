# Haro Mobile – Frontend (React + TailwindCSS)

This is the frontend interface for **Haro Mobile**, a responsive PWA for managing custom ceramic orders. It's designed to integrate with the Haro Mobile API and provides a clean, user-friendly experience with support for light/dark mode, authentication, and dynamic form interactions.

## Tech Stack

- **React** – UI framework (Vite + JSX)
- **Tailwind CSS** – Utility-first styling
- **Dark Mode** – Follows OS preference with optional manual toggle
- **Context API** – Auth and global state
- **Responsive Design** – Mobile-first layout

## Project Structure
```
frontend/
│
├── components/ # Reusable UI components
├── context/ # Auth and app-level context
├── pages/ # Page-level views (Login, Dashboard, etc.)
├── styles/ # Global Tailwind + CSS customization
├── App.jsx # Main app with routes and layout
├── main.jsx # Entry point
├── tailwind.config.js # Tailwind configuration
└── index.css # Global CSS + dark mode autofill fixes
```

## Auth Integration

- The login form uses Context to call the `login(email, password)` method.
- After login, the JWT token is stored securely and passed in requests.
- Protected routes require a valid token to access.

## Features Implemented

- Light/dark mode via `class="dark"` on `<html>` and OS preference detection
- Autofill fixes for inputs with custom background and label animations
- Floating label inputs using Tailwind and `peer` selectors
- Dark mode compatible styling with full theme switch support
- Mobile-first layout with accessibility-friendly forms

## Development Setup

1. Clone the repository and navigate into the `frontend/` folder

2. Install dependencies:

```
npm install
Start the dev server:

npm run dev
```
Make sure the backend API is running on the expected port (e.g., http://localhost:5000)

### .gitignore (sensitive files)

Make sure the following are excluded:

```
node_modules/
.env
dist/
.vscode/
.DS_Store
```
### Next Steps
Hook up the login to actual API JWT flow

Implement protected routes and dashboard layout

Build order listing and new order forms

Add error handling and toast messages