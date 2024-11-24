import "./App.css";
import { REFRESH_TOKEN_MUTATION } from "./queries/mutations";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  useApolloClient,
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
} from "@apollo/client";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import RegistrationForm from "./components/register";
import LoginForm from "./components/login";
import Navigation from "./components/navigation";
import Home from "./components/home";
import Team from "./components/myTeam";
import PlayerProfile from "./components/myProfile";
import CreateTeam from "./components/createTeam";
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
import EditTeam from "./components/editTeam";

const httpLink = createUploadLink({
  uri: "http://localhost:8000/graphql/",
  credentials: "include",
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: httpLink,
  credentials: "include",
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
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
          <Route path="/editTeam" element={<EditTeam />} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;
