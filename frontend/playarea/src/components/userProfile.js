import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React from "react";
import { useParams } from "react-router-dom";

const PLAYER_BY_ID = gql`
  query PlayerProfile($userId: ID!) {
    playerById(userId: $userId) {
      user {
        username
        firstName
        lastName
        city {
          name
        }
      }
      id
      team {
        logo
        name
        league {
          name
        }
      }
      position
      weight
      height
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

const UserProfile = () => {
  const { id } = useParams();
  const { data, loading, error } = useQuery(PLAYER_BY_ID, {
    variables: { userId: id },
  });

  const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;
  const playerId = data?.playerById?.id;
  console.log(playerId);

  const {
    data: summaryData,
    loading: loadingSummary,
    error: errorSummary,
  } = useQuery(PLAYER_STATISTICS_SUMMARY_QUERY, {
    variables: { playerId },
  });

  if (loading || loadingSummary) return <p>Ładowanie danych...</p>;
  if (error || errorSummary) return <p>Błąd: {error.message}</p>;

  const statistics = summaryData?.playerStatisticsSummary;
  const player = data?.playerById;

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
              <p>
                Miasto:{" "}
                {player.user.city ? player.user.city.name : "Nie podano"}
              </p>
              <p>Pozycja: {player.position}</p>
              <p>Numer: {player.number || "Brak numeru"}</p>
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
export default UserProfile;
