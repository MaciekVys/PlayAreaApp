import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import RegistrationForm from "./components/register";
import LoginForm from "./components/login";
import Navigation from "./components/navigation";
import Home from "./components/home";
import StartPage from "./components/StartPage";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "http://localhost:8000/graphql/",
  credentials: "include",
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;
