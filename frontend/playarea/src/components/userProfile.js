import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React from "react";
import { useParams } from "react-router-dom";
import "../styles/playerProfile.scss";

const PLAYER_BY_ID = gql`
  query PlayerProfile($userId: ID!) {
    playerById(userId: $userId) {
      username
      firstName
      lastName
      id
      email
      weight
      height
      number
      photo
      city {
        name
      }
      team {
        name
        captain {
          username
        }
        league {
          name
        }
        logo
      }
      playerstatisticsSet {
        goals
        assists
        isMvp
      }
    }
  }
`;

const PLAYER_STATISTICS_SUMMARY_QUERY = gql`
  query playerStatisticsSummary($userId: ID!) {
    playerStatisticsSummary(userId: $userId) {
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

  const {
    data: summaryData,
    loading: loadingSummary,
    error: errorSummary,
  } = useQuery(PLAYER_STATISTICS_SUMMARY_QUERY, {
    variables: { userId: id },
  });

  if (loading || loadingSummary) return <p>Ładowanie danych...</p>;
  if (error || errorSummary)
    return <p>Błąd: {error?.message || errorSummary?.message}</p>;

  const statistics = summaryData?.playerStatisticsSummary;
  const player = data?.playerById;

  return (
    <>
      <div className="container-player">
        {player ? (
          <>
            <div className="user">
              <h1>
                {player.firstName} {player.lastName}
                <br />"{player.username}"
              </h1>
              {player.photo ? (
                <img
                  src={`${MEDIA_URL}${player.photo}`}
                  alt={`${player.username} photo`}
                  className="player-photo"
                />
              ) : (
                <div className="placeholder-photo">Brak zdjęcia</div>
              )}
            </div>
            <div className="stats">
              <p>Drużyna: {player.team?.name || "Brak drużyny"}</p>
              <p>Miasto: {player.city?.name || "Nie podano"}</p>
              <p>
                Pozycja:{" "}
                {player.playerstatisticsSet[0]?.position || "Brak pozycji"}
              </p>
              <p>Numer: {player.number || "Brak numeru"}</p>
              <p>
                Waga: {player.weight ? `${player.weight} kg` : "Brak danych"}
              </p>
              <p>
                Wzrost: {player.height ? `${player.height} cm` : "Brak danych"}
              </p>
            </div>
            <div className="user">
              <h1>{player.team?.name || "Brak Drużyny"}</h1>
              {player.team?.logo && (
                <img
                  src={`${MEDIA_URL}${player.team.logo}`}
                  alt={`${player.team.name} logo`}
                  className="team-logo"
                />
              )}
            </div>
          </>
        ) : (
          <div className="alert">Brak danych o profilu gracza</div>
        )}
      </div>
      <div className="second-container">
        <table className="table">
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
              <td>{player.team?.name || "Brak drużyny"}</td>
              <td>{player.team?.league?.name || "Brak ligi"}</td>
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
