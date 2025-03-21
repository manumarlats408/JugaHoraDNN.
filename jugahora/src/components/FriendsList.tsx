'use client'

import { useEffect, useState } from 'react';

interface Friend {
  id: number;
  friend: {
    firstName: string;
    lastName: string;
  };
}

export default function FriendsList({ userId }: { userId: number }) {
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    fetch(`/api/list-friends?userId=${userId}`)
      .then((res) => res.json())
      .then(setFriends)
      .catch((error) => console.error('Error al cargar amigos:', error));
  }, [userId]);

  return (
    <div>
      <h2 className="font-bold text-green-800 mb-4">Lista de Amigos</h2>
      {friends.length > 0 ? (
        <ul>
          {friends.map((friend) => (
            <li key={friend.id}>
              {friend.friend.firstName} {friend.friend.lastName}
            </li>
          ))}
        </ul>
      ) : (
        <p>No tienes amigos aún.</p>
      )}
    </div>
  );
}
