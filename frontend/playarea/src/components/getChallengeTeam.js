import { useMutation, useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useState } from "react";
import "../styles/getChallenge.scss";

const CHALLENGE_TEAM_MUTATION = gql`
  mutation ChallengeTeamToMatch($awayTeam: ID!, $matchDate: Date!) {
    challengeTeamToMatch(awayTeamId: $awayTeam, matchDate: $matchDate) {
      success
      message
    }
  }
`;

const GET_TEAMS_IN_USER_LEAGUE = gql`
  query GetTeamsInUserLeague {
    teamsInUserLeague {
      id
      name
      logo
    }
  }
`;

const ChallengeTeam = () => {
  const [challengeTeamToMatch] = useMutation(CHALLENGE_TEAM_MUTATION);
  const [formData, setFormData] = useState({
    awayTeam: "",
    matchDate: "",
  });
  const [message, setMessage] = useState("");
  const { data, loading, error } = useQuery(GET_TEAMS_IN_USER_LEAGUE);
  const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await challengeTeamToMatch({
        variables: {
          awayTeam: formData.awayTeam,
          matchDate: formData.matchDate,
        },
      });

      if (data.challengeTeamToMatch.success) {
        setMessage(`Success: ${data.challengeTeamToMatch.message}`);
      } else {
        setMessage(`Error: ${data.challengeTeamToMatch.message}`);
      }
    } catch (error) {
      setMessage(`An error occurred: ${error.message}`);
    }
  };

  if (loading) return <p>Ładowanie drużyn...</p>;
  if (error) return <p>Błąd: {error.message}</p>;

  return (
    <div className="challenge-team-container">
      <form onSubmit={handleSubmit} className="challenge-form">
        <h2 className="form-title">Challenge Team to Match</h2>
        <div className="form-group">
          <label htmlFor="awayTeam">Drużyna przeciwnika (Away Team):</label>
          <select
            id="awayTeam"
            name="awayTeam"
            value={formData.awayTeam}
            onChange={handleChange}
            required
            className="form-input"
          >
            <option value="" disabled>
              Wybierz drużynę
            </option>
            {data.teamsInUserLeague.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
                {team.logo && (
                  <img
                    src={`${MEDIA_URL}${team.logo}`}
                    alt={`${team.logo} logo`}
                  />
                )}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="matchDate">Data meczu (YYYY-MM-DD):</label>
          <input
            type="date"
            id="matchDate"
            name="matchDate"
            value={formData.matchDate}
            onChange={handleChange}
            required
            className="form-input"
            min={today}
          />
        </div>
        <button type="submit" className="challenge-button">
          Challenge Team
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default ChallengeTeam;
