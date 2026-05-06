# Team Task Manager - Implementation Walkthrough

The Team Task Manager application has been successfully built! This document outlines the architecture, implementation details, and features of the project based on the MERN stack with Tailwind CSS.

## Features Implemented

> [!NOTE]
> All core requirements, backend requirements, and frontend requirements specified have been fulfilled.

1. **Authentication System**:
   - `JWT`-based authentication implemented.
   - Passwords are securely hashed using `bcryptjs`.
   - Role-based authorization (`Admin` and `Member`) is handled both in the Express routes and React frontend.

2. **Project Management**:
   - Admins can create, update, and manage projects.
   - Projects track `members`, `createdBy`, `name`, and `description`.
   - The UI includes modals for creating projects and assigning members from the existing user base.

3. **Task Management**:
   - Tasks are linked to specific projects and assigned to users.
   - Status tracking (`Todo`, `In Progress`, `Done`).
   - Overdue tasks are visually highlighted with red borders and indicators.

4. **Dashboard**:
   - Displays a Kanban-like view for tasks assigned specifically to the logged-in user.
   - Dynamic filtering by task status into three respective columns.

## Architecture and Structure

### Backend (Node.js + Express + MongoDB)
Located in `/backend`

- **MVC Pattern**: The backend adheres to the Model-View-Controller pattern (acting as a JSON API). 
  - **Models**: Defines schemas in `/models` (`User.js`, `Project.js`, `Task.js`).
  - **Controllers**: Contains business logic in `/controllers` (e.g., `authController.js`).
  - **Routes**: Defines endpoints and attaches middleware in `/routes`.
- **Middleware**:
  - `auth.js` contains `protect` (verifies JWT) and `admin` (verifies role) middlewares.
- **Security**: Includes CORS and avoids sending sensitive data (like passwords) to the frontend.

### Frontend (React + Vite + Tailwind CSS v4)
Located in `/frontend`

- **State Management**:
  - `AuthContext.jsx` provides global authentication state and handles login/register/logout flows seamlessly using the Context API.
- **Routing**:
  - `react-router-dom` is used for SPA navigation.
  - `ProtectedRoute.jsx` wraps private components, ensuring only authenticated users can view the dashboard and projects.
- **API Client**:
  - `services/api.js` configures Axios with an interceptor to automatically attach the `Bearer <token>` to all outgoing requests.
- **UI Components**:
  - `lucide-react` used for consistent, modern SVG icons.
  - `react-hot-toast` used for non-blocking toast notifications (success/error).
  - Designed using modern standard UI practices: rounded corners, clean layouts, subtle shadows, and responsive tables.


## How to Run Locally

You can run the application with the following steps:

1. **Start MongoDB**: Ensure you have a local MongoDB instance running on `localhost:27017` or update the `.env` file in `/backend` with an Atlas URI.
2. **Run Backend**:
   ```bash
   cd backend
   npm install
   npm run dev (or node server.js)
   ```
3. **Run Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

