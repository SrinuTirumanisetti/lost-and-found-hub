# Lost & Found Hub

## Project Overview

Welcome to the Lost & Found Hub, a platform designed to connect lost items with their rightful owners. This application provides a centralized system for users to report lost items and for finders to register found items, facilitating the return process.

## Features

### User Authentication
- **Register:** New users can create an account with robust password validation (minimum 8 characters, including uppercase, lowercase, number, and special character).
- **Login:** Registered users can log in with their email and password. Specific error messages are provided for invalid email or password.
- **Session Management:** Users remain logged in across sessions, with token verification for security.

### Lost & Found Functionality (Planned/Future)
- Users can post details about lost items.
- Users can post details about found items.
- Communication features between finders and owners.

## Technologies Used

### Frontend
- **React:** A JavaScript library for building user interfaces.
- **React Router DOM:** For declarative routing in the application.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **Sonner (Toaster):** For displaying toast notifications.
- **@tanstack/react-query:** For data fetching, caching, and synchronization.

### Backend
- **Node.js/Express.js:** A robust framework for building APIs.
- **Mongoose:** An ODM (Object Data Modeling) library for MongoDB and Node.js.
- **MongoDB:** A NoSQL database for storing application data.
- **Bcrypt.js:** For password hashing and security.
- **JSON Web Tokens (JWT):** For secure user authentication and authorization.

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher) or yarn
- MongoDB instance (local or cloud-hosted)

### Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory and add your MongoDB URI and JWT Secret:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:5000`.

### Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000` (or another available port).

## Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Register a new user account or log in with existing credentials.
3. Explore the dashboard (User or Admin, depending on your role).

