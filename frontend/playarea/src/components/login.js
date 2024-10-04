import React, { useEffect, useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";

const LOGIN_MUTATION = gql`
  mutation login($email: String!, $username: String!, $password: String!) {
    login(email: $email, username: $username, password: $password) {
      success
      errors
      user {
        username
      }
    }
  }
`;

const LoginForm = () => {
  const [isLogged, setIsLogged] = useState(false);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const [Login, { data, loading, error }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      if (data.login.success) {
        localStorage.setItem("isLogged", "true");
        setIsLogged(true);
        localStorage.setItem("username", data.login.user.username);
      } else if (data.login.errors) {
        setErrorMessage(data.login.errors);
      }
    },
  });

  useEffect(() => {
    if (isLogged) {
      navigate("/home");
    }
  });

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
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

    try {
      const response = await Login({
        variables: {
          email: formData.email,
          username: formData.username,
          password: formData.password,
        },
      });
    } catch (err) {
      console.error("Error logging in:", err);
    }
  };

  return (
    <div>
      <h2>Logowanie</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="username">Nazwa Użytkownika:</label>
          <input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Hasło:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Zaloguj się</button>
        {loading && <p>Logowanie...</p>}
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </form>
    </div>
  );
};

export default LoginForm;
