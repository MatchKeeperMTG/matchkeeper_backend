'use client'
import { useEffect, useState } from 'react';
import PastelContainer from '../components/pastel';
import styles from './mystyles.module.css'
import { apiURL } from '../api';
import { EventSection } from '../components/events';

export default function MatchPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all events
    fetch(apiURL('/api/event'))
      .then(async res => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch events');
        }
        return res.json();
      })
      .then(data => {
        // Filter to only events with brackets
        return Promise.all(data.data.map(async event => {
          // console.log(event);
          const eventDetails = await fetch(apiURL(`/api/event/${event._id}`)).then(r => r.json());
          return {
            ...event,
            bracket: eventDetails.bracket?.[0] // Get first bracket ID
          };
        }));
      })
      .then(eventsWithBrackets => {
        setEvents(eventsWithBrackets.filter(e => e.bracket)); // Only keep events with brackets
      })
      .catch(err => {
        console.error('Error fetching events:', err);
        setError(err.message);
      });
  }, []);

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

  return (<PastelContainer color="#880101" background="#fff">
    <header>
      <h1>Tournament Matches</h1>
    </header>

    <main className={styles.content}>
      <div className={styles.eventsContainer}>
        {events.length === 0 ? (
          <p>No active tournaments found.</p>
        ) : (
          events.map(event => (
            <EventSection
              key={event._id}
              eventId={event._id}
              eventName={event.eventName}
              bracketId={event.bracket}
              view="simple"
            />
          ))
        )}
      </div>

    </main>
  </PastelContainer>)
}