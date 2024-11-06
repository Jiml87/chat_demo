'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextAreaField, Flex, Text } from '@aws-amplify/ui-react';

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
        // console.log('data', data);
        if (data.error) {
          router.push('/login');
        } else {
          setUser(data);
          getList();
          //   setMessages([
          //     {
          //       id: '1',
          //       content: 'sdfadsfasdfa asdfasdfasf asfdasf',
          //       ...data,
          //       userFirstName: data.firstName,
          //     },
          //     {
          //       id: '2',
          //       content:
          //         'sdfadsfasdfa asdfasdfasf asfdasf fasfasdfa asf sdafa sdfaasf  s afdasdf asd fas fas as fasd',
          //       username: 'user_brand',
          //       userFirstName: 'Brand',
          //     },
          //   ]);
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

  function handleSendMessage() {
    if (user && userMessage) {
      client.models.Messages.create({
        content: userMessage,
        username: user.username,
        userFirstName: user.firstName,
      }).then(() => {
        setUserMessage('');
      });
    }
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chat-wrapper">
      <div className="messages-wrapper">
        <div className="messages-scroll">
          {messages.map((item) => (
            <div key={item.id} className="chat-message">
              <Flex
                justifyContent="space-between"
                gap=".25rem"
                alignItems={
                  item.username === user.username ? 'flex-end' : 'flex-start'
                }
                direction="column"
              >
                <Text
                  variation="primary"
                  color="#534f4f"
                  as="div"
                  lineHeight="1em"
                  fontWeight={600}
                  fontSize="1em"
                  fontStyle="normal"
                  textDecoration="none"
                  // width="30vw"
                >
                  {item.userFirstName}
                </Text>
                <div
                  className={`message-content ${item.username === user.username ? 'owner' : 'others'}`}
                >
                  <span>{item.content}</span>
                  <span className="del" onClick={() => deleteMessage(item.id)}>
                    &#9249;
                  </span>
                </div>
                {/* <button >Delete</button> */}
              </Flex>
            </div>
          ))}
        </div>
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
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}
