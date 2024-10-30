import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import "../styles/editProfile.scss";

const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile(
    $firstName: String!
    $lastName: String!
    $number: Int
    $position: String
    $weight: Int
    $height: Int
    $cityName: String
  ) {
    updateUserProfile(
      cityName: $cityName
      firstName: $firstName
      lastName: $lastName
      height: $height
      weight: $weight
      number: $number
      position: $position
    ) {
      user {
        username
        firstName
        lastName
      }
      player {
        height
        weight
      }
    }
  }
`;

const GET_ALL_CITIES = gql`
  query GetAllCities {
    allCities {
      id
      name
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
  const { data: citiesData } = useQuery(GET_ALL_CITIES);

  console.log(citiesData);

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
      console.error("Error updating profile:", error);
    }
  };

  if (loadingUpdate) return <p>Aktualizacja profilu...</p>;
  if (errorUpdate) return <p>Błąd: {errorUpdate.message}</p>;
  const cityOptions = citiesData?.allCities || [];

  return (
    <div className="profile-edit-container">
      <div className="header-section">
        <h1 className="header-title">Edytuj Profil</h1>
        <img className="profile-pic" alt="profile" />
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

        <button type="submit" className="submit-btn">
          Zapisz zmiany
        </button>
      </form>

      {updateData && <p>Profil został zaktualizowany!</p>}

      <button className="back-btn" onClick={() => navigate(-1)}>
        Powrót
      </button>
    </div>
  );
};

export default EditProfile;
