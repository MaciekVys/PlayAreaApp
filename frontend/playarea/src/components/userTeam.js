import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/myTeam.scss";

// Define the user query to check if the user has a team
const USER_TEAM_QUERY = gql`
  query User {
    me {
      team {
        name
        id
      }
    }
  }
`;

// Define the team query
const TEAM_BY_ID = gql`
  query TeamById($id: ID!) {
    teamById(id: $id) {
      name
      logo
      captain {
        username
        id
      }
      league {
        name
        level
        city {
          name
        }
      }
      playersCount
      players {
        position
        height
        weight
        id
        number
        photo
        username
      }
      matchesCount
      matches {
        homeTeam {
          name
          id
          logo
        }
        awayTeam {
          name
          id
          logo
        }
        id
        matchDate
        scoreHome
        scoreAway
        status
        winner
      }
    }
  }
`;

// Define the team statistics query
const TEAM_STATISTICS_SUMMARY_QUERY = gql`
  query teamStatisticsSummary($teamId: ID!) {
    teamStatisticsSummary(teamId: $teamId) {
      totalMvps
      totalGoals
      totalAssists
      user {
        username
      }
    }
  }
`;

// Define the join team mutation
const SEND_JOIN_REQUEST = gql`
  mutation sendJoinRequest($teamId: ID!) {
    sendJoinRequest(teamId: $teamId) {
      success
      message
    }
  }
`;

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
  } = useQuery(USER_TEAM_QUERY);

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
          {/* Show the join team button only if the user is not on a team */}
          {!userHasTeam && (
            <button
              className="join-team-button"
              onClick={handleJoinRequest}
              disabled={joining}
            >
              {joining ? "Wysyłanie..." : "Dołącz do drużyny"}
            </button>
          )}
        </div>
      </div>
      <div className="tabs">
        <button
          className={tabs === "squad" ? "active" : ""}
          onClick={() => setTabs("squad")}
        >
          Skład
        </button>
        <button
          className={tabs === "matches" ? "active" : ""}
          onClick={() => setTabs("matches")}
        >
          Mecze
        </button>
      </div>
      {tabs === "squad" && (
        <>
          <h1>Gracze:</h1>
          <table className="players-table">
            <thead>
              <tr>
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
                    <td
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/profile/${player.id}`)}
                    >
                      {player.username}
                    </td>
                    <td>{player.position || "Nieznana"}</td>
                    <td>{playerStats.totalGoals}</td>
                    <td>{playerStats.totalAssists}</td>
                    <td>{playerStats.totalMvps}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {tabs === "matches" && (
        <>
          <h1>Mecze:</h1>
          <table className="matches-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Gospodarze</th>
                <th>Wynik</th>
                <th>Goście</th>
                <th>Wygrana</th>
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
                          float: "right",
                        }}
                        src={`${MEDIA_URL}${match.awayTeam.logo}`}
                        alt={`${match.awayTeam.logo} logo`}
                      />
                    </div>
                  </td>
                  <td>{match.winner ? match.winner : "Brak"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default UserTeam;
