'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiURL } from '../api'
import PastelContainer from '../components/pastel';

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
		<PastelContainer>
      <header>
        <h1>Register Account</h1>
      </header>

      <main>
        <form className="form-container">
          <input
            placeholder="Email"
            type="email"
            value={formData.userEmail}
            onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
          />

          <input
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />

          <input
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />

          <input
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />

          <input
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <input
            placeholder="Re-enter Password"
            type="password"
            value={formData.reEnterPassword}
            onChange={(e) => setFormData({ ...formData, reEnterPassword: e.target.value })}
          />

          {error && <div className="error">{error}</div>}

          <button type="submit">Register</button>

          <a href="/login">
            Already registered? Sign in!
          </a>
        </form>
      </main>
		</PastelContainer>
	)
}