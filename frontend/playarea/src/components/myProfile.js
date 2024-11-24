import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React from "react";
import "../styles/playerProfile.scss";
import {
  USER_PROFILE,
  PLAYER_STATISTICS_SUMMARY_QUERY,
} from "../queries/queries";
import noImage from "../images/noImage.png";
import { useNavigate } from "react-router-dom";

const PlayerProfile = () => {
  const {
    data: profileData,
    loading: loadingProfile,
    error: errorProfile,
  } = useQuery(USER_PROFILE);
  const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;
  const userId = profileData?.userProfile?.id;
  const navigate = useNavigate();

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
                <img
                  style={{ maxWidth: "200px", maxHeight: "200px" }}
                  src={`${MEDIA_URL}${user.photo}`}
                  alt="Player"
                />
              ) : (
                <img src={noImage} />
              )}
            </div>

            <div className="stats">
              <p>Drużyna: {user.team?.name || "Brak drużyny"}</p>
              <p>Miasto: {user.city?.name || "Brak miasta"}</p>
              <p>Pozycja: {user.position || "Brak pozycji"}</p>
              <p>Numer: {user.number || "Brak numeru"}</p>
              <p>Waga: {user.weight ? `${user.weight} kg` : "Brak danych"}</p>
              <p>Wzrost: {user.height ? `${user.height} cm` : "Brak danych"}</p>
            </div>
            <div className="user">
              <h1>{user.team?.name || "Brak drużyny"}</h1>
              {user.team?.logo ? (
                <img
                  style={{ weight: "40px", height: "auto", cursor: "pointer" }}
                  src={`${MEDIA_URL}${user.team.logo}`}
                  alt={`${user.team.name} logo`}
                  onClick={() => navigate(`/team/${user?.team?.id}`)}
                />
              ) : (
                <img
                  style={{ height: "auto", cursor: "pointer" }}
                  src={noImage}
                  alt="No logo"
                  onClick={() => navigate(`/team/${user?.team?.id}`)}
                />
              )}
            </div>
          </>
        ) : (
          <div className="alert">Brak danych o profilu użytkownika</div>
        )}
      </div>
      <div className="second-container">
        <h1>Statystyki</h1>
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Logo</th>
              <th>Drużyna</th>
              <th>Liga</th>
              <th>Gole</th>
              <th>Asysty</th>
              <th>MVP ⭐</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Obecnie</td>
              <td>
                {user.team?.logo ? (
                  <img
                    src={`${MEDIA_URL}${user.team.logo}`}
                    style={{ width: "40px", height: "auto" }}
                  />
                ) : (
                  <img
                    src={noImage}
                    alt="No logo"
                    style={{ width: "40px", height: "auto" }}
                  />
                )}
              </td>
              <td>{user.team?.name || "Brak drużyny"}</td>
              <td>{user.team?.league?.name || "Brak ligi"}</td>
              <td>{user?.goals || 0}</td>
              <td>{user?.assists || 0}</td>
              <td>{user?.mvp || 0}</td>
            </tr>
          </tbody>
        </table>
        <br />
        <h1>Statystyki poprzednich drużyn</h1>
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Drużyna</th>
              <th>Logo</th>
              <th>Liga</th>
              <th>Gole</th>
              <th>Asysty</th>
              <th>MVP ⭐</th>
            </tr>
          </thead>
          <tbody>
            {user.teamStats?.length > 0 ? (
              user.teamStats.map((teamStat, index) => (
                <tr key={index}>
                  <td>{teamStat.dateLeft || "Obecnie"}</td>
                  <td
                    style={{ height: "auto", cursor: "pointer" }}
                    onClick={() => navigate(`/team/${teamStat?.team?.id}`)}
                  >
                    {teamStat.team?.name || "Brak drużyny"}
                  </td>
                  <td>
                    {teamStat?.team?.logo ? (
                      <img
                        src={`${MEDIA_URL}${teamStat?.team?.logo}`}
                        style={{ width: "40px", height: "auto" }}
                      />
                    ) : (
                      <img
                        src={noImage}
                        alt="No logo"
                        style={{ width: "40px", height: "auto" }}
                      />
                    )}
                  </td>
                  <td>{teamStat?.team?.league?.name || "Brak ligi"}</td>
                  <td>{teamStat.goals || 0}</td>
                  <td>{teamStat.assists || 0}</td>
                  <td>{teamStat.mvp || 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">Brak poprzednich statystyk</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ height: "50px" }}></div>
    </div>
  );
};

export default PlayerProfile;
