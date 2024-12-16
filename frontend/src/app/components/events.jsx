'use client'
import { useEffect, useState } from 'react';
import styles from './events.module.css'
import { apiURL } from '../api';
import Link from 'next/link';

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
      {props.player1 || 'NOBODY'}
    </div>
    <p className={styles.versusLabel}>VS.</p>
    <div 
      className={`${styles.tablePlayerLabel} ${props.canSelectWinner ? styles.clickable : ''}`}
      style={playerStyle(props.winner === 2)}
      onClick={() => props.canSelectWinner && handleWinnerSelect(props.player2Id)}
    >
      {props.player2 || 'NOBODY'}
    </div>
  </div>)
}

export function EventSection({ eventName, bracketId, eventId, view = 'full' }) {
  const [matchups, setMatchups] = useState([]);
  const [completedMatchups, setCompletedMatchups] = useState({});
  const [round, setRound] = useState(1);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [newPlayer, setNewPlayer] = useState('');
  const [addPlayerError, setAddPlayerError] = useState('');
  const [eventDetails, setEventDetails] = useState(null);

  useEffect(() => {
    // Always fetch basic event details
    fetch(apiURL(`/api/event/${eventId}`))
      .then(res => res.json())
      .then(async data => {
        setEventDetails({
          ...data,
          playerCount: data.playerNum || 0,
          status: data.status || 'Upcoming',
          date: data.dateTime,
          description: data.description,
          location: data.location,
          maxPlayers: data.maxPlayers
        });
      })
      .catch(err => {
        console.error('Error fetching event details:', err);
        setError(err.message);
      });

    // Only fetch matchup data if we're showing the full view
    if (view === 'full') {
      const token = localStorage.getItem('token');
      if (token) {
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

        // Fetch both current and completed matchups using bracket endpoints
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
            // Enrich current matchups
            const enrichedMatchups = await Promise.all(currentData.matchups.map(async matchup => {
              const [player1Data, player2Data] = await Promise.all([
                matchup.player1 ? fetch(apiURL(`/api/user/${matchup.player1}`)).then(r => r.json()) : null,
                matchup.player2 ? fetch(apiURL(`/api/user/${matchup.player2}`)).then(r => r.json()) : null
              ]);

              return {
                ...matchup,
                player1: player1Data?.username || 'NOBODY',
                player2: player2Data?.username || 'NOBODY',
                player1Id: matchup.player1,
                player2Id: matchup.player2
              };
            }));

            // Enrich completed matchups
            const enrichedCompletedMatchups = {};
            for (const [round, matches] of Object.entries(completedData.rounds || {})) {
              enrichedCompletedMatchups[round] = await Promise.all(matches.map(async matchup => {
                const [player1Data, player2Data] = await Promise.all([
                  matchup.player1 ? fetch(apiURL(`/api/user/${matchup.player1}`)).then(r => r.json()) : null,
                  matchup.player2 ? fetch(apiURL(`/api/user/${matchup.player2}`)).then(r => r.json()) : null
                ]);

                return {
                  ...matchup,
                  player1: player1Data?.username || 'NOBODY',
                  player2: player2Data?.username || 'NOBODY',
                  player1Id: matchup.player1,
                  player2Id: matchup.player2
                };
              }));
            }

            setMatchups(enrichedMatchups);
            setCompletedMatchups(enrichedCompletedMatchups);
            setRound(currentData.round);
          })
          .catch(err => {
            console.error('Error fetching matchups:', err);
            setError(err.message);
          });
      }
    }
  }, [bracketId, eventId, view]);

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

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    setAddPlayerError('');
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // First validate the username exists
      const validateRes = await fetch(apiURL(`/api/user/validate/${newPlayer}`));
      const validateData = await validateRes.json();
      
      if (!validateData.exists) {
        setAddPlayerError('User does not exist');
        return;
      }

      // Add player to event using the correct endpoint
      const response = await fetch(
        apiURL(`/api/event/${eventId}/players`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ players: [newPlayer] }) // Note: API expects array of players
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add player');
      }

      // Clear input and refresh
      setNewPlayer('');
      window.location.reload();
    } catch (error) {
      console.error('Error adding player:', error);
      setAddPlayerError(error.message);
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

  if (!eventDetails) {
    return <div>Loading...</div>;
  }

  // Simple view for events listing page
  if (view === 'simple') {
    return (
      <div className={styles.eventSection}>
        <Link href={`/event/${eventId}`} className={styles.eventTitleLink}>
          <h2 className={styles.eventTitle}>{eventName}</h2>
        </Link>
        
        <div className={styles.eventDetails}>
          <p className={styles.eventLocation}>
            <strong>Location:</strong> {eventDetails.location || 'No location specified'}
          </p>
          
          <p className={styles.eventDescription}>
            <strong>Description:</strong> {eventDetails.description || 'No description available'}
          </p>
          
          <p className={styles.eventPlayers}>
            <strong>Max Players:</strong> {eventDetails.maxPlayers || '∞'}
          </p>

          <p className={styles.eventDate}>
            <strong>Date:</strong> {new Date(eventDetails.date).toLocaleDateString()}
          </p>

          <p className={styles.eventStatus}>
            <strong>Status:</strong> {eventDetails.status || 'Upcoming'}
          </p>
        </div>
      </div>
    );
  }

  console.log(matchups);

  // Full view for dedicated event page (original matchup view)
  return (
    <div className={styles.eventSection}>
      <h2 className={styles.eventTitle}>{eventName}</h2>
      
      {isOwner && (
        <form className={styles.addPlayerForm}>
          <input
            type="text"
            value={newPlayer}
            onChange={(e) => setNewPlayer(e.target.value)}
            placeholder="Enter username to add"
            className={styles.addPlayerInput}
          />
          <button type="submit" onClick={handleAddPlayer}>
            Add Player
          </button>
          {addPlayerError && (
            <p className={styles.error}>{addPlayerError}</p>
          )}
        </form>
      )}
      
      {matchups.filter(m => m.player1 !== 'NOBODY' && m.player2 !== 'NOBODY').length === 0 && 
       Object.values(completedMatchups).flat().length > 0 ? (
        <div className={styles.winnerAnnouncement}>
          <h3>🏆 Tournament Winner 🏆</h3>
          <p>{Object.values(completedMatchups)[Object.values(completedMatchups).length - 1][0].winner === 1 
              ? Object.values(completedMatchups)[Object.values(completedMatchups).length - 1][0].player1
              : Object.values(completedMatchups)[Object.values(completedMatchups).length - 1][0].player2}</p>
        </div>
      ) : (
        <>
          <h3 className={styles.eventLabel}>Pending Matchups</h3>
          <div className={styles.cardContainer}>
            {matchups
              .filter(matchup => matchup.player1 !== 'NOBODY' && matchup.player2 !== 'NOBODY')
              .map((matchup, i) => (
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
        </>
      )}

      <h3 className={styles.eventLabel}>Completed Matchups</h3>
      <div className={styles.cardContainer}>
        {Object.entries(completedMatchups).flatMap(([round, matches]) =>
          matches
            .filter(matchup => matchup.player1 !== 'NOBODY' && matchup.player2 !== 'NOBODY')
            .map((matchup, i) => (
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
