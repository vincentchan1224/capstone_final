import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Layout = ({ children, onRefresh }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const menuItems = [
    { name: "Home", route: "/main" },
    { name: "Profile", route: "/profile" },
    { name: "Asset", route: "/asset" },
    { name: "Mailbox", route: "/mailbox" },
    { name: "Friends", route: "/friends" },
    { name: "Settings", route: "/settings" },
    { name: "About", route: "/about" },
    { name: "My Guild", route: "/myguild" },
    { name: "Summon Keeper", route: "/summon-keeper" },
    { name: "Explore", route: "/explore" },
  ];

  const getTitle = () => {
    const path = location.pathname.substring(1); // Remove leading slash
    if (path === "" || path === "main") return "Main Menu";
    return (
      path.charAt(0).toUpperCase() +
      path
        .slice(1)
        .replace(/([A-Z])/g, " $1")
        .trim()
    );
  };

  return (
    <div className="h-screen flex flex-col mx-auto max-w-md bg-gray-100 shadow-lg relative">
      <header className="bg-blue-500 text-white p-2 flex justify-between items-center">
        <button onClick={toggleNav} className="text-xl">
          ☰
        </button>
        <h1 className="text-lg font-bold">LordRPG</h1>
        <button onClick={handleRefresh} className="text-xl">
          ↻
        </button>
      </header>

      <div className="bg-blue-400 text-white p-1 flex justify-between items-center">
        <button onClick={handleBack} className="text-lg">
          ←
        </button>
        <h2 className="text-base font-semibold">{getTitle()}</h2>
        <div className="w-6"></div>
      </div>

      <main className="flex-grow overflow-y-auto p-4">{children}</main>

      {isNavOpen && (
        <nav className="absolute top-[104px] left-0 h-[calc(100%-104px)] w-1/2 bg-white shadow-lg p-4 z-10 overflow-y-auto">
          <button
            onClick={toggleNav}
            className="absolute top-2 right-2 text-2xl"
          >
            ×
          </button>
          <ul className="mt-8">
            {menuItems.map((item) => (
              <li key={item.name} className="mb-4">
                <Link
                  to={item.route}
                  className="text-blue-500"
                  onClick={toggleNav}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            <li className="mb-4">
              <button
                onClick={() => {
                  handleLogout();
                  toggleNav();
                }}
                className="text-blue-500"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Layout;
