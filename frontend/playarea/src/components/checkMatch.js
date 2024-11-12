import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import gql from "graphql-tag";
import React from "react";
import "../styles/checkMatch.scss";
import { GET_MATCH_STATISTICS } from "../queries/queries";

const CheckMatch = () => {
  const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;

  const { id: matchId } = useParams();
  const { loading, error, data } = useQuery(GET_MATCH_STATISTICS, {
    variables: { matchId },
  });

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p>Błąd: {error.message}</p>;

  const match = data.match;

  return (
    <div className="check-match-container">
      <h2>Statystyki meczu</h2>
      <h3>Data meczu: {match.matchDate}</h3>

      <div className="teams-container">
        <div className="team-section">
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <h3 style={{ marginRight: "10px" }}>
              Gospodarze: {match.homeTeam.name}
            </h3>
            <img
              style={{
                width: "auto",
                height: "25px",
                marginBottom: "20px",
              }}
              src={`${MEDIA_URL}${match.homeTeam.logo}`}
              alt={`${match.homeTeam.logo} logo`}
            />
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Gracz</th>
                <th>Gole</th>
                <th>Asysty</th>
                <th>MVP</th>
              </tr>
            </thead>
            <tbody>
              {match.homeTeam.players.map((player) =>
                player.playerstatisticsSet.map((stat, index) => (
                  <tr key={`${player.username}-${index}`}>
                    {index === 0 ? (
                      <td rowSpan={player.playerstatisticsSet.length}>
                        {player.username}
                      </td>
                    ) : null}
                    <td>{stat.goals}</td>
                    <td>{stat.assists}</td>
                    <td>{stat.isMvp ? "Tak" : "Nie"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="score-container">
          <p className="score">
            {match.scoreHome} - {match.scoreAway}
          </p>
        </div>
        <div className="team-section">
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <h3 style={{ marginRight: "10px" }}>
              Goście: {match.awayTeam.name}
            </h3>
            <img
              style={{
                width: "auto",
                height: "25px",
                marginBottom: "20px",
              }}
              src={`${MEDIA_URL}${match.awayTeam.logo}`}
              alt={`${match.awayTeam.logo} logo`}
            />
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Gracz</th>
                <th>Gole</th>
                <th>Asysty</th>
                <th>MVP</th>
              </tr>
            </thead>
            <tbody>
              {match.awayTeam.players.map((player) =>
                player.playerstatisticsSet.map((stat, index) => (
                  <tr key={`${player.username}-${index}`}>
                    {index === 0 ? (
                      <td rowSpan={player.playerstatisticsSet.length}>
                        {player.username}
                      </td>
                    ) : null}
                    <td>{stat.goals}</td>
                    <td>{stat.assists}</td>
                    <td>{stat.isMvp ? "Tak" : "Nie"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CheckMatch;
