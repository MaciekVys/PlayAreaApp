import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import RegistrationForm from "./components/register";
import LoginForm from "./components/login";
import Navigation from "./components/navigation";
import Home from "./components/home";
import Team from "./components/myTeam";
import PlayerProfile from "./components/myProfile";
import CreateTeam from "./components/createTeam";
import StartPage from "./components/startPage";
import City from "./components/city";
import UserTeam from "./components/userTeam";
import UserProfile from "./components/userProfile";
import CheckCity from "./components/checkCity";
import Notification from "./components/notification";
import ChallengeTeam from "./components/getChallengeTeam";
import EditProfile from "./components/editProfile";
import ConfirmMatchResult from "./components/confirmMatchResult";
import CheckMatch from "./components/checkMatch";
import SearchView from "./components/searchView";
import JoinToTeam from "./components/joinToTeam";

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
          <Route path="/team" element={<Team />} />
          <Route path="/team/:id" element={<UserTeam />} />
          <Route path="/profile" element={<PlayerProfile />} />
          <Route path="/profile/:id" element={<UserProfile />} />
          <Route path="/createTeam" element={<CreateTeam />} />
          <Route path="/city" element={<City />} />
          <Route path="/city/:name" element={<CheckCity />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/getChallenge" element={<ChallengeTeam />} />
          <Route path="/settings" element={<EditProfile />} />
          <Route path="/confirmMatch/:id" element={<ConfirmMatchResult />} />
          <Route path="/checkMatch/:id" element={<CheckMatch />} />
          <Route path="/search/:keywords" element={<SearchView />} />
          <Route path="/search" element={<JoinToTeam />} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;
