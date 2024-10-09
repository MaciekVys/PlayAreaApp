import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useState } from "react";
import "../styles/team.scss";

const MY_TEAM_QUERY = gql`
  query team($userId: Int!) {
    teamByUserId(userId: $userId) {
      name
      id
      captain {
        username
      }
      playersCount
      matchesCount
      city {
        name
      }
      league {
        name
      }
      players {
        user {
          username
        }
        position
        goals
        assists
        mvp
      }
      matches {
        matchDate
        homeTeam {
          name
        }
        awayTeam {
          name
        }
        scoreHome
        scoreAway
        status
        winner
      }
    }
  }
`;

const Team = () => {
  const userid = localStorage.getItem("userId");
  const [tabs, setTable] = useState("squad");

  const { data, loading, error } = useQuery(MY_TEAM_QUERY, {
    variables: { userId: parseInt(userid) },
  });

  if (loading) return <p>Ładowanie danych...</p>;
  if (error) return <p>Błąd: {error.message}</p>;

  const team = data?.teamByUserId;
  if (!team) return <p>Nie należysz do żadnej drużyny.</p>;

  return (
    <div className="container">
      <div className="team-info">
        <img src="hej" />
        <div className="left-side">
          <h1>{team.name}</h1>
          <p>Liczba graczy: {team.playersCount}</p>
          <p>Liczba meczów: {team.matchesCount}</p>
          <p>Miasto: {team.city.name}</p>
          <p>Liga: {team.league.name}</p>
          <p>Kapitan: {team.captain.username}</p>
        </div>
      </div>
      <div className="tabs">
        <button
          className={tabs === "squad" ? "active" : ""}
          onClick={() => setTable("squad")}
        >
          Skład
        </button>
        <button
          className={tabs === "matches" ? "active" : ""}
          onClick={() => setTable("matches")}
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
              {team.players.map((player, index) => (
                <tr key={index}>
                  <td>{player.user.username}</td>
                  <td>{player.position}</td>
                  <td>{player.goals}</td>
                  <td>{player.assists}</td>
                  <td>{player.mvp}</td>
                </tr>
              ))}
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
                <th>Goście</th>
                <th>Wynik</th>
                <th>Wygrana</th>
              </tr>
            </thead>
            <tbody>
              {team.matches.map((match, index) => (
                <tr key={index}>
                  <td>{match.matchDate}</td>
                  <td>{match.homeTeam.name}</td>
                  <td>{match.awayTeam.name}</td>
                  <td>
                    {match.scoreHome} : {match.scoreAway}
                  </td>
                  <td>{match.winner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Team;
