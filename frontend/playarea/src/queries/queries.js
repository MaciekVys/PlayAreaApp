import { gql } from "@apollo/client";
export {
  CITY_QUERY,
  GET_MATCH_DETAILS,
  ME_QUERY,
  ALL_CITIES,
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
  GET_TOP_TEAMS,
  GET_TOP_PLAYERS,
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
          goalDifference
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
const GET_MATCH_DETAILS = gql`
  query GetMatchDetails($matchId: ID!) {
    match(id: $matchId) {
      id
      status
      matchDate
      scoreHome
      scoreAway
      homeTeam {
        id
        name
        logo
        captain {
          id
        }
        players {
          photo
          id
          username
        }
      }
      homeTeamStatistics {
        player {
          photo
          id
          username
          goals
          assists
          mvp
        }
        goals
        assists
        isMvp
      }
      awayTeam {
        id
        name
        logo
        captain {
          id
        }
        players {
          photo
          id
          username
        }
      }
      awayTeamStatistics {
        player {
          photo
          id
          username
          goals
          assists
          mvp
        }
        goals
        assists
        isMvp
      }
      matchresultSet {
        homeTeamConfirmed
        awayTeamConfirmed
      }
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
        goals
        assists
        mvp
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
      goals
      assists
      mvp
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
      teamStats {
        team {
          id
          logo
          name
          league {
            name
          }
        }
        dateLeft
        goals
        assists
        mvp
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
        id
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
      goals
      assists
      mvp
      photo
      position
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
      teamStats {
        team {
          id
          logo
          name
          league {
            name
          }
        }
        dateJoined
        dateLeft
        goals
        assists
        mvp
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
        goals
        assists
        mvp
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
const GET_TOP_TEAMS = gql`
  query GetTopTeams {
    topTeams {
      id
      name
      matchesPlayed
      wins
      logo
      league {
        name
        city {
          name
          id
        }
      }
    }
  }
`;

const GET_TOP_PLAYERS = gql`
  query GetTopPlayers {
    topPlayers {
      id
      username
      firstName
      lastName
      team {
        logo
        id
        name
      }
      goals
      assists
      mvp
      photo
    }
  }
`;
