import React, { useState, useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { MY_TEAM_QUERY } from "../queries/queries";
import "../styles/editTeam.scss";
import { useNavigate } from "react-router-dom";

const DELETE_TEAM = gql`
  mutation deleteTeam($teamId: ID!) {
    deleteTeam(teamId: $teamId) {
      success
      message
    }
  }
`;

const UPLOAD_TEAM_LOGO = gql`
  mutation uploadTeamLogo($teamId: ID!, $file: Upload!) {
    uploadTeamLogo(teamId: $teamId, file: $file) {
      success
      message
    }
  }
`;

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
  const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;

  const { loading, error, data, refetch } = useQuery(MY_TEAM_QUERY);
  const [teamData, setTeamData] = useState(null);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

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

  const [uploadTeamLogo] = useMutation(UPLOAD_TEAM_LOGO, {
    onCompleted: (data) => {
      if (data.uploadTeamLogo.success) {
        alert("Zdjęcie drużyny zostało załadowane!");
        refetch();
      } else {
        alert(`Błąd: ${data.uploadTeamLogo.message}`);
      }
    },
    onError: (error) => {
      console.error("Błąd przy wgrywaniu zdjęcia:", error.message);
      alert("Wystąpił błąd przy wgrywaniu zdjęcia.");
    },
  });

  useEffect(() => {
    if (data && data.teamByUser) {
      setTeamData(data.teamByUser);
    }
  }, [data]);

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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

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

  const handleUploadLogo = () => {
    if (file) {
      uploadTeamLogo({
        variables: {
          teamId: teamData.id,
          file: file,
        },
      });
    } else {
      alert("Proszę wybrać plik przed wysłaniem.");
    }
  };

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
            onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
            className="form-input"
          />
        </div>

        <div className="form-group logo-upload">
          <label className="form-label">Logo:</label>
          <div className="logo-preview-container">
            <img
              src={
                `${MEDIA_URL}${teamData.logo}` || "placeholder-image-url.jpg"
              }
              alt="Team Logo"
              className="logo-preview"
            />
            <div
              className="overlay"
              onClick={() => document.getElementById("fileInput").click()}
            >
              Zmień zdjęcie
            </div>
          </div>
          <input
            type="file"
            name="logo"
            id="fileInput"
            onChange={handleFileChange}
            className="file-input"
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={handleUploadLogo}
            className="upload-button"
          >
            Zapisz
          </button>
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
