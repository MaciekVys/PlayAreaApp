import React, { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
// import { MY_TEAM_QUERY } from "./queries";

const MY_TEAM_QUERY = gql`
  query team {
    teamByUser {
      id
      name
      logo
      league {
        name
        id
        level
        city {
          name
        }
      }
      matchesCount
      captain {
        username
        id
      }
      players {
        id
        username
        position
        height
        weight
      }
      matches {
        id
        matchDate
        scoreHome
        scoreAway
        status
        winner
        homeTeam {
          logo
          name
          id
        }
        awayTeam {
          logo
          name
          id
        }
      }
    }
  }
`;

const EditTeam = () => {
  const { loading, error, data } = useQuery(MY_TEAM_QUERY);

  const [teamData, setTeamData] = useState(null);

  // Jeśli zapytanie się uda, zaktualizuj stan
  useEffect(() => {
    if (data && data.teamByUser) {
      setTeamData(data.teamByUser);
    }
  }, [data]);

  // Funkcja obsługująca edycję danych
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeamData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Funkcja do obsługi edycji zawodników
  const handlePlayerChange = (e, playerId) => {
    const { name, value } = e.target;
    setTeamData((prevState) => ({
      ...prevState,
      players: prevState.players.map((player) =>
        player.id === playerId ? { ...player, [name]: value } : player
      ),
    }));
  };

  // Renderowanie formularza
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error! {error.message}</div>;

  if (!teamData) return null;

  return (
    <div>
      <h1>Edit Team</h1>
      <form>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={teamData.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Logo URL:</label>
          <input
            type="text"
            name="logo"
            value={teamData.logo}
            onChange={handleChange}
            disabled
          />
        </div>

        <div>
          <label>Captain:</label>
          <input
            type="text"
            name="captain"
            value={teamData.captain.username}
            disabled
          />
        </div>

        <h3>Players</h3>
        {teamData.players.map((player) => (
          <div key={player.id}>
            <h4>{player.username}</h4>
          </div>
        ))}

        <button>Save Changes</button>
        <button>Usuń drużynę!</button>
      </form>
    </div>
  );
};

export default EditTeam;
