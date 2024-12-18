import React from "react";
import Search from "./search";
import "../styles/joinToTeam.scss"; // Upewnij się, że ścieżka do pliku CSS jest prawidłowa

const JoinToTeam = () => {
  return (
    <div className="join-to-team-container">
      <div className="join-container">
        <h1 className="join-title">Szukaj drużyny!</h1>
        <Search />
      </div>
    </div>
  );
};

export default JoinToTeam;
