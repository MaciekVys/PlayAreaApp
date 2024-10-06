import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React from "react";

const MY_TEAM_QUERY = gql`
  query team($userId: Int!) {
    teamByUserId(userId: $userId) {
      name
      id
      captain {
        username
      }
      playersCount
      matchesCount
      city {
        name
      }
      league {
        name
      }
      players {
        user {
          username
        }
        position
        goals
        assists
        mvp
      }
      matches {
        matchDate
        homeTeam {
          name
        }
        awayTeam {
          name
        }
        scoreHome
        scoreAway
        status
        winner
      }
    }
  }
`;

const Team = () => {
  const userid = localStorage.getItem("userId");

  const { data, loading, error } = useQuery(MY_TEAM_QUERY, {
    variables: { userId: parseInt(userid) },
  });

  if (loading) return <p>Ładowanie danych...</p>;
  if (error) return <p>Błąd: {error.message}</p>;

  const team = data?.teamByUserId;
  if (!team) return <p>Nie należysz do żadnej drużyny.</p>;

  return (
    <div>
      <h1>{team.name}</h1>
      <p>Liczba graczy: {team.playersCount}</p>
      <p>Liczba meczów: {team.matchesCount}</p>
      <p>Miasto: {team.city.name}</p>
      <p>Liga: {team.league.name}</p>
      <p>Kapitan: {team.captain.username}</p>
      <h1>Gracze:</h1>
      <ul>
        {team.players.map((player, index) => (
          <li key={index}>
            {player.user.username} Pozycja: {player.position} Gole:{" "}
            {player.goals} Asysty: {player.assists} MVP: {player.mvp}
          </li>
        ))}
      </ul>
      <hi>Mecze</hi>
      <ul>
        {team.matches.map((matches, index) => (
          <li key={index}>
            {matches.matchDate} Gospodarze: {matches.homeTeam.name} - Goście:{" "}
            {matches.awayTeam.name}
            {matches.scoreHome} : {matches.scoreAway}
            Wygrana: {matches.winner}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Team;
