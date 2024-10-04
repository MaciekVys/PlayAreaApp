import React from "react";
import "../styles/navigation.scss";
import { Logout } from "./logout";

const Navigation = () => {
  const isLogged = localStorage.getItem("isLogged");
  const username = localStorage.getItem("username");
  const { logout } = Logout();

  return (
    <nav className="navigation">
      <div className="logo">
        <a href="/home">
          <h1>PlayArea</h1>
        </a>
      </div>
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
          <a href="/team" className="menu-item">
            mojadruzyna
          </a>
          <a href="/city" className="menu-item">
            city
          </a>
          <a href="/profile" className="menu-item">
            {username}
          </a>
          <button onClick={logout}>Wyloguj</button>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
