import { gql, useMutation } from "@apollo/client";
import React, { useState } from "react";

const REGISTER_MUTATION = gql`
  mutation register(
    $email: String!
    $username: String!
    $password1: String!
    $password2: String!
  ) {
    register(
      email: $email
      username: $username
      password1: $password1
      password2: $password2
    ) {
      token
      success
      errors
    }
  }
`;

const RegistrationForm = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [positiveMessage, setPositiveMessage] = useState("");

  const [register, { data, loading, error }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      if (data.register.success) {
        setPositiveMessage("Link aktywacyjny został wysłany na pocztę! :)");
        setErrorMessage(""); // Wyczyść błędy, jeśli rejestracja się powiedzie
      } else if (data.register.errors) {
        // Wyciągamy komunikaty błędów
        const errorMessages = Object.entries(data.register.errors)
          .map(([errors]) => {
            return errors.map((err) => `${err.message}`).join(", ");
          })
          .join(", ");
        setErrorMessage(errorMessages); // Ustawiamy wiadomości błędów
      }
    },
    onError: (error) => {
      setErrorMessage("Wystąpił błąd podczas rejestracji. Spróbuj ponownie.");
    },
  });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password1: "",
    password2: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await register({
      variables: {
        username: formData.username,
        email: formData.email,
        password1: formData.password1,
        password2: formData.password2,
      },
    });
  };

  return (
    <div>
      <h2>Formularz rejestracji</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Imię:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password1">Hasło:</label>
          <input
            type="password"
            id="password1"
            name="password1"
            value={formData.password1}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password2">Powtórz Hasło:</label>
          <input
            type="password"
            id="password2"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Zarejestruj się</button>

        {loading && <p>Rejestracja trwa...</p>}
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        {positiveMessage && <p style={{ color: "green" }}>{positiveMessage}</p>}
      </form>
    </div>
  );
};

export default RegistrationForm;
