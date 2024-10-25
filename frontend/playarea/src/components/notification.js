import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";
import "../styles/notification.scss";

// Zapytanie GraphQL do pobierania powiadomień
const MY_NOTIFICATIONS = gql`
  query ($unread: Boolean!) {
    myNotifications(unread: $unread) {
      id
      recipient {
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

const RESPOND_TO_MATCH_INVITE = gql`
  mutation RespondToMatchInvite($matchId: ID!, $accept: Boolean!) {
    respondToMatchInvite(matchId: $matchId, accept: $accept) {
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

const Notification = () => {
  const { loading, error, data, refetch } = useQuery(MY_NOTIFICATIONS, {
    variables: { unread: true },
  });

  const [respondToMatchInvite] = useMutation(RESPOND_TO_MATCH_INVITE);
  const [deleteNotification] = useMutation(DELETE_NOTIFICATION);
  const [statusMessages, setStatusMessages] = useState({});

  // Obsługa odpowiedzi na zaproszenie do meczu
  const handleResponse = async (accept, matchId) => {
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
      <h1 className="notification-header">Powiadomienia</h1>
      {data.myNotifications.length === 0 ? (
        <p>Brak nowych powiadomień</p>
      ) : (
        <ul className="notification-list">
          {data.myNotifications.map((notification) => (
            <li
              key={notification.id}
              className={notification.isRead ? "read" : ""}
            >
              <p className="notification-username">
                {notification.recipient.username}: {notification.message}
              </p>
              <p className="notification-status">
                Status: {notification.isRead ? "Przeczytane" : "Nieprzeczytane"}
              </p>

              {notification.match ? (
                <p className="notification-match">
                  Mecz: {notification.match.homeTeam.name} vs{" "}
                  {notification.match.awayTeam.name}
                </p>
              ) : (
                <p>Brak powiązanego meczu</p>
              )}

              {notification.notificationType === "MATCH_INVITE" && (
                <div className="notification-actions">
                  {!notification.isResponded ? (
                    <>
                      <button
                        className="accept"
                        onClick={() =>
                          handleResponse(true, notification.match.id)
                        }
                      >
                        Akceptuj
                      </button>
                      <button
                        className="reject"
                        onClick={() =>
                          handleResponse(false, notification.match.id)
                        }
                      >
                        Odrzuć
                      </button>
                    </>
                  ) : (
                    <p>{notification.statusMessage}</p>
                  )}
                </div>
              )}

              <button
                className="delete"
                onClick={() => handleDelete(notification.id)}
              >
                Usuń
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notification;
