'use client'
import { useEffect, useState, use } from 'react';
import PastelContainer from '../../components/pastel';
import styles from '../../events/mystyles.module.css'
import { apiURL } from '../../api';
import { EventSection } from '../../components/events';

export default function EventPage({ params }) {
  const { id } = use(params);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch single event with populated user data
    fetch(apiURL(`/api/event/${id}?populate=users`))
      .then(async res => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch event');
        }
        return res.json();
      })
      .then(eventData => {
        // Set event data including user information
        setEvent({
          _id: eventData._id,
          eventName: eventData.eventName,
          bracket: eventData.bracket?.[0], // Get first bracket ID
          users: eventData.users // Add users data
        });
      })
      .catch(err => {
        console.error('Error fetching event:', err);
        setError(err.message);
      });
  }, [id]);

  if (error) {
    return (<PastelContainer color="#880101" background="#fff">
      <header>
        <h1>Error</h1>
      </header>
      <main className={styles.content}>
        <p>{error}</p>
      </main>
    </PastelContainer>);
  }

  if (!event) {
    return (<PastelContainer color="#880101" background="#fff">
      <header>
        <h1>Loading...</h1>
      </header>
    </PastelContainer>);
  }

  return (<PastelContainer color="#880101" background="#fff">
    <header>
      <h1>Tournament Matches</h1>
    </header>

    <main className={styles.content}>
      <div className={styles.eventsContainer}>
        <EventSection
          eventId={event._id}
          eventName={event.eventName}
          bracketId={event.bracket}
          users={event.users}
        />
      </div>
    </main>
  </PastelContainer>);
}