import { useMutation, useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useState } from "react";
import "../styles/createTeam.scss";
import { useNavigate } from "react-router-dom";

const ALL_CITIES = gql`
  query MyQuery {
    allCities {
      name
    }
  }
`;

const CREATE_TEAM = gql`
  mutation createTeam($cityName: String!, $name: String!) {
    createTeam(cityName: $cityName, name: $name) {
      success
      errors
      team {
        name
      }
    }
  }
`;

const CreateTeam = () => {
  const [errorMessage, setErrorMessage] = useState();
  const navigate = useNavigate();
  const [createTeam, refetch] = useMutation(CREATE_TEAM, {
    onCompleted: (data) => {
      if (data.createTeam.success) {
        navigate("/team");
      } else if (data.createTeam.errors) {
        setErrorMessage(data.createTeam.errors);
      }
      refetch();
    },
    onError: (data) => {
      setErrorMessage("An error occurred while creating the team.");
    },
  });
  const { data } = useQuery(ALL_CITIES);
  const [cityName, setCityName] = useState("");
  const [teamName, setTeamName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createTeam({
      variables: {
        cityName: cityName,
        name: teamName,
      },
    });
  };

  if (!data || !data.allCities) return <p>Brak dostępnych miast.</p>;

  return (
    <div className="create-team-container">
      <div className="form-wrapper">
        <h1>Zarejestruj Drużynę</h1>
        <form onSubmit={handleSubmit}>
          <h3>Wybierz miasto</h3>
          <label htmlFor="city">Miasto:</label>
          <select
            id="city"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            required
            className="select-field"
          >
            <option value=""> -- Wybierz Miasto --</option>
            {data.allCities.map((city, index) => (
              <option key={index} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>

          <h3>Wprowadź nazwę drużyny:</h3>
          <input
            className="input-field-create-team"
            placeholder="Wprowadź nazwę drużyny"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />

          <button type="submit">Zarejestruj Drużynę</button>
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;
