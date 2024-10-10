import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React from "react";
import "../styles/city.scss";

const CITY = gql`
  query MeQuery {
    userCity {
      name
      voivodeship
      league {
        name
        teamsCount
        level
      }
    }
    matches {
      homeTeam {
        name
      }
      awayTeam {
        name
      }
      city {
        name
        league {
          name
        }
      }
      scoreHome
      scoreAway
      status
      winner
      matchDate
    }
  }
`;

const City = () => {
  const { data } = useQuery(CITY);

  if (!data || !data.userCity) {
    return <p>No city data found</p>;
  }
  const city = data.userCity;
  const match = data.matches;

  return (
    <div>
      <div className="city-info">
        <h1>Miasto: {city.name}</h1>
        <p>Województwo: {city.voivodeship}</p>
        <p>Liga: {city.league.level}</p>
      </div>
      <div className="matches-section city-container">
        <section>
          <h2>Najbliższe mecze</h2>
          <table className="matches-table">
            <thead>
              <tr>
                <th>Liga</th>
                <th>Data</th>
                <th>Gospodarze</th>
                <th></th>
                <th>Goście</th>
              </tr>
            </thead>
            <tbody>
              {match
                .filter((match) => match.status === "SCHEDULED")
                .map((match, index) => (
                  <tr key={index}>
                    <td>{match.city.league.name}</td>
                    <td>{match.matchDate}</td>
                    <td>{match.homeTeam.name}</td>
                    <th>-</th>
                    <td>{match.awayTeam.name}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
        <section>
          <h2>Ostatnie mecze</h2>
          <table className="matches-table">
            <thead>
              <tr>
                <th>Liga</th>
                <th>Data</th>
                <th>Gospodarze</th>
                <th></th>
                <th></th>
                <th>Goście</th>
                <th>Wygrana</th>
              </tr>
            </thead>
            <tbody>
              {match
                .filter((match) => match.status === "COMPLETED")
                .map((match, index) => (
                  <tr key={index}>
                    <td>{match.city.league.name}</td>
                    <td>{match.matchDate}</td>
                    <td>{match.homeTeam.name}</td>
                    <td>{match.scoreHome}</td>
                    <th>:</th>
                    <td>{match.scoreAway}</td>
                    <td>{match.winner}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
        <section>
          <h2>Nieodbyte mecze</h2>
          <table className="matches-table">
            <thead>
              <tr>
                <th>Liga</th>
                <th>Data</th>
                <th>Gospodarze</th>
                <th></th>
                <th>Goście</th>
              </tr>
            </thead>
            <tbody>
              {match
                .filter((match) => match.status === "CANCELED")
                .map((match, index) => (
                  <tr key={index}>
                    <td>{match.city.league.name}</td>
                    <td>{match.matchDate}</td>
                    <td>{match.homeTeam.name}</td>
                    <th>-</th>
                    <td>{match.awayTeam.name}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default City;
