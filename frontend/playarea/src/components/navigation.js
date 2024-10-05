import React from "react";
import { useLocation } from "react-router-dom";
import "../styles/navigation.scss";
import { Logout } from "./logout";
import Search from "./search";
import logo from "../images/logo.png";

const Navigation = () => {
  const isLogged = localStorage.getItem("isLogged");
  const username = localStorage.getItem("username");
  const { logout } = Logout();
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="logo">
        <a href="/home">
          <img src={logo} width="150" height="50" alt="logo" />
        </a>
      </div>
      <Search />
      {!isLogged ? (
        <div className="menu">
          <a href="/login" className="menu-item">
            Zaloguj
          </a>
          <a href="/register" className="menu-item">
            Zarejestruj Się
          </a>
        </div>
      ) : (
        <div className="menu">
          <a
            href="/team"
            className={`menu-item ${
              location.pathname === "/team" ? "active" : ""
            }`}
          >
            mojadruzyna
          </a>
          <a
            href="/city"
            className={`menu-item ${
              location.pathname === "/city" ? "active" : ""
            }`}
          >
            city
          </a>
          <a
            href="/profile"
            className={`menu-item ${
              location.pathname === "/profile" ? "active" : ""
            }`}
          >
            {username}
          </a>
          <button onClick={logout}>Wyloguj</button>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
