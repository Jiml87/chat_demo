'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextAreaField, Flex } from '@aws-amplify/ui-react';

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

import './chat.css';

Amplify.configure(outputs);
const client = generateClient<Schema>();

interface User {
  username: string;
  firstName: string;
}

export default function Chat() {
  const router = useRouter();
  const [user, setUser] = useState<User>();
  const [messages, setMessages] = useState<Array<Schema['Messages']['type']>>(
    [],
  );

  const [userMessage, setUserMessage] = useState<string>();

  function getList() {
    client.models.Messages.observeQuery().subscribe({
      next: (data) => setMessages([...data.items]),
    });
  }

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
        } else {
          setUser(data);
          getList();
        }
      })
      .catch((error) => {
        console.error(error);
        router.push('/login');
      });
  }, [router]);

  function deleteMessage(id: string) {
    client.models.Messages.delete({ id });
  }

  function handleSendMessage(e: any) {
    if (user) {
      client.models.Messages.create({
        content: e.target.value,
        username: user.username,
        userFirstName: user.firstName,
      });
    }
  }

  return (
    <div className="chat-wrapper">
      <div className="messages-wrapper">
        {messages.map((item) => (
          <li key={item.id}>
            <Flex justifyContent="space-between" gap="1rem" alignItems="center">
              <div>{item.content}</div>
              <button onClick={() => deleteMessage(item.id)}>Delete</button>
            </Flex>
          </li>
        ))}
      </div>
      <div className="input-wrapper">
        <TextAreaField
          label=""
          name="chatMessage"
          placeholder="Add your message"
          rows={3}
          className="textarea"
          value={userMessage}
          onChange={(e: any) => setUserMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}
