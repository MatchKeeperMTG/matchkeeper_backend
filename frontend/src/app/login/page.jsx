'use client'
import React, { useState } from 'react';
import { apiURL } from '../api';
import { useRouter } from 'next/navigation';
import AnimatedLogo from '../components/logo';
import VaporwaveContainer from '../components/vaporwave';

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  async function loginPressed() {
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
    <VaporwaveContainer>
      <header>
        <h1>Sign In</h1>
      </header>

      <main>
        <input
          style={styles.inputBox}
          placeholder='Username'
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
        />
        <input
          style={styles.inputBox}
          placeholder='Password'
          type='password'
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        />

        {error && <div style={styles.errorText}>{error}</div>}

        <a href="/register/" style={styles.labelText}>
          Not a user? Register now!
        </a>

        <button style={styles.loginButton} onClick={loginPressed}>
          <div style={styles.loginText}>Log In</div>
        </button>
      </main>

    </VaporwaveContainer>
  );
}

const styles = {
  pageContainer: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(180deg, rgba(200, 230, 197, 1), rgba(14, 0, 141, 1))',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: 0,
    padding: 0,
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    width: '30%'
  },
  logo: {
    width: '100%',
    height: 'auto',
    marginTop: '4vh',
  },
  headerText: {
    fontSize: '50px',
    color: '#FFFFFF',
    fontFamily: 'Ubuntu, sans-serif',
    textAlign: 'center',
    textShadow: '0px 2px 2px black'
  },
  labelText: {
    fontSize: '20px',
    color: '#FFFFFF',
    fontFamily: 'Ubuntu, sans-serif',
    textAlign: 'center',
    textShadow: '0px 2px 4px #7300ff'
  },
  errorText: {
    color: '#ffffff',
    fontSize: '16px',
    fontFamily: 'Ubuntu, sans-serif',
    textAlign: 'center',
    textShadow: '0px 2px 2px #9e0000'
  },
  inputBox: {
    width: '50%',
    height: '30px',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(0, 0, 0, 1)',
    borderRadius: '10px',
    padding: '10px'
  },
  loginButton: {
    backgroundColor: '#7300ff',
    padding: '5px',
    borderRadius: '10px',
    left: '610px',
    top: '692px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: '20px',
    color: 'rgba(255, 255, 255, 1)',
    fontFamily: 'Ubuntu, sans-serif',
    textAlign: 'center',
  },
};

// Keyframes for logo animation
const floatKeyframes = `
  @keyframes floatAndRotate {
    0% {
      transform: translateY(0px) rotate(-2deg);
    }
    50% {
      transform: translateY(-10px) rotate(2deg);
    }
    100% {
      transform: translateY(0px) rotate(-2deg);
    }
  }
`;

// Inject style tag for logo animation
const styleTag = document.createElement('style');
styleTag.innerHTML = floatKeyframes;
document.head.appendChild(styleTag);