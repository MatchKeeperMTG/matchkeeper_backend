'use client'

import { useState } from 'react';
import CardViewer from '../components/card';
import PastelContainer from '../components/pastel';
import styles from './styles.module.css';

export default function BrowseCards() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSearch(event) {
        event.preventDefault();
        
        if (!searchTerm) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(
                `https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchTerm)}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch cards');
            }

            const data = await response.json();
            setSearchResults(data.data);
        } catch (err) {
            setError(err.message);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <PastelContainer>
            <header>
                <h1>Browse Cards</h1>
            </header>

            <main>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <input
                        type="text"
                        placeholder="Search for cards..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchButton}>
                        Search
                    </button>
                </form>

                {isLoading && (
                    <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-gray-300 border-t-blue-600"></div>
                        <p className="mt-2 text-gray-600">Searching cards...</p>
                    </div>
                )}

                {error && (
                    <div className="error">
                        {error}
                    </div>
                )}

                <div className={styles.cardGrid}>
                    {searchResults.map((card) => (
                        <div key={card.id} className={styles.cardContainer}>
                            <CardViewer
                                card={card}
                                className={styles.card}
                            />
                        </div>
                    ))}
                </div>
            </main>
        </PastelContainer>
    );
}
