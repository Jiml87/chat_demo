'use client';

import { useState } from 'react';
import {
  Flex,
  Input,
  Label,
  Card,
  PasswordField,
  Text,
} from '@aws-amplify/ui-react';
import { useRouter } from 'next/navigation';

import './login.css';

export default function Login() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const onSignIn = async () => {
    try {
      const response = await fetch(
        'https://rgcouq610e.execute-api.us-east-1.amazonaws.com/development/api/login',
        {
          method: 'POST',
          headers: {
            Accept: 'application.json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
          cache: 'default',
        },
      );

      const data: any = await response.json();
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        router.push('/chat');
      } else {
        setError(data?.message);
      }
    } catch (error: any) {
      setError(error?.message);
    }
  };
  return (
    <div>
      <Card className="login-card">
        <Flex direction="column" gap="large">
          <div className="amplify-flex amplify-field amplify-textfield">
            <Label htmlFor="username">Username:</Label>
            <Input
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <PasswordField
              label="Password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </Flex>
        {error && (
          <div>
            <Text color="red">{error}</Text>
          </div>
        )}
        <Flex justifyContent="center">
          <button
            onClick={onSignIn}
            className="signin-button"
            disabled={!Boolean(username) || !Boolean(password)}
          >
            Sign In
          </button>
        </Flex>
      </Card>
    </div>
  );
}
