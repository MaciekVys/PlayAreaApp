import { gql } from "@apollo/client";
export {
  SEND_JOIN_REQUEST,
  REGISTER_MUTATION,
  RESPOND_TO_MATCH_INVITE,
  RESPOND_TO_JOIN_TEAM,
  DELETE_NOTIFICATION,
  LEAVE_TEAM_MUTATION,
  LOGOUT_MUTATION,
  LOGIN_MUTATION,
  CHALLENGE_TEAM_MUTATION,
  UPDATE_USER_PROFILE,
  CREATE_TEAM,
  CONFIRM_MATCH_RESULT,
  REFRESH_TOKEN_MUTATION,
};

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      token
      refreshToken
      success
      errors
    }
  }
`;

const SEND_JOIN_REQUEST = gql`
  mutation sendJoinRequest($teamId: ID!) {
    sendJoinRequest(teamId: $teamId) {
      success
      message
    }
  }
`;
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
const RESPOND_TO_MATCH_INVITE = gql`
  mutation RespondToMatchInvite($matchId: ID!, $accept: Boolean!) {
    respondToMatchInvite(matchId: $matchId, accept: $accept) {
      success
      message
    }
  }
`;

const RESPOND_TO_JOIN_TEAM = gql`
  mutation RespondToJoinRequest($notificationId: ID!, $accept: Boolean!) {
    respondToJoinRequest(notificationId: $notificationId, accept: $accept) {
      success
      message
    }
  }
`;

const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($notificationId: Int!) {
    deleteNotification(notificationId: $notificationId) {
      success
      message
    }
  }
`;
const LEAVE_TEAM_MUTATION = gql`
  mutation leaveTeam($teamId: ID!) {
    leaveTeam(teamId: $teamId) {
      success
      message
    }
  }
`;
const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      errors
    }
  }
`;
const LOGIN_MUTATION = gql`
  mutation login($email: String!, $username: String!, $password: String!) {
    login(email: $email, username: $username, password: $password) {
      success
      errors
      user {
        username
        id
      }
    }
  }
`;
const CHALLENGE_TEAM_MUTATION = gql`
  mutation ChallengeTeamToMatch($awayTeam: ID!, $matchDate: Date!) {
    challengeTeamToMatch(awayTeamId: $awayTeam, matchDate: $matchDate) {
      success
      message
    }
  }
`;
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
    }
  }
`;
const CREATE_TEAM = gql`
  mutation createTeam($cityName: String!, $name: String!) {
    createTeam(cityName: $cityName, name: $name) {
      success
      errors
      team {
        name
      }
    }
  }
`;
const CONFIRM_MATCH_RESULT = gql`
  mutation ConfirmMatchResult(
    $matchId: Int!
    $isHomeTeam: Boolean!
    $statistics: [PlayerStatisticsInput!]!
  ) {
    confirmMatchResult(
      matchId: $matchId
      isHomeTeam: $isHomeTeam
      statistics: $statistics
    ) {
      success
    }
  }
`;
