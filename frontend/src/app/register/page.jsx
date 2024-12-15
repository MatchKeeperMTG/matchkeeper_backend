'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiURL } from '../api'
import AnimatedLogo from '../components/logo'

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    userEmail: '',
    password: '',
    reEnterPassword: ''
  });
  const [error, setError] = useState('');

  async function registerAccount() {
    // Validate fields
    if (!formData.username || !formData.firstName || !formData.lastName || 
        !formData.userEmail || !formData.password || !formData.reEnterPassword) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.reEnterPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(apiURL('/api/user'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          userEmail: formData.userEmail,
          password: formData.password
        })
      });

      const data = await response.json()

      if (response.ok) {
        // Store token and redirect to home
        localStorage.setItem('token', data.token);
        router.push('/');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentContainer}>
        <AnimatedLogo style={styles.logo} />
        
        <div style={styles.headerText}>
          Register Account
        </div>
        
        <form style={styles.form} onSubmit={(e) => { e.preventDefault(); registerAccount(); }}>
          <input 
            style={styles.inputBox}
            placeholder="Email"
            type="email"
            value={formData.userEmail}
            onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
          />

          <input 
            style={styles.inputBox}
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />

          <input 
            style={styles.inputBox}
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
          />

          <input 
            style={styles.inputBox}
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
          />

          <input 
            style={styles.inputBox}
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />

          <input 
            style={styles.inputBox}
            placeholder="Re-enter Password"
            type="password"
            value={formData.reEnterPassword}
            onChange={(e) => setFormData({...formData, reEnterPassword: e.target.value})}
          />

          {error && <div style={styles.errorText}>{error}</div>}

          <button type="submit" style={styles.loginButton}>
            <div style={styles.loginText}>Register</div>
          </button>
          
          <a href="/" style={styles.labelText}>
            Already registered? Sign in!
          </a>
        </form>
      </div>
    </div>
  )
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
    textShadow: '0px 3px 3px black'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    width: '100%'
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
  errorText: {
    color: '#ffffff',
    fontSize: '16px',
    fontFamily: 'Ubuntu, sans-serif',
    textAlign: 'center',
    textShadow: '0px 2px 2px #9e0000'
  },
  loginButton: {
    backgroundColor: '#7300ff',
    padding: '5px',
    borderRadius: '10px',
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
  labelText: {
    fontSize: '20px',
    color: '#FFFFFF',
    fontFamily: 'Ubuntu, sans-serif',
    textAlign: 'center',
    textShadow: '0px 2px 4px #7300ff'
  }
};