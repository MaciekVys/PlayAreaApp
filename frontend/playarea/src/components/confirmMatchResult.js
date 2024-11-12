import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/confirmMatch.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { GET_MATCH_PLAYERS } from "../queries/queries";
import { CONFIRM_MATCH_RESULT } from "../queries/mutations";

const ConfirmMatchResult = () => {
  const { id: matchId } = useParams();
  const { data, loading, error, refetch } = useQuery(GET_MATCH_PLAYERS, {
    variables: { matchId },
  });
  const currentUserId = localStorage.getItem("userId");

  const [confirmMatchResult] = useMutation(CONFIRM_MATCH_RESULT);
  const [homeTeamStats, setHomeTeamStats] = useState([]);
  const [awayTeamStats, setAwayTeamStats] = useState([]);
  const [homeTeamScore, setHomeTeamScore] = useState(0);
  const [awayTeamScore, setAwayTeamScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  if (loading) return <p>Ładowanie danych...</p>;
  if (error) return <p>Błąd: {error.message}</p>;

  const match = data?.match;

  const isAwayTeamCaptain = match.awayTeam.captain.id === currentUserId;
  const isHomeTeamCaptain = match.homeTeam.captain.id === currentUserId;

  const alreadyConfirmed = isHomeTeamCaptain
    ? match.matchresultSet[0]?.homeTeamConfirmed
    : match.matchresultSet[0]?.awayTeamConfirmed;

  const isFormDisabled = alreadyConfirmed;

  const handleInputChange = (team, playerId, field, value) => {
    const updateStats = (stats) => {
      const existingStat = stats.find((stat) => stat.playerId === playerId);
      if (existingStat) {
        existingStat[field] = value;
      } else {
        stats.push({ playerId, [field]: value });
      }
      return [...stats];
    };

    if (team === "home") {
      setHomeTeamStats((prev) => updateStats(prev));
    } else {
      setAwayTeamStats((prev) => updateStats(prev));
    }
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    const isHomeTeam = isHomeTeamCaptain;

    const statistics = (isHomeTeam ? homeTeamStats : awayTeamStats).map(
      (stat) => ({
        playerId: parseInt(stat.playerId),
        goals: parseInt(stat.goals || 0),
        assists: parseInt(stat.assists || 0),
        isMvp: Boolean(stat.isMvp || false),
        teamScore: isHomeTeam ? homeTeamScore : awayTeamScore,
      })
    );

    try {
      const response = await confirmMatchResult({
        variables: {
          matchId,
          isHomeTeam,
          statistics,
        },
      });
      if (response.data.confirmMatchResult.success) {
        alert("Wynik meczu został potwierdzony.");
        await refetch();
      } else {
        setErrorMessage("Nie udało się potwierdzić wyniku meczu.");
      }
    } catch (err) {
      console.error("Błąd:", err);
      if (err.networkError && err.networkError.result) {
        console.error("Network error details:", err.networkError.result.errors);
        setErrorMessage("Błąd sieci. Spróbuj ponownie.");
      } else if (err.graphQLErrors) {
        console.error("GraphQL errors:", err.graphQLErrors);
        setErrorMessage(
          err.graphQLErrors[0]?.message || "Wystąpił błąd. Spróbuj ponownie."
        );
      } else {
        console.error("Unexpected error:", err);
        setErrorMessage("Nieoczekiwany błąd. Spróbuj ponownie.");
      }
    }
  };

  return (
    <div className="container">
      <h1 className="title">Potwierdzenie wyniku meczu</h1>
      <div className="teams">
        <div className="team home-team">
          <h2>{match.homeTeam.name} (Gospodarze)</h2>
          <input
            type="number"
            className="input-field"
            min="0"
            placeholder="Wynik gospodarzy"
            value={homeTeamScore}
            onChange={(e) => setHomeTeamScore(e.target.value)}
            disabled={!isHomeTeamCaptain || isFormDisabled}
          />
          <table className="table">
            <thead>
              <tr>
                <th>Imię Użytkownika</th>
                <th>Gole</th>
                <th>Asysty</th>
                <th>MVP</th>
              </tr>
            </thead>
            <tbody>
              {match.homeTeam.players.map((player) => (
                <tr key={player.id}>
                  <td>{player.username}</td>
                  <td>
                    <input
                      type="number"
                      className="input-field"
                      min="0"
                      disabled={!isHomeTeamCaptain || isFormDisabled}
                      onChange={(e) =>
                        handleInputChange(
                          "home",
                          player.id,
                          "goals",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="input-field"
                      min="0"
                      disabled={!isHomeTeamCaptain || isFormDisabled}
                      onChange={(e) =>
                        handleInputChange(
                          "home",
                          player.id,
                          "assists",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      disabled={!isHomeTeamCaptain || isFormDisabled}
                      type="radio"
                      name="homeMvp"
                      onChange={() =>
                        handleInputChange("home", player.id, "isMvp", true)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="team away-team">
          <h2>{match.awayTeam.name} (Goście)</h2>
          <input
            type="number"
            className="input-field"
            min="0"
            placeholder="Wynik gości"
            value={awayTeamScore}
            onChange={(e) => setAwayTeamScore(e.target.value)}
            disabled={!isAwayTeamCaptain || isFormDisabled}
          />
          <table className="table">
            <thead>
              <tr>
                <th>Imię Użytkownika</th>
                <th>Gole</th>
                <th>Asysty</th>
                <th>MVP</th>
              </tr>
            </thead>
            <tbody>
              {match.awayTeam.players.map((player) => (
                <tr key={player.id}>
                  <td>{player.username}</td>
                  <td>
                    <input
                      type="number"
                      className="input-field"
                      min="0"
                      disabled={!isAwayTeamCaptain || isFormDisabled}
                      onChange={(e) =>
                        handleInputChange(
                          "away",
                          player.id,
                          "goals",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="input-field"
                      min="0"
                      disabled={!isAwayTeamCaptain || isFormDisabled}
                      onChange={(e) =>
                        handleInputChange(
                          "away",
                          player.id,
                          "assists",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      name="awayMvp"
                      disabled={!isAwayTeamCaptain || isFormDisabled}
                      onChange={() =>
                        handleInputChange("away", player.id, "isMvp", true)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <button
        className="submit-button"
        onClick={handleSubmit}
        disabled={isFormDisabled}
      >
        Zatwierdź wynik <FontAwesomeIcon icon={faCheck} />
      </button>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default ConfirmMatchResult;
