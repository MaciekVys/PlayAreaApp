import React, { useState } from "react";
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

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
  };

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
            href="/city"
            className={`menu-item ${
              location.pathname === "/city" ? "active" : ""
            }`}
          >
            City
          </a>
          <a
            href="/team"
            className={`menu-item ${
              location.pathname === "/team" ? "active" : ""
            }`}
          >
            mojadruzyna
          </a>
          <div
            className={`menu-item profile ${dropdownOpen ? "open" : ""}`}
            onClick={toggleDropdown} // Wywołanie funkcji przy kliknięciu
          >
            {username}
            <ul className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}>
              <li>
                <a href="/profile">profil gracza</a>
              </li>
              <li>
                <a href="/getChallenge">wyzwij mecz</a>
              </li>

              <li>
                <a href="/notification">Powiadomienia</a>
              </li>
              <li>
                <a href="/settings">ustawienia</a>
              </li>
              <li>
                <button onClick={logout}>Wyloguj</button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
