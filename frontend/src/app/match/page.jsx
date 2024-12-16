'use client'
import { useEffect, useState } from 'react';
import PastelContainer from '../components/pastel';
import styles from './mystyles.module.css'
import { apiURL } from '../api';

function MatchupCard(props) {
  const playerStyle = (isWinner) => ({
    color: isWinner ? '#008800' : 'inherit',
    fontWeight: isWinner ? 'bold' : 'normal',
  });

  const handleWinnerSelect = async (playerId) => {
    if (!props.onWinnerSelect) return;
    
    try {
      await props.onWinnerSelect(playerId);
    } catch (error) {
      console.error('Error setting winner:', error);
    }
  };

  return (<div className={styles.tableCard}>
    <h3 className={styles.tableHeader}>{props.header}</h3>
    <div 
      className={`${styles.tablePlayerLabel} ${props.canSelectWinner ? styles.clickable : ''}`}
      style={playerStyle(props.winner === 1)}
      onClick={() => props.canSelectWinner && handleWinnerSelect(props.player1Id)}
    >
      {props.player1 || 'UNKNOWN'}
    </div>
    <p className={styles.versusLabel}>VS.</p>
    <div 
      className={`${styles.tablePlayerLabel} ${props.canSelectWinner ? styles.clickable : ''}`}
      style={playerStyle(props.winner === 2)}
      onClick={() => props.canSelectWinner && handleWinnerSelect(props.player2Id)}
    >
      {props.player2 || 'UNKNOWN'}
    </div>
  </div>)
}

function EventSection({ eventName, bracketId, eventId }) {
  const [matchups, setMatchups] = useState([]);
  const [completedMatchups, setCompletedMatchups] = useState({});
  const [round, setRound] = useState(1);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Check if user owns the event
    fetch(apiURL(`/api/event/${eventId}`), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        // Compare owner ID with current user ID from token
        fetch(apiURL('/api/user'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(userData => {
            setIsOwner(data.owner === userData.id);
          });
      })
      .catch(console.error);

    // Fetch both current and completed matchups
    Promise.all([
      fetch(apiURL(`/api/bracket/${bracketId}/matchups`)),
      fetch(apiURL(`/api/bracket/${bracketId}/completedMatchups`))
    ])
      .then(async ([currentRes, completedRes]) => {
        if (!currentRes.ok || !completedRes.ok) {
          throw new Error('Failed to fetch matchups');
        }
        return Promise.all([currentRes.json(), completedRes.json()]);
      })
      .then(async ([currentData, completedData]) => {
        const enrichedMatchups = await Promise.all(currentData.matchups.map(async matchup => {
          const [player1Data, player2Data] = await Promise.all([
            matchup.player1 ? fetch(apiURL(`/api/user/${matchup.player1}`)).then(r => r.json()) : null,
            matchup.player2 ? fetch(apiURL(`/api/user/${matchup.player2}`)).then(r => r.json()) : null
          ]);

          return {
            ...matchup,
            player1: player1Data?.username || 'UNKNOWN',
            player2: player2Data?.username || 'UNKNOWN',
            player1Id: matchup.player1,
            player2Id: matchup.player2
          };
        }));

        const enrichedCompleted = {};
        for (const [round, matches] of Object.entries(completedData.rounds)) {
          enrichedCompleted[round] = await Promise.all(matches.map(async matchup => {
            const [player1Data, player2Data] = await Promise.all([
              matchup.player1 ? fetch(apiURL(`/api/user/${matchup.player1}`)).then(r => r.json()) : null,
              matchup.player2 ? fetch(apiURL(`/api/user/${matchup.player2}`)).then(r => r.json()) : null
            ]);

            return {
              ...matchup,
              player1: player1Data?.username || 'UNKNOWN',
              player2: player2Data?.username || 'UNKNOWN',
              winner: matchup.winner === matchup.player1 ? 1 : 2
            };
          }));
        }

        setMatchups(enrichedMatchups);
        setCompletedMatchups(enrichedCompleted);
        setRound(currentData.round);
      })
      .catch(err => {
        console.error('Error fetching matchups:', err);
        setError(err.message);
      });
  }, [bracketId, eventId]);

  const handleWinnerSelect = async (matchIndex, winnerId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(
        apiURL(`/api/bracket/${bracketId}/matchups/${round}/${matchIndex}/winner`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ winner: winnerId })
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set winner');
      }

      // Refresh matchups after setting winner
      window.location.reload();
    } catch (error) {
      console.error('Error setting winner:', error);
      setError(error.message);
    }
  };

  if (error) {
    return (
      <div>
        <h2>{eventName}</h2>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.eventSection}>
      <h2 className={styles.eventTitle}>{eventName}</h2>
      <h3 className={styles.eventLabel}>Pending Matchups</h3>
      <div className={styles.cardContainer}>
        {matchups.map((matchup, i) => (
          <MatchupCard
            key={i}
            header={`Round ${round} - Match ${i + 1}`}
            player1={matchup.player1}
            player2={matchup.player2}
            player1Id={matchup.player1Id}
            player2Id={matchup.player2Id}
            canSelectWinner={isOwner}
            onWinnerSelect={(winnerId) => handleWinnerSelect(i, winnerId)}
          />
        ))}
      </div>
      <h3 className={styles.eventLabel}>Completed Matchups</h3>
      <div className={styles.cardContainer}>
        {Object.entries(completedMatchups).flatMap(([round, matches]) =>
          matches.map((matchup, i) => (
            <MatchupCard
              key={`${round}-${i}`}
              header={`Round ${round}`}
              player1={matchup.player1}
              player2={matchup.player2}
              winner={matchup.winner}
            />
          ))
        )}
      </div>
    </div>
  );
}

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
          console.log(event);
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
            />
          ))
        )}
      </div>

    </main>
  </PastelContainer>)
}