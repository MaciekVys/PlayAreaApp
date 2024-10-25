import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import gql from "graphql-tag";
import React from "react";
import "../styles/checkMatch.scss";

const GET_MATCH_STATISTICS = gql`
  query GetMatchStatistics($matchId: ID!) {
    match(id: $matchId) {
      homeTeam {
        name
        logo
        players {
          user {
            username
          }
          playerstatisticsSet {
            goals
            assists
            isMvp
          }
        }
      }
      awayTeam {
        name
        logo
        players {
          user {
            username
          }
          playerstatisticsSet {
            goals
            assists
            isMvp
          }
        }
      }
      scoreHome
      scoreAway
      matchDate
    }
  }
`;

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
      <h3>
        Wynik: {match.scoreHome} - {match.scoreAway}
      </h3>

      <div className="teams-container">
        <div className="team-section">
          <h3>Gospodarze: {match.homeTeam.name}</h3>
          <img
            style={{
              width: "40px",
              height: "auto",
            }}
            src={`${MEDIA_URL}${match.homeTeam.logo}`}
            alt={`${match.homeTeam.logo} logo`}
          />
          <table>
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
                  <tr key={`${player.user.username}-${index}`}>
                    {index === 0 ? (
                      <td rowSpan={player.playerstatisticsSet.length}>
                        {player.user.username}
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

        <div className="team-section">
          <h3>Goście: {match.awayTeam.name}</h3>
          <img
            style={{
              width: "40px",
              height: "auto",
            }}
            src={`${MEDIA_URL}${match.awayTeam.logo}`}
            alt={`${match.awayTeam.logo} logo`}
          />
          <table>
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
                  <tr key={`${player.user.username}-${index}`}>
                    {index === 0 ? (
                      <td rowSpan={player.playerstatisticsSet.length}>
                        {player.user.username}
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
