## Overview

This is the frontend application for the equipment management system, built with React, Vite, and TailwindCSS. It provides a user interface for authentication, equipment management, and request handling.

## Setup Instructions

### Prerequisites

- Node.js (version 16 or higher)
- Backend API running (see backend README)

### Installation

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (default Vite port).

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Project Structure

- `src/App.jsx` - Main application component with authentication logic
- `src/components/` - Reusable UI components
  - `auth/` - Authentication components
  - `equipment/` - Equipment management components
  - `layout/` - Layout components (AppShell)
  - `requests/` - Request handling components
- `src/api/` - API client functions for backend communication
- `src/assets/` - Static assets
- `public/` - Public assets

## Design Decisions

### Technology Stack

- **React 19**: Latest version for modern React features and performance improvements.
- **Vite**: Fast build tool and development server, chosen for its speed and modern ES module support.
- **TailwindCSS**: Utility-first CSS framework for rapid UI development and consistent styling.
- **ESLint**: Code linting for maintaining code quality and consistency.

### Architecture

- **Component-Based**: Modular components for reusability and maintainability.
- **State Management**: Local state with React hooks, with data persisted in localStorage for authentication.
- **API Layer**: Centralized API functions for backend communication.
- **Responsive Design**: TailwindCSS classes ensure the app works on various screen sizes.

### Styling

- **TailwindCSS**: Provides utility classes for quick styling without writing custom CSS.
- **Component Styling**: Inline classes and component-specific styles for maintainability.

### Authentication

- **Token-Based**: JWT tokens stored in localStorage for persistent sessions.
- **Protected Routes**: Components check authentication status before rendering.
