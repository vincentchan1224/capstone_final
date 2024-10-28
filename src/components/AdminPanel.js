import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ViewPlayers from "./ViewPlayers";
import ViewKeepers from "./ViewKeepers";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [adminEmail, setAdminEmail] = useState(
    localStorage.getItem("adminEmail") || ""
  );
  const [currentView, setCurrentView] = useState("welcome");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminEmail");
    navigate("/admin-login");
  };

  const renderView = () => {
    switch (currentView) {
      case "viewPlayers":
        return <ViewPlayers />;
      case "viewKeepers":
        return <ViewKeepers />;
      case "welcome":
      default:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Welcome to the Admin Panel
            </h2>
            <p>Select an option from the menu to manage the game.</p>
          </div>
        );
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <h1 className="admin-header">Admin Panel</h1>
        <nav className="admin-nav">
          <button
            onClick={() => setCurrentView("welcome")}
            className={`admin-nav-item ${currentView === "welcome" ? "active" : ""}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView("viewPlayers")}
            className={`admin-nav-item ${currentView === "viewPlayers" ? "active" : ""}`}
          >
            View Players
          </button>
          <button
            onClick={() => setCurrentView("viewKeepers")}
            className={`admin-nav-item ${currentView === "viewKeepers" ? "active" : ""}`}
          >
            View Keepers
          </button>
        </nav>
        <div className="admin-logout">
          <p className="mb-2 text-sm">Logged in as: {adminEmail}</p>
          <button onClick={handleLogout} className="admin-logout-btn">
            Logout
          </button>
        </div>
      </div>
      <div className="admin-content">
        <h2 className="admin-content-header">
          {currentView === "welcome"
            ? "Dashboard"
            : currentView === "viewPlayers"
              ? "View Players"
              : "View Keepers"}
        </h2>
        {renderView()}
      </div>
    </div>
  );
};

export default AdminPanel;
