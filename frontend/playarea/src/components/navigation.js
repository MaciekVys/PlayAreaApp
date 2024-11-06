import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/navigation.scss";
import { Logout } from "./logout";
import Search from "./search";
import logo from "../images/logo3.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCity,
  faUsersViewfinder,
  faUserTie,
  faPersonWalkingArrowRight,
  faBell,
  faGamepad,
  faUserGear,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

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
            Miasto <FontAwesomeIcon icon={faCity} />
          </a>
          <a
            href="/team"
            className={`menu-item ${
              location.pathname === "/team" ? "active" : ""
            }`}
          >
            Drużyna <FontAwesomeIcon icon={faUsersViewfinder} />
          </a>
          <div
            className={`menu-item profile ${dropdownOpen ? "open" : ""}`}
            onClick={toggleDropdown}
          >
            <FontAwesomeIcon icon={faUserTie} />
            <ul className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}>
              <li>
                <a href="/profile">
                  profil gracza{"  "}
                  <FontAwesomeIcon icon={faPersonWalkingArrowRight} />
                </a>
              </li>
              <li>
                <a href="/getChallenge">
                  wyzwij mecz <FontAwesomeIcon icon={faGamepad} />
                </a>
              </li>

              <li>
                <a href="/notification">
                  Powiadomienia <FontAwesomeIcon icon={faBell} />
                </a>
              </li>
              <li>
                <a href="/settings">
                  ustawienia <FontAwesomeIcon icon={faUserGear} />
                </a>
              </li>
              <li>
                <button onClick={logout}>
                  Wyloguj <FontAwesomeIcon icon={faRightFromBracket} />{" "}
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
