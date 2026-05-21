# Quotes/Shayari/Status App

A full-stack mobile-first application for sharing quotes, shayari, and status updates.

## Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Real-time**: Socket.io
- **Maps**: Leaflet.js
- **Auth**: JWT (JSON Web Tokens)

## Features
- **User Auth**: Sign up, Login, Logout.
- **Profiles**: Personalized bio and profile photo.
- **Post System**: Create text, image, or video posts.
- **Interactions**: Like and comment on posts.
- **Stories**: 24-hour auto-deleting stories.
- **Real-time Chat**: Private messaging between users.
- **Map View**: Find nearby users using geolocation.
- **Search**: Search for other users.
- **Categories**: Filter posts by Love, Sad, Motivational, etc.
- **Mobile First**: Optimized for mobile screens with a clean UI.

## Installation

1. **Clone the project**
2. **Install dependencies**:
   ```bash
   cd quotes-app
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root (already provided with defaults) and update `MONGODB_URI` if necessary.
4. **Run the app**:
   ```bash
   npm start
   ```
5. **Open in browser**:
   Navigate to `http://localhost:5000`

## Project Structure
- `server.js`: Main entry point.
- `server/`: Backend logic (Models, Routes, Controllers).
- `public/`: Frontend static files (HTML, CSS, JS).
- `uploads/`: Media storage for posts, profiles, and stories.

## Notes
- Geolocation requires HTTPS or `localhost` to work in most browsers.
- MongoDB must be running locally or use a remote URI in `.env`.
