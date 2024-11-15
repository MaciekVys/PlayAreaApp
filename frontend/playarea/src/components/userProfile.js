import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";
import React from "react";
import { useParams } from "react-router-dom";
import "../styles/playerProfile.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import {
  PLAYER_BY_ID,
  PLAYER_STATISTICS_SUMMARY_QUERY,
  ME_QUERY,
} from "../queries/queries";
import noImage from "../images/noImage.png";

// Definiowanie mutacji invitePlayer
const INVITE_PLAYER = gql`
  mutation invitePlayer($teamId: ID!, $playerId: ID!) {
    invitePlayer(teamId: $teamId, playerId: $playerId) {
      success
      message
    }
  }
`;

const UserProfile = () => {
  const userId = localStorage.getItem("userId");
  const { id } = useParams();
  const { data, loading, error } = useQuery(PLAYER_BY_ID, {
    variables: { userId: id },
  });
  const { data: Me } = useQuery(ME_QUERY);

  const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;
  const isCaptain = Me?.me?.captainOfTeam !== null;

  const {
    data: summaryData,
    loading: loadingSummary,
    error: errorSummary,
  } = useQuery(PLAYER_STATISTICS_SUMMARY_QUERY, {
    variables: { userId: id },
  });

  // Inicjalizacja mutacji invitePlayer
  const [invitePlayer] = useMutation(INVITE_PLAYER, {
    onCompleted: (data) => {
      if (data.invitePlayer.success) {
        alert("Zaproszenie wysłane!");
      } else {
        alert(`Błąd: ${data.invitePlayer.message}`);
      }
    },
    onError: (error) => {
      console.error("Błąd przy wysyłaniu zaproszenia:", error.message);
      alert("Wystąpił błąd podczas wysyłania zaproszenia.");
    },
  });

  if (loading || loadingSummary) return <p>Ładowanie danych...</p>;
  if (error || errorSummary)
    return <p>Błąd: {error?.message || errorSummary?.message}</p>;

  const statistics = summaryData?.playerStatisticsSummary;
  const player = data?.playerById;

  // Funkcja obsługująca kliknięcie przycisku zapraszania do drużyny
  const handleInvitePlayer = () => {
    if (player && player.team && player.id) {
      invitePlayer({
        variables: {
          teamId: me.team.id,
          playerId: player.id,
        },
      });
    }
  };
  const me = Me?.me;

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
                  style={{ maxWidth: "200px", maxHeight: "200px" }}
                />
              ) : (
                <img src={noImage} />
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
              {player.team?.logo ? (
                <img
                  src={`${MEDIA_URL}${player.team.logo}`}
                  alt={`${player.team.name} logo`}
                  className="team-logo"
                />
              ) : (
                <img src={noImage} />
              )}
              <br />
              {userId !== player.id &&
                player.team.id !== me?.team?.id &&
                isCaptain && (
                  <button onClick={handleInvitePlayer}>
                    Zaproś do drużyny{" "}
                    <FontAwesomeIcon icon={faRightFromBracket} />
                  </button>
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
        <div style={{ height: "50px" }}></div>
      </div>
    </>
  );
};

export default UserProfile;
