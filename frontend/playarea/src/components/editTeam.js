import React, { useState, useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { MY_TEAM_QUERY } from "../queries/queries";
import "../styles/editTeam.scss";
import { useNavigate } from "react-router-dom";

// Mutation to delete the team
const DELETE_TEAM = gql`
  mutation deleteTeam($teamId: ID!) {
    deleteTeam(teamId: $teamId) {
      success
      message
    }
  }
`;

// Updated mutation for team editing
const UPDATE_TEAM = gql`
  mutation updateTeam(
    $teamId: ID!
    $removePlayerId: ID
    $newCaptainId: ID
    $name: String
  ) {
    updateTeam(
      teamId: $teamId
      removePlayerId: $removePlayerId
      newCaptainId: $newCaptainId
      name: $name
    ) {
      success
      errors
    }
  }
`;

const EditTeam = () => {
  const { loading, error, data, refetch } = useQuery(MY_TEAM_QUERY);
  const [teamData, setTeamData] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  // Mutation to delete the team
  const [deleteTeam] = useMutation(DELETE_TEAM, {
    onCompleted: (data) => {
      if (data.deleteTeam.success) {
        alert("Drużyna została usunięta!");
        navigate("/home");
      } else {
        alert(`Błąd: ${data.deleteTeam.message}`);
      }
    },
    onError: (error) => {
      console.error("Błąd przy usuwaniu drużyny:", error.message);
      alert("Wystąpił błąd podczas próby usunięcia drużyny.");
    },
  });

  // Mutation to update the team
  const [updateTeam] = useMutation(UPDATE_TEAM, {
    onCompleted: (data) => {
      if (data.updateTeam.success) {
        alert("Zmiany zostały zapisane!");
      } else {
        alert(`Błąd przy zapisie zmian: ${data.updateTeam.errors.join(", ")}`);
      }
      refetch();
    },
    onError: (error) => {
      console.error("Błąd przy aktualizacji drużyny:", error.message);
      alert("Wystąpił błąd podczas próby zapisania zmian.");
    },
  });

  // Update state when query completes
  useEffect(() => {
    if (data && data.teamByUser) {
      setTeamData(data.teamByUser);
    }
  }, [data]);

  // Delete team handler
  const handleDeleteTeam = () => {
    if (teamData && teamData.id) {
      const confirmDelete = window.confirm(
        "Czy na pewno chcesz usunąć tę drużynę? Ta operacja jest nieodwracalna."
      );
      if (confirmDelete) {
        deleteTeam({ variables: { teamId: teamData.id } });
      }
    }
  };

  // Change handler for form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeamData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Save team changes handler
  const handleSaveChanges = () => {
    if (teamData && teamData.id) {
      updateTeam({
        variables: {
          teamId: teamData.id,
          name: teamData.name || undefined,
        },
      });
    }
  };

  // Transfer captaincy handler
  const handleTransferCaptaincy = (playerId) => {
    if (window.confirm("Czy na pewno chcesz przekazać kapitana?")) {
      updateTeam({
        variables: {
          teamId: teamData.id,
          newCaptainId: playerId,
        },
      });
    }
  };

  // Remove player handler
  const handleRemovePlayer = (playerId) => {
    if (window.confirm("Czy na pewno chcesz usunąć tego gracza z drużyny?")) {
      updateTeam({
        variables: {
          teamId: teamData.id,
          removePlayerId: playerId,
        },
      });
    }
  };

  // Render form
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error! {error.message}</div>;
  if (!teamData) return null;

  return (
    <div className="edit-team-container">
      <h1 className="edit-team-header">Edit Team</h1>
      <form className="edit-team-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label className="form-label">Name:</label>
          <input
            type="text"
            name="name"
            value={teamData.name}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Logo URL:</label>
          <input
            type="text"
            name="logo"
            value={teamData.logo}
            onChange={handleChange}
            className="form-input"
            disabled
          />
        </div>

        <div className="form-group">
          <label className="form-label">Captain:</label>
          <input
            type="text"
            name="captain"
            value={teamData.captain.username}
            className="form-input"
            disabled
          />
        </div>

        <h3 className="players-header">Players</h3>
        {teamData.players.map((player) =>
          player.id !== userId ? (
            <div key={player.id} className="player-info">
              <h4 className="player-username">{player.username}</h4>
              <button onClick={() => handleRemovePlayer(player.id)}>
                Wyrzuć gracza
              </button>
              <button onClick={() => handleTransferCaptaincy(player.id)}>
                Przekaż kapitana
              </button>
            </div>
          ) : (
            <div key={player.id} className="player-info">
              <h4 className="player-username">{player.username}</h4>
            </div>
          )
        )}

        <button
          type="button"
          className="save-button"
          onClick={handleSaveChanges}
        >
          Save Changes
        </button>
        <button
          type="button"
          className="delete-button"
          onClick={handleDeleteTeam}
        >
          Delete Team
        </button>
      </form>
    </div>
  );
};

export default EditTeam;
