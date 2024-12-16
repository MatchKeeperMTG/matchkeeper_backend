'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PastelContainer from "../components/pastel";
import styles from './styles.module.css';
import { apiURL } from '../api';

export default function CreateEvent() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        eventName: '',
        location: '',
        description: '',
        maxPlayers: '',
        dateTime: ''
    });
    const [error, setError] = useState('');

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            // First, create the event
            const eventResponse = await fetch(apiURL('/api/event'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    eventName: formData.eventName,
                    location: formData.location,
                    description: formData.description,
                    maxPlayers: parseInt(formData.maxPlayers),
                    dateTime: formData.dateTime
                })
            });

            const eventData = await eventResponse.json();

            if (!eventResponse.ok) {
                throw new Error(eventData.error || 'Failed to create event');
            }

            // Then, create the bracket
            const bracketResponse = await fetch(apiURL('/api/bracket'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    event: eventData.id,
                    maxPlayers: parseInt(formData.maxPlayers)
                })
            });

            const bracketData = await bracketResponse.json();

            if (!bracketResponse.ok) {
                throw new Error(bracketData.error || 'Failed to create bracket');
            }

            // Redirect to the event page
            router.push(`/event/${eventData.id}`);

        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <PastelContainer>
            <header>
                <h1>Create Event</h1>
            </header>

            <main>
                <form onSubmit={handleSubmit}>
                    <input
                        placeholder="Event Name"
                        value={formData.eventName}
                        onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                        required
                    />
                    <input
                        placeholder="Location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                    />
                    <input
                        placeholder="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <input
                        placeholder="Max Players"
                        type="number"
                        value={formData.maxPlayers}
                        onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
                        required
                    />
                    <input
                        placeholder="Date and Time"
                        type="datetime-local"
                        value={formData.dateTime}
                        onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                        required
                    />

                    {error && <div className="error">{error}</div>}

                    <button type="submit">Create Event</button>
                </form>
            </main>
        </PastelContainer>
    );
}