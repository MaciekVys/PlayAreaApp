import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React from "react";
import "../styles/playerProfile.scss";

const PLAYER_PROFILE = gql`
  query profile {
    playerProfile {
      user {
        username
        firstName
        lastName
        city {
          name
        }
      }
      team {
        logo
        name
        league {
          name
        }
      }
      id
      position
      weight
      height
      number
    }
  }
`;

const PLAYER_STATISTICS_SUMMARY_QUERY = gql`
  query playerStatisticsSummary($playerId: ID!) {
    playerStatisticsSummary(playerId: $playerId) {
      totalMvps
      totalGoals
      totalAssists
    }
  }
`;

const PlayerProfile = () => {
  const {
    data: profileData,
    loading: loadingProfile,
    error: errorProfile,
  } = useQuery(PLAYER_PROFILE);
  const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;

  const playerId = profileData?.playerProfile?.id;

  const {
    data: summaryData,
    loading: loadingSummary,
    error: errorSummary,
  } = useQuery(PLAYER_STATISTICS_SUMMARY_QUERY, {
    skip: !playerId,
    variables: { playerId },
  });

  if (loadingProfile || loadingSummary) return <div>Loading...</div>;
  if (errorProfile || errorSummary)
    return <p>Błąd: {errorProfile.message || errorSummary.message}</p>;

  const player = profileData.playerProfile;
  const statistics = summaryData?.playerStatisticsSummary;

  return (
    <>
      <div className="container-player">
        {player ? (
          <>
            <div className="user">
              <h1>
                {player.user.firstName} {player.user.lastName}
                <br />"{player.user.username}"
              </h1>
              <img />
            </div>
            <div className="stats">
              <p>Drużyna: {player.team.name}</p>
              <p>Miasto: {player.user.city.name}</p>
              <p>Pozycja: {player.position}</p>
              <p>Numer: {player.number}</p>
              <p>Waga: {player.weight} kg</p>
              <p>Wzrost: {player.height} cm</p>
            </div>
            <div className="user">
              <h1>{player.team.name}</h1>
              {player.team.logo && (
                <img
                  src={`${MEDIA_URL}${player.team.logo}`}
                  alt={`${player.team.name} logo`}
                />
              )}
            </div>
          </>
        ) : (
          <div className="alert">Brak danych o profilu gracza</div>
        )}
      </div>
      <div>
        <table className="matches-table">
          <thead>
            <tr>
              <th>Drużyna</th>
              <th>Liga</th>
              <th>Gole</th>
              <th>Asysty</th>
              <th>MVP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{player.team.name}</td>
              <td>
                {player.team.league ? player.team.league.name : "Brak ligi"}
              </td>
              <td>{statistics?.totalGoals || 0}</td>
              <td>{statistics?.totalAssists || 0}</td>
              <td>{statistics?.totalMvps || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PlayerProfile;
