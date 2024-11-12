import React, { useEffect, useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import "../styles/login.scss";
import { LOGIN_MUTATION } from "../queries/mutations";

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
        localStorage.setItem("userId", data.login.user.id);
      } else if (data.login.errors) {
        setErrorMessage(data.login.errors);
      }
    },
  });

  useEffect(() => {
    if (isLogged) {
      navigate("/home");
    }
  }, [isLogged, navigate]);

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
      await Login({
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
    <div className="login-background">
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Zaloguj Się</h2>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              name="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="username">Nazwa Użytkownika:</label>
            <input
              id="username"
              name="username"
              placeholder="Nazwa użytkownika"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Hasło:</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Hasło"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Zaloguj się
          </button>
          {loading && <p>Logowanie...</p>}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
