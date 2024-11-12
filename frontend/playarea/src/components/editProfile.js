import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import "../styles/editProfile.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { ALL_CITIES } from "../queries/queries";
import { UPDATE_USER_PROFILE } from "../queries/mutations";
import { LOGOUT_MUTATION } from "../queries/mutations";

// Mutacja do usuwania konta
const DELETE_ACCOUNT = gql`
  mutation deleteAccount {
    deleteAccount {
      success
      message
    }
  }
`;

const EditProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    number: null,
    position: "",
    weight: null,
    height: null,
    cityName: "",
  });

  const [
    updateUserProfile,
    { data: updateData, loading: loadingUpdate, error: errorUpdate },
  ] = useMutation(UPDATE_USER_PROFILE);

  const { data: citiesData } = useQuery(ALL_CITIES);

  const [deleteAccount] = useMutation(DELETE_ACCOUNT, {
    onCompleted: async (data) => {
      if (data.deleteAccount.success) {
        await logoutUser();
        localStorage.clear();
        sessionStorage.clear();
        navigate("/home");
      } else {
        console.error("Błąd przy usuwaniu konta:", data.deleteAccount.message);
      }
    },
    onError: (error) => {
      console.error("Błąd przy usuwaniu konta:", error.message);
    },
  });

  // Dodaj mutację do wylogowania
  const [logoutUser] = useMutation(LOGOUT_MUTATION);

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
    } catch (error) {
      console.error("Błąd przy usuwaniu konta:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile({ variables: formData });
    } catch (error) {
      console.error("Błąd przy aktualizacji profilu:", error);
    }
  };

  if (loadingUpdate) return <p>Aktualizacja profilu...</p>;
  if (errorUpdate) return <p>Błąd: {errorUpdate.message}</p>;

  const cityOptions = citiesData?.allCities || [];

  return (
    <div className="main-container">
      <div className="profile-edit-container">
        <h1 className="header-title">Edytuj Profil</h1>
        <div className="header-section">
          <div className="placeholder-photo">Brak zdjęcia</div>
          <button onClick={handleDeleteAccount}>Usuń trwale konto!</button>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group1">
            <label>Imię:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group1">
            <label>Nazwisko:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group1">
            <label>Numer:</label>
            <input
              type="number"
              name="number"
              value={formData.number}
              onChange={handleChange}
            />
          </div>
          <div className="form-group1">
            <label>Pozycja:</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
            />
          </div>
          <div className="form-group1">
            <label>Waga (kg):</label>
            <input
              type="number"
              step="0.1"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
            />
          </div>
          <div className="form-group1">
            <label>Wzrost (cm):</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
            />
          </div>
          <div className="form-group1">
            <label>Miasto:</label>
            <input
              type="text"
              name="cityName"
              value={formData.cityName}
              onChange={handleChange}
              list="city-options"
            />
            <datalist id="city-options">
              {cityOptions.length > 0 ? (
                cityOptions.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))
              ) : (
                <option value="Brak dostępnych miast">
                  Brak dostępnych miast
                </option>
              )}
            </datalist>
          </div>
          <button type="submit">
            Zapisz zmiany <FontAwesomeIcon icon={faCheck} />
          </button>{" "}
          <button onClick={() => navigate(-1)}>
            Powrót <FontAwesomeIcon icon={faRotateLeft} />
          </button>
        </form>

        {updateData && <p>Profil został zaktualizowany!</p>}
      </div>
    </div>
  );
};

export default EditProfile;
