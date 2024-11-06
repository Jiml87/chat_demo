'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextAreaField } from '@aws-amplify/ui-react';

import './chat.css';

interface User {
  username: string;
  firstName: string;
}

export default function Chat() {
  const router = useRouter();
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.push('/login');
    }

    fetch(
      'https://q00ep27rgj.execute-api.us-east-1.amazonaws.com/api/user-profile',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )
      .then((response) => response.json())
      .then((data) => {
        console.log('data', data);
        if (data.error) {
          router.push('/login');
        }
        setUser(data);
      })
      .catch((error) => {
        console.error(error);
        router.push('/login');
      });
  }, [router]);

  const handleSendMessage = () => null;

  return (
    <div className="chat-wrapper">
      <div className="messages-wrapper"></div>
      <div className="input-wrapper">
        <TextAreaField
          label=""
          name="chatMessage"
          placeholder="Add your message"
          rows={3}
          className="textarea"
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}
