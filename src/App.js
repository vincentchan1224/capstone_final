import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";
import MainPage from "./components/MainPage";
import Profile from "./components/Profile";
import Asset from "./components/Asset";
import Mailbox from "./components/Mailbox";
import Friends from "./components/Friends";
import Settings from "./components/Settings";
import About from "./components/About";
import MyGuild from "./components/MyGuild";
import Event from "./components/Event";
import Boss from "./components/Boss";
import Explore from "./components/Explore";
import Status from "./components/Status";
import Keeper from "./components/Keeper";
import SummonKeeper from "./components/SummonKeeper";
import MyKeeper from "./components/MyKeeper";
import KeeperDetail from "./components/KeeperDetail";
import BossFighting from "./components/BossFighting";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("userId") !== null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem("adminEmail") !== null;
  return isAdmin ? children : <Navigate to="/admin-login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <div className="admin-container">
                <AdminPanel />
              </div>
            </AdminRoute>
          }
        />

        {/* Game routes */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="game-container">
                <Routes>
                  <Route path="/" element={<MainPage />} />
                  <Route path="/main" element={<MainPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/asset" element={<Asset />} />
                  <Route path="/mailbox" element={<Mailbox />} />
                  <Route path="/friends" element={<Friends />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/myguild" element={<MyGuild />} />
                  <Route path="/event" element={<Event />} />
                  <Route path="/boss" element={<Boss />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/status" element={<Status />} />
                  <Route path="/keeper" element={<Keeper />} />
                  <Route path="/summon-keeper" element={<SummonKeeper />} />
                  <Route path="/my-keeper" element={<MyKeeper />} />
                  <Route path="/keeper/:keeperId" element={<KeeperDetail />} />
                  <Route path="/boss-fighting" element={<BossFighting />} />
                </Routes>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
