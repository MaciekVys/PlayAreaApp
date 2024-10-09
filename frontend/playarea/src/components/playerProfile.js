import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React from "react";
import "../styles/playerProfile.scss";

const PLAYER_PROFILE = gql`
  query profile($userId: Int!) {
    playerProfile(userId: $userId) {
      user {
        firstName
        lastName
        username
      }
      team {
        name
        city {
          name
        }
        league {
          name
          level
        }
      }
      position
      goals
      assists
      mvp
      weight
      height
    }
  }
`;

const PlayerProfile = () => {
  const userId = localStorage.getItem("userId");

  const { data, loading, error } = useQuery(PLAYER_PROFILE, {
    variables: { userId: parseInt(userId) },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const player = data.playerProfile;

  return (
    <div className="container-player">
      {player ? (
        <>
          <div className="user">
            <h1>
              {player.user.firstName} {player.user.lastName}"
              {player.user.username}"
            </h1>
            <img />
          </div>
          <div className="stats">
            <p>Team: {player.team.name}</p>
            <p>Position: {player.position}</p>
            <p>Goals: {player.goals}</p>
            <p>Assists: {player.assists}</p>
            <p>MVP Awards: {player.mvp}</p>
            <p>Weight: {player.weight} kg</p>
            <p>Height: {player.height} cm</p>
          </div>
          <div className="team">TEAM</div>
        </>
      ) : (
        <div>Brak danych o profilu gracza</div>
      )}
    </div>
  );
};

export default PlayerProfile;
