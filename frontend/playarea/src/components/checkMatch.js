import { useQuery } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import React from "react";
import "../styles/checkMatch.scss";
import { GET_MATCH_DETAILS } from "../queries/queries";
import noImage from "../images/noImage.png";

const CheckMatch = () => {
  const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;
  const navigate = useNavigate();

  const { id: matchId } = useParams();
  const { loading, error, data } = useQuery(GET_MATCH_DETAILS, {
    variables: { matchId },
  });

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p>Błąd: {error.message}</p>;

  const { match } = data;

  return (
    <div className="check-match-container">
      <h2>Statystyki meczu</h2>
      <h3>Data meczu: {match.matchDate}</h3>

      <div className="teams-container">
        {/* Sekcja gospodarzy */}
        <div className="team-section">
          <div style={{ display: "flex", alignItems: "center" }}>
            <h3
              onClick={() => navigate(`/team/${match.homeTeam.id}`)}
              style={{ cursor: "pointer", marginRight: "10px" }}
            >
              Gospodarze: {match.homeTeam.name}
            </h3>
            <img
              style={{ width: "auto", height: "25px", marginBottom: "20px" }}
              src={
                match.homeTeam.logo
                  ? `${MEDIA_URL}${match.homeTeam.logo}`
                  : noImage
              }
              alt={`${match.homeTeam.name} logo`}
            />
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Zdjęcie</th>
                <th>Gracz</th>
                <th>Gole</th>
                <th>Asysty</th>
                <th>MVP</th>
              </tr>
            </thead>
            <tbody>
              {match.homeTeamStatistics.map((stat) => (
                <tr key={stat.player.id}>
                  <td
                    onClick={() => navigate(`/profile/${stat.player.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={
                        stat.player.photo
                          ? `${MEDIA_URL}${stat.player.photo}`
                          : noImage
                      }
                      alt={stat.player.username}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                      }}
                    />
                  </td>
                  <td
                    onClick={() => navigate(`/profile/${stat.player.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {stat.player.username}
                  </td>
                  <td>{stat.goals}</td>
                  <td>{stat.assists}</td>
                  <td>{stat.isMvp ? "⭐" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Wynik meczu */}
        <div className="score-container">
          <p className="score">
            {match.scoreHome} - {match.scoreAway}
          </p>
        </div>

        {/* Sekcja gości */}
        <div className="team-section">
          <div style={{ display: "flex", alignItems: "center" }}>
            <h3
              onClick={() => navigate(`/team/${match.awayTeam.id}`)}
              style={{ cursor: "pointer", marginRight: "10px" }}
            >
              Goście: {match.awayTeam.name}
            </h3>
            <img
              style={{ width: "auto", height: "25px", marginBottom: "20px" }}
              src={
                match.awayTeam.logo
                  ? `${MEDIA_URL}${match.awayTeam.logo}`
                  : noImage
              }
              alt={`${match.awayTeam.name} logo`}
            />
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Zdjęcie</th>
                <th>Gracz</th>
                <th>Gole</th>
                <th>Asysty</th>
                <th>MVP</th>
              </tr>
            </thead>
            <tbody>
              {match.awayTeamStatistics.map((stat) => (
                <tr key={stat.player.id}>
                  <td
                    onClick={() => navigate(`/profile/${stat.player.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={
                        stat.player.photo
                          ? `${MEDIA_URL}${stat.player.photo}`
                          : noImage
                      }
                      alt={stat.player.username}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                      }}
                    />
                  </td>
                  <td
                    onClick={() => navigate(`/profile/${stat.player.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {stat.player.username}
                  </td>
                  <td>{stat.goals}</td>
                  <td>{stat.assists}</td>
                  <td>{stat.isMvp ? "⭐" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CheckMatch;
