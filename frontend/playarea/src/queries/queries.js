import { gql } from "@apollo/client";
export {
  CITY_QUERY,
  GET_MATCH_STATISTICS,
  ME_QUERY,
  ALL_CITIES,
  GET_MATCH_PLAYERS,
  MY_TEAM_QUERY,
  GET_TEAMS_IN_USER_LEAGUE,
  USER_PROFILE,
  PLAYER_STATISTICS_SUMMARY_QUERY,
  MY_NOTIFICATIONS,
  SEARCH_USERS,
  SEARCH_CITIES,
  SEARCH_TEAMS,
  PLAYER_BY_ID,
  TEAM_BY_ID,
  TEAM_STATISTICS_SUMMARY_QUERY,
};
const TEAM_STATISTICS_SUMMARY_QUERY = gql`
  query teamStatisticsSummary($teamId: ID!) {
    teamStatisticsSummary(teamId: $teamId) {
      totalMvps
      totalGoals
      totalAssists
      user {
        username
      }
    }
  }
`;

const CITY_QUERY = gql`
  query GetCityData($name: String!) {
    cityName(name: $name) {
      image
      id
      name
      voivodeship
      league {
        name
        level
        rankings {
          points
          wins
          draws
          losses
          goalsFor
          goalsAgainst
          team {
            logo
            name
            id
          }
        }
      }
      matches {
        homeTeam {
          logo
          id
          name
          captain {
            id
            username
          }
        }
        awayTeam {
          logo
          name
          id
          captain {
            id
            username
          }
        }
        id
        matchDate
        scoreHome
        scoreAway
        status
        winner
      }
    }
  }
`;

const GET_MATCH_STATISTICS = gql`
  query GetMatchStatistics($matchId: ID!) {
    match(id: $matchId) {
      homeTeam {
        name
        logo
        players {
          username
          playerstatisticsSet {
            goals
            assists
            isMvp
          }
        }
      }
      awayTeam {
        name
        logo
        players {
          username
          playerstatisticsSet {
            goals
            assists
            isMvp
          }
        }
      }
      scoreHome
      scoreAway
      matchDate
    }
  }
`;
const ME_QUERY = gql`
  query MeQuery {
    me {
      photo
      id
      city {
        name
      }
      team {
        name
        id
      }
      captainOfTeam {
        captain {
          username
        }
      }
    }
  }
`;
const ALL_CITIES = gql`
  query MeQuery {
    allCities {
      image
      name
      id
      league {
        name
        level
      }
    }
  }
`;

const GET_MATCH_PLAYERS = gql`
  query GetMatchPlayers($matchId: ID!) {
    match(id: $matchId) {
      id
      status
      homeTeam {
        name
        captain {
          id
        }
        players {
          id
          username
        }
      }
      awayTeam {
        name
        captain {
          id
        }
        players {
          id
          username
        }
      }
      matchresultSet {
        homeTeamConfirmed
        awayTeamConfirmed
      }
    }
  }
`;

const MY_TEAM_QUERY = gql`
  query team {
    teamByUser {
      id
      name
      logo
      league {
        name
        id
        level
        city {
          name
        }
      }
      matchesCount
      captain {
        username
        id
      }
      players {
        photo
        id
        username
        position
        height
        weight
      }
      matches {
        id
        matchDate
        scoreHome
        scoreAway
        status
        winner
        homeTeam {
          logo
          name
          id
        }
        awayTeam {
          logo
          name
          id
        }
      }
    }
  }
`;
const GET_TEAMS_IN_USER_LEAGUE = gql`
  query GetTeamsInUserLeague {
    teamsInUserLeague {
      id
      name
      logo
    }
  }
`;
const USER_PROFILE = gql`
  query userProfile {
    userProfile {
      username
      firstName
      lastName
      id
      email
      position
      weight
      height
      number
      photo
      city {
        name
      }
      team {
        name
        captain {
          username
        }
        league {
          name
        }
        logo
      }
      playerstatisticsSet {
        goals
        assists
        isMvp
      }
    }
  }
`;

const PLAYER_STATISTICS_SUMMARY_QUERY = gql`
  query playerStatisticsSummary($userId: ID!) {
    playerStatisticsSummary(userId: $userId) {
      totalMvps
      totalGoals
      totalAssists
      user {
        username
      }
    }
  }
`;
const MY_NOTIFICATIONS = gql`
  query {
    myNotifications {
      id
      recipient {
        username
      }
      sender {
        username
      }
      message
      statusMessage
      isResponded
      isRead
      notificationType
      createdAt
      match {
        id
        homeTeam {
          name
        }
        awayTeam {
          name
        }
      }
    }
  }
`;
const SEARCH_USERS = gql`
  query SearchUsers($username: String!) {
    searchUsers(username: $username) {
      edges {
        node {
          id
          username
        }
      }
    }
  }
`;

const SEARCH_CITIES = gql`
  query SearchCities($name: String!) {
    searchCities(name: $name) {
      edges {
        node {
          id
          name
          image
        }
      }
    }
  }
`;

const SEARCH_TEAMS = gql`
  query SearchTeams($name: String!) {
    searchTeams(name: $name) {
      edges {
        node {
          id
          name
          logo
        }
      }
    }
  }
`;
const PLAYER_BY_ID = gql`
  query PlayerProfile($userId: ID!) {
    playerById(userId: $userId) {
      username
      firstName
      lastName
      id
      email
      weight
      height
      number
      photo
      city {
        name
      }
      team {
        id
        name
        captain {
          username
        }
        league {
          name
        }
        logo
      }
      playerstatisticsSet {
        goals
        assists
        isMvp
      }
    }
  }
`;
const TEAM_BY_ID = gql`
  query TeamById($id: ID!) {
    teamById(id: $id) {
      id
      name
      logo
      captain {
        username
        id
      }
      league {
        name
        level
        city {
          name
        }
      }
      playersCount
      players {
        id
        position
        height
        weight
        id
        number
        photo
        username
      }
      matchesCount
      matches {
        homeTeam {
          name
          id
          logo
        }
        awayTeam {
          name
          id
          logo
        }
        id
        matchDate
        scoreHome
        scoreAway
        status
        winner
      }
    }
  }
`;
