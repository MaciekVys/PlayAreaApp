import { useMutation, useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useState, useEffect } from "react";
import "../styles/getChallenge.scss";
import { faHandPointRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

const CITY_QUERY = gql`
  query GetCityData($name: String!) {
    cityName(name: $name) {
      image
      id
      name
      voivodeship
      league {
        name
        level
      }
    }
  }
`;

const ME_QUERY = gql`
  query MeQuery {
    me {
      city {
        name
      }
    }
  }
`;

const ChallengeTeam = () => {
  const [cityName, setCityName] = useState(null);

  const [challengeTeamToMatch] = useMutation(CHALLENGE_TEAM_MUTATION);
  const [formData, setFormData] = useState({
    awayTeam: "",
    matchDate: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const { data, loading, error } = useQuery(GET_TEAMS_IN_USER_LEAGUE);
  const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;

  const { data: meData } = useQuery(ME_QUERY);

  // useEffect to set the city name based on the user's data
  useEffect(() => {
    console.log("MeData:", meData); // Log to check if user data is available
    if (meData && meData.me) {
      if (meData.me.city) {
        console.log("City name set to:", meData.me.city.name);
        setCityName(meData.me.city.name);
      } else {
        setMessage({
          text: "Please set your city in your settings to view rankings.",
          type: "error",
        });
      }
    }
  }, [meData]);

  // Run CITY_QUERY only if cityName is available
  const {
    data: dataCity,
    loading: loadingCity,
    error: errorCity,
  } = useQuery(CITY_QUERY, {
    variables: { name: cityName },
    skip: !cityName, // Skip the query if cityName is null
  });

  useEffect(() => {
    console.log("DataCity:", dataCity); // Log city data
  }, [dataCity]);

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
        setMessage({
          text: `Success: ${data.challengeTeamToMatch.message}`,
          type: "success",
        });
      } else {
        setMessage({
          text: `Error: ${data.challengeTeamToMatch.message}`,
          type: "error",
        });
      }
    } catch (error) {
      setMessage({
        text: `An error occurred: ${error.message}`,
        type: "error",
      });
    }
  };

  const city = dataCity?.cityName;
  const league = city?.league;

  if (loading || loadingCity) return <p>Ładowanie drużyn...</p>;
  if (error || errorCity)
    return <p className="error-message">{error.message}</p>;

  return (
    <div className="challenge-team-container">
      <div className="info">
        {city?.image ? (
          <img src={`${MEDIA_URL}${city.image}`} alt={`${city.name} logo`} />
        ) : (
          <div className="placeholder-logo">Brak zdjęcia miasta</div>
        )}
        <h1>Miasto: {city?.name || "Nieznane"}</h1>
        <p>Województwo: {city?.voivodeship || "Nieznane"}</p>
        {league ? (
          <p>
            Liga: {league.name}, Poziom: {league.level}
          </p>
        ) : (
          <p>Brak przypisania do ligi</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="challenge-form">
        <h2 className="form-title">Rzuć wyzwanie</h2>
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
            {data?.teamsInUserLeague?.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
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
          Challenge Team <FontAwesomeIcon icon={faHandPointRight} />
        </button>
      </form>
      {message.text && (
        <p
          className={`message ${
            message.type === "success" ? "success-message" : "error-message"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
};

export default ChallengeTeam;
