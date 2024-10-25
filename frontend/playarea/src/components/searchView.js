import React from "react";
import { useParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import "../styles/searchView.scss";

const SEARCH_USERS = gql`
  query SearchUsers($username: String!) {
    searchUsers(username: $username) {
      edges {
        node {
          id
          username
        }
      }
    }
  }
`;

const SEARCH_CITIES = gql`
  query SearchCities($name: String!) {
    searchCities(name: $name) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

const SEARCH_TEAMS = gql`
  query SearchTeams($name: String!) {
    searchTeams(name: $name) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

const SearchView = () => {
  const { keywords } = useParams();

  const { data: userData, loading: loadingUsers } = useQuery(SEARCH_USERS, {
    variables: { username: keywords },
    skip: !keywords,
  });

  const { data: cityData, loading: loadingCities } = useQuery(SEARCH_CITIES, {
    variables: { name: keywords },
    skip: !keywords,
  });

  const { data: teamData, loading: loadingTeams } = useQuery(SEARCH_TEAMS, {
    variables: { name: keywords },
    skip: !keywords,
  });

  if (loadingUsers || loadingCities || loadingTeams) {
    return <p>Ładowanie...</p>;
  }

  const userResults = userData?.searchUsers.edges.length || 0;
  const cityResults = cityData?.searchCities.edges.length || 0;
  const teamResults = teamData?.searchTeams.edges.length || 0;

  return (
    <div className="search-container">
      <h2>Wyniki wyszukiwania dla "{keywords}"</h2>

      <h3>Użytkownicy</h3>
      {userResults > 0 ? (
        userData?.searchUsers.edges.map(({ node }) => (
          <div key={node.id} className="result-item">
            {node.username}
          </div>
        ))
      ) : (
        <div className="no-results-container">
          <div style={{ textAlign: "center", fontSize: "20px" }}>
            Nie znaleziono użytkowników dla "{keywords}"
          </div>
        </div>
      )}

      <h3>Miasta</h3>
      {cityResults > 0 ? (
        cityData?.searchCities.edges.map(({ node }) => (
          <div key={node.id} className="result-item">
            {node.name}
          </div>
        ))
      ) : (
        <div className="no-results-container">
          <div style={{ textAlign: "center", fontSize: "20px" }}>
            Nie znaleziono miast dla "{keywords}"
          </div>
        </div>
      )}

      <h3>Drużyny</h3>
      {teamResults > 0 ? (
        teamData?.searchTeams.edges.map(({ node }) => (
          <div key={node.id} className="result-item">
            {node.name}
          </div>
        ))
      ) : (
        <div className="no-results-container">
          <div style={{ textAlign: "center", fontSize: "20px" }}>
            Nie znaleziono drużyn dla "{keywords}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchView;
