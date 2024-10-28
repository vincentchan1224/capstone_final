# LordRPG - Idle Game

LordRPG is an idle game where players can manage their character, summon and collect keepers, and engage in various activities.

## Features

- User authentication (login and registration)
- Character status management
- Asset management (coins and gems)
- Keeper summoning system
- Keeper collection and management
- Mobile-first responsive design
- Navigation menu with various game sections
- Detailed view for individual keepers

## Components

- MainPage: The central hub for accessing different game features
- Status: View and manage character stats
- Keeper: Access keeper-related features
- MyKeeper: View collected keepers
- SummonKeeper: Summon new keepers
- Assert: Manage in-game assets (coins and gems)
- MyGuild: Guild-related features
- Event: Access game events
- Boss: Boss battle feature
- Explore: Exploration feature
- KeeperDetail: Display detailed information about a specific keeper

## Getting Started

1. Clone the repository
2. Install dependencies for both frontend and backend: `cd capstone_final
npm install
cd backend
npm install  `
3. Set up a Firebase project and add the configuration to your backend
4. Create a `.env` file in the backend directory with the following variables: `FIREBASE_API_KEY=your_api_key
FIREBASE_DATABASE_URL=your_database_url  `
5. Run the backend server: `cd backend
npm start  `
6. Run the frontend development server: `cd ..
npm start  `

## Account info

Accessing the Application:

Frontend: http://localhost:3000/

Login Credentials:

Email: vincentchan1224@gmail.com
Password: 123456
Admin Login: http://localhost:3000/admin-login

Admin Credentials:
Email: vincentchan1224@gmail.com
Password: 123456

## Technologies Used

- React (with React Router for navigation)
- Node.js
- Express
- Firebase (Authentication and Firestore)
- Tailwind CSS for styling

## Project Structure

- `/src`: React frontend code
  - `/components`: React components for each game feature
  - `/services`: API service for backend communication
- `/backend`: Node.js backend code
  - `server.js`: Main server file
  - `/routes`: API route handlers

## License

This project is licensed under the MIT License.

## Database Structure

The game uses two main collections in Firestore:

1. `users`: Stores user data, including:

   - Basic user information
   - Assets (coins, gems)
   - An array of keeper IDs owned by the user

2. `keepers`: Stores individual keeper data, including:
   - Keeper stats (HP, MP, strength, etc.)
   - Keeper level and experience
   - Keeper type and rarity

This structure allows for efficient querying and updates, as well as easier management of keeper data across multiple users.
