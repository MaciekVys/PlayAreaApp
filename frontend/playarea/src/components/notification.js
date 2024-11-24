import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";
import "../styles/notification.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandshakeSimple,
  faHandshakeSimpleSlash,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { MY_NOTIFICATIONS } from "../queries/queries";
import {
  RESPOND_TO_JOIN_TEAM,
  RESPOND_TO_MATCH_INVITE,
  DELETE_NOTIFICATION,
} from "../queries/mutations";
import { useNavigate } from "react-router-dom";

export const RESPOND_TO_INVITE_TEAM = gql`
  mutation RespondToInviteTeam($accept: Boolean!, $notificationId: ID!) {
    respondToInviteTeam(accept: $accept, notificationId: $notificationId) {
      success
      message
    }
  }
`;

const Notification = () => {
  const navigate = useNavigate();
  const { loading, error, data, refetch } = useQuery(MY_NOTIFICATIONS, {
    variables: { unread: true },
  });

  const [respondToInviteTeam] = useMutation(RESPOND_TO_INVITE_TEAM);
  const [respondToMatchInvite] = useMutation(RESPOND_TO_MATCH_INVITE);
  const [respondToJoinTeam] = useMutation(RESPOND_TO_JOIN_TEAM);
  const [deleteNotification] = useMutation(DELETE_NOTIFICATION);
  const [statusMessages, setStatusMessages] = useState({});

  // Obsługa odpowiedzi na zaproszenie do meczu
  const handleResponseMatchInvite = async (accept, matchId) => {
    try {
      const { data } = await respondToMatchInvite({
        variables: { accept, matchId },
      });

      if (data.respondToMatchInvite.success) {
        alert(data.respondToMatchInvite.message);
        setStatusMessages((prevMessages) => ({
          ...prevMessages,
          [matchId]: data.respondToMatchInvite.statusMessage,
        }));
        refetch();
      } else {
        alert(data.respondToMatchInvite.message);
      }
    } catch (error) {
      alert("Wystąpił błąd: " + error.message);
    }
  };

  // Obsługa odpowiedzi na zaproszenie do drużyny
  const handleResponseJoinTeam = async (accept, notificationId) => {
    try {
      const { data } = await respondToJoinTeam({
        variables: { notificationId, accept },
      });

      if (data.respondToJoinRequest.success) {
        alert(data.respondToJoinRequest.message);
        refetch();
      } else {
        alert(data.respondToJoinRequest.message);
      }
    } catch (error) {
      alert("Wystąpił błąd: " + error.message);
    }
  };

  // Obsługa odpowiedzi na zaproszenie do drużyny
  const handleResponseInviteTeam = async (accept, notificationId) => {
    try {
      const { data } = await respondToInviteTeam({
        variables: { notificationId, accept },
      });

      if (data.respondToInviteTeam.success) {
        alert(data.respondToInviteTeam.message);
        refetch();
      } else {
        alert(data.respondToInviteTeam.message);
      }
    } catch (error) {
      alert("Wystąpił błąd: " + error.message);
    }
  };

  const handleDelete = async (notificationId) => {
    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć to powiadomienie?"
    );
    if (confirmed) {
      try {
        const { data } = await deleteNotification({
          variables: { notificationId },
        });

        if (data.deleteNotification.success) {
          alert("Powiadomienie zostało usunięte.");
          refetch();
        } else {
          alert(data.deleteNotification.message);
        }
      } catch (error) {
        alert("Wystąpił błąd podczas usuwania powiadomienia: " + error.message);
      }
    }
  };

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p>Wystąpił błąd: {error.message}</p>;

  return (
    <div className="notification-container">
      <div className="body-container">
        <h1 className="notification-header">Powiadomienia</h1>
        {data.myNotifications.length === 0 ? (
          <p>Brak nowych powiadomień</p>
        ) : (
          <ul style={{ color: "white" }} className="notification-list">
            {data.myNotifications.map((notification) => (
              <li
                key={notification.id}
                className={notification.isRead ? "read" : ""}
              >
                {/* Nagłówek na podstawie typu powiadomienia */}
                {notification.notificationType === "MATCH_INVITE" && (
                  <h2>Zaproszenie do meczu</h2>
                )}
                {notification.notificationType === "JOIN_REQUEST" && (
                  <h2>Prośba o przyjęcie do drużyny</h2>
                )}
                {notification.notificationType === "TEAM_INVITE" && (
                  <h2>Zaproszenie do drużyny</h2>
                )}

                <p
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/profile/${notification?.sender?.id}`)
                  }
                  className="notification-username"
                >
                  {"Od: "}
                  {notification?.sender?.username || "Nieznany"}
                  <br />
                  {"Do: "}
                  {notification.recipient.username}
                  <br />
                  {"Wiadomość: "}
                  {notification.message}
                </p>

                {notification.match ? (
                  <p>
                    Mecz: {notification.match.homeTeam.name} vs{" "}
                    {notification.match.awayTeam.name}
                  </p>
                ) : null}

                {notification.notificationType === "MATCH_INVITE" && (
                  <div className="notification-actions">
                    {!notification.isResponded ? (
                      <>
                        <button
                          className="accept"
                          onClick={() =>
                            handleResponseMatchInvite(
                              true,
                              notification.match.id
                            )
                          }
                        >
                          Akceptuj <FontAwesomeIcon icon={faHandshakeSimple} />
                        </button>
                        <button
                          className="reject"
                          onClick={() =>
                            handleResponseMatchInvite(
                              false,
                              notification.match.id
                            )
                          }
                        >
                          Odrzuć{" "}
                          <FontAwesomeIcon icon={faHandshakeSimpleSlash} />
                        </button>
                      </>
                    ) : (
                      <p className="notification-match">
                        {notification.statusMessage}
                      </p>
                    )}
                  </div>
                )}

                {notification.notificationType === "JOIN_REQUEST" && (
                  <div className="notification-actions">
                    {notification.isResponded ? (
                      <p className="notification-match">
                        {notification.statusMessage}
                      </p>
                    ) : (
                      <>
                        <button
                          className="accept"
                          onClick={() =>
                            handleResponseJoinTeam(true, notification.id)
                          }
                        >
                          Akceptuj <FontAwesomeIcon icon={faHandshakeSimple} />
                        </button>
                        <button
                          className="reject"
                          onClick={() =>
                            handleResponseJoinTeam(false, notification.id)
                          }
                        >
                          Odrzuć{" "}
                          <FontAwesomeIcon icon={faHandshakeSimpleSlash} />
                        </button>
                      </>
                    )}
                  </div>
                )}

                {notification.notificationType === "TEAM_INVITE" && (
                  <div className="notification-actions">
                    {notification.isResponded ? (
                      <p className="notification-match">
                        {notification.statusMessage}
                      </p>
                    ) : (
                      <>
                        <button
                          className="accept"
                          onClick={() =>
                            handleResponseInviteTeam(true, notification.id)
                          }
                        >
                          Akceptuj <FontAwesomeIcon icon={faHandshakeSimple} />
                        </button>
                        <button
                          className="reject"
                          onClick={() =>
                            handleResponseInviteTeam(false, notification.id)
                          }
                        >
                          Odrzuć{" "}
                          <FontAwesomeIcon icon={faHandshakeSimpleSlash} />
                        </button>
                      </>
                    )}
                  </div>
                )}

                <button
                  className="delete"
                  onClick={() => handleDelete(notification.id)}
                >
                  <FontAwesomeIcon icon={faTrashCan} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notification;
