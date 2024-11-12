import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React from "react";
import "../styles/playerProfile.scss";
import {
  USER_PROFILE,
  PLAYER_STATISTICS_SUMMARY_QUERY,
} from "../queries/queries";

const PlayerProfile = () => {
  const {
    data: profileData,
    loading: loadingProfile,
    error: errorProfile,
  } = useQuery(USER_PROFILE);
  const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;

  const userId = profileData?.userProfile?.id;
  console.log("User ID:", userId);

  const {
    data: summaryData,
    loading: loadingSummary,
    error: errorSummary,
  } = useQuery(PLAYER_STATISTICS_SUMMARY_QUERY, {
    skip: !userId,
    variables: { userId: userId },
  });

  if (loadingProfile || loadingSummary) return <div>Loading...</div>;
  if (errorProfile || errorSummary)
    return <p>Error: {errorProfile?.message || errorSummary?.message}</p>;

  const user = profileData?.userProfile;
  const statistics = summaryData?.playerStatisticsSummary;

  return (
    <div>
      <div className="container-player">
        {user ? (
          <>
            <div className="user">
              <h1>
                {user.firstName} {user.lastName}
                <br />"{user.username}"
              </h1>
              {user.photo ? (
                <img src={`${MEDIA_URL}${user.photo}`} alt="Player" />
              ) : (
                <div className="placeholder-photo">Brak zdjęcia</div>
              )}
            </div>

            <div className="stats">
              <p>Drużyna: {user.team?.name || "Brak drużyny"}</p>
              <p>Miasto: {user.city?.name || "Brak miasta"}</p>
              <p>
                Pozycja:{" "}
                {user.playerstatisticsSet[0]?.position || "Brak pozycji"}
              </p>
              <p>Numer: {user.number || "Brak numeru"}</p>
              <p>Waga: {user.weight ? `${user.weight} kg` : "Brak danych"}</p>
              <p>Wzrost: {user.height ? `${user.height} cm` : "Brak danych"}</p>
            </div>
            <div className="user">
              <h1>{user.team?.name || "Brak drużyny"}</h1>
              {user.team?.logo && (
                <img
                  src={`${MEDIA_URL}${user.team.logo}`}
                  alt={`${user.team.name} logo`}
                />
              )}
            </div>
          </>
        ) : (
          <div className="alert">Brak danych o profilu użytkownika</div>
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
              <td>{user.team?.name || "Brak drużyny"}</td>
              <td>{user.team?.league?.name || "Brak ligi"}</td>
              <td>{statistics?.totalGoals || 0}</td>
              <td>{statistics?.totalAssists || 0}</td>
              <td>{statistics?.totalMvps || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayerProfile;
