import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/myTeam.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faUsers,
  faFutbol,
  faCircleRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  ME_QUERY,
  TEAM_BY_ID,
  TEAM_STATISTICS_SUMMARY_QUERY,
} from "../queries/queries";
import { SEND_JOIN_REQUEST } from "../queries/mutations";

const UserTeam = () => {
  const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;
  const { id } = useParams();
  const [tabs, setTabs] = useState("squad");
  const navigate = useNavigate();

  // Query to check if the user has a team
  const {
    data: userData,
    loading: loadingUser,
    error: userError,
  } = useQuery(ME_QUERY);

  // Existing query for team details
  const { data, loading, error } = useQuery(TEAM_BY_ID, {
    variables: { id },
  });
  const team = data?.teamById;

  const {
    data: statsData,
    loading: loadingStats,
    error: errorStats,
  } = useQuery(TEAM_STATISTICS_SUMMARY_QUERY, {
    variables: { teamId: id },
  });

  // Initialize the sendJoinRequest mutation
  const [
    sendJoinRequest,
    { loading: joining, error: joinError, data: joinData },
  ] = useMutation(SEND_JOIN_REQUEST, {
    variables: { teamId: id },
    refetchQueries: [{ query: TEAM_BY_ID, variables: { id } }],
  });

  // Handle join request
  const handleJoinRequest = async () => {
    try {
      await sendJoinRequest();
      alert(
        joinData?.sendJoinRequest.message || "Prośba o dołączenie wysłana!"
      );
    } catch (e) {
      console.error("Błąd przy wysyłaniu prośby o dołączenie:", e);
    }
  };

  // Loading state for user team check
  if (loadingUser) return <p>Ładowanie danych użytkownika...</p>;

  // Error handling
  if (userError) return <p>Błąd: {userError.message}</p>;

  if (loading || loadingStats) return <p>Ładowanie danych drużyny...</p>;

  // Check for team errors
  if (error) return <p>Błąd: {error.message}</p>;
  if (errorStats)
    return <p>Błąd w ładowaniu statystyk: {errorStats.message}</p>;

  const userHasTeam = userData?.me?.team !== null;
  const isCaptain = userData?.me?.captainOfTeam !== null;

  console.log("Czy użytkownik ma drużynę?", userHasTeam);

  if (!team) {
    return (
      <div className="no-team-container">
        <h1>Nie należysz do żadnej drużyny!</h1>
        <div>
          <button
            className="primary-button"
            onClick={() => navigate("/createTeam")}
          >
            Załóż drużynę
          </button>
          {!userHasTeam && (
            <button className="secondary-button" onClick={handleJoinRequest}>
              Dołącz do drużyny
            </button>
          )}
        </div>
      </div>
    );
  }

  // Creating a stats map for each player
  const playerStatsMap = {};
  if (statsData?.teamStatisticsSummary) {
    statsData.teamStatisticsSummary.forEach((stat) => {
      playerStatsMap[stat.user.username] = {
        totalGoals: stat.totalGoals || 0,
        totalAssists: stat.totalAssists || 0,
        totalMvps: stat.totalMvps || 0,
      };
    });
  }

  return (
    <>
      <div className="container">
        <div className="team-info">
          {team.logo ? (
            <img src={`${MEDIA_URL}${team.logo}`} alt={`${team.name} logo`} />
          ) : (
            <div className="placeholder-logo">Brak logo</div>
          )}
          <div className="left-side">
            <h1>{team.name}</h1>
            <p>Liczba graczy: {team.playersCount}</p>
            <p>Liczba meczów: {team.matchesCount}</p>
            <p>Miasto: {team.league?.city?.name || "Brak miasta"}</p>
            <p>Liga: {team.league?.name || "Brak ligi"}</p>
            <p>Kapitan: {team.captain?.username || "Brak kapitana"}</p>
          </div>
          {!isCaptain && (
            <button
              className="leave-button"
              onClick={handleJoinRequest}
              disabled={joining}
            >
              {joining ? "Wysyłanie..." : "Dołącz do drużyny"}
              <FontAwesomeIcon icon={faRightFromBracket} />
            </button>
          )}
        </div>
      </div>
      <div className="tabs">
        <button
          className={tabs === "squad" ? "active" : ""}
          onClick={() => setTabs("squad")}
        >
          Skład <FontAwesomeIcon icon={faUsers} />
        </button>
        <button
          className={tabs === "matches" ? "active" : ""}
          onClick={() => setTabs("matches")}
        >
          Mecze <FontAwesomeIcon icon={faFutbol} />
        </button>
      </div>
      <div className="second-container">
        {tabs === "squad" && (
          <>
            <h1>Gracze</h1>
            <table className="table">
              <thead>
                <tr>
                  <th>Zdjęcie</th>
                  <th>Imię Użytkownika</th>
                  <th>Pozycja</th>
                  <th>Gole</th>
                  <th>Asysty</th>
                  <th>MVP</th>
                </tr>
              </thead>
              <tbody>
                {team.players.map((player) => {
                  const playerStats = playerStatsMap[player.username] || {};
                  return (
                    <tr key={player.id}>
                      <td></td>
                      <td
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/profile/${player.id}`)}
                      >
                        {player.username}
                      </td>
                      <td>{player.position || "Nieznana"}</td>
                      <td>{playerStats.totalGoals || 0}</td>
                      <td>{playerStats.totalAssists || 0}</td>
                      <td>{playerStats.totalMvps || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {tabs === "matches" && (
          <>
            <h1>Mecze</h1>
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Gospodarze</th>
                  <th>Wynik</th>
                  <th>Goście</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {team.matches.map((match, index) => (
                  <tr key={index}>
                    <td>{match.matchDate}</td>
                    <td
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/team/${match.homeTeam.id}`)}
                    >
                      <div style={{ padding: "5px", alignItems: "center" }}>
                        {match.homeTeam.name}
                        <img
                          style={{
                            width: "20px",
                            height: "auto",
                            marginLeft: "0",
                            float: "right",
                          }}
                          src={`${MEDIA_URL}${match.homeTeam.logo}`}
                          alt={`${match.homeTeam.logo} logo`}
                        />
                      </div>
                    </td>
                    <td>
                      {match.scoreHome} : {match.scoreAway}
                    </td>
                    <td
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/team/${match.awayTeam.id}`)}
                    >
                      <div style={{ padding: "5px", alignItems: "center" }}>
                        {match.awayTeam.name}
                        <img
                          style={{
                            width: "20px",
                            height: "auto",
                            marginLeft: "0",
                            float: "left",
                          }}
                          src={`${MEDIA_URL}${match.awayTeam.logo}`}
                          alt={`${match.awayTeam.logo} logo`}
                        />
                      </div>
                    </td>
                    <td
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/checkMatch/${match.id}`)}
                    >
                      <FontAwesomeIcon icon={faCircleRight} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  );
};

export default UserTeam;
