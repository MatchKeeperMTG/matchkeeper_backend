'use client'
import CardViewer from "./card";
import { useEffect, useState, useCallback } from "react";

export default function CardSearch() {
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [focusedCard, setFocusedCard] = useState(0);

  const showDistance = 4;

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch cards when debounced search changes
  useEffect(() => {
    if (!debouncedSearch) {
      setCards([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetch('https://api.scryfall.com/cards/search?q=' + encodeURIComponent(debouncedSearch))
      .then(res => {
        if (!res.ok) throw new Error('Search failed');
        return res.json();
      })
      .then(json => {
        setCards(json.data);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [debouncedSearch]);

  return (
    <div className="min-h-screen p-8" onScroll={() => {
      setFocusedCard(focusedCard + 1);
      console.log("scroll")
    }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <input 
            type="text"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search for cards..."
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-2 text-gray-600">Searching cards...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && cards.length === 0 && debouncedSearch && (
          <div className="text-center py-8 text-gray-600">
            <p>No cards found. Try a different search term.</p>
          </div>
        )}

        {!isLoading && !error && cards.length === 0 && !debouncedSearch && (
          <div className="text-center py-8 text-gray-600">
            <p>Start typing to search for Magic cards</p>
          </div>
        )}

        {!isLoading && !error && cards.length > 0 && (
          <div className="deckContainer">
            {cards.map((card, i) => (
              (i >= focusedCard-showDistance && i <= focusedCard+showDistance) && <CardViewer 
                card={card}
                key={i}
                style={{ zIndex: i }} 
                className={"card-slide" + ((i == focusedCard) ? " cardFocus" : "")}
                onClick={() => {
                  setFocusedCard(i);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
