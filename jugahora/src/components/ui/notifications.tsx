import { useEffect, useState } from 'react';
import { getNotifications } from '../../lib/notification';

interface Notification {
  id: number;
  type: string;
  message: string;
  createdAt: string;
}

interface NotificationsProps {
  clubId: number;
}

const Notifications: React.FC<NotificationsProps> = ({ clubId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications(clubId);
        setNotifications(data);
      } catch (err) {
        setError('Error al obtener las notificaciones');
      }
    };

    fetchNotifications();
  }, [clubId]);

  return (
    <div>
      <h2>Notificaciones</h2>
      {error && <p>{error}</p>}
      {notifications.length === 0 ? (
        <p>No tienes notificaciones.</p>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li key={notification.id}>
              <p><strong>{notification.type}:</strong> {notification.message}</p>
              <p>{new Date(notification.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
