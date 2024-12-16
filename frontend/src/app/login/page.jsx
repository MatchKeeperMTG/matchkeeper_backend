'use client'
import React, { useState } from 'react';
import { apiURL } from '../api';
import { useRouter } from 'next/navigation';
import AnimatedLogo from '../components/logo';
import PastelContainer from '../components/pastel';

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  async function loginPressed(event) {
    event.preventDefault();
    if (!credentials.username || !credentials.password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      const response = await fetch(apiURL('/api/user/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        router.push('/');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    }
  }

  return (
    <PastelContainer>
      <header>
        <h1>Sign In</h1>
      </header>

      <main>
        <form>
          <input
            placeholder='Username'
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          />
          <input
            placeholder='Password'
            type='password'
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          />

          {error && <div>{error}</div>}

          <a href="/register/">
            Not a user? Register now!
          </a>

          <button onClick={loginPressed}>Log In</button>
        </form>

      </main>

    </PastelContainer>
  );
}