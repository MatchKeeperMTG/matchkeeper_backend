'use client'
import CardViewer from "./card";
import { useEffect, useState, useCallback } from "react";

/**
 * 
 * @param {{
 *  selectedCard: object?,
 *  onCardSelected: (object) => void 
 * }} props 
 */
export default function CardSearch(props) {
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  let onCardSelected = props.onCardSelected;

  if(!onCardSelected) {
    onCardSelected = (_) => {};
  }
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const cardsPerPage = 5;

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      // Reset pagination when search changes
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch cards when debounced search or page changes
  useEffect(() => {
    if (!debouncedSearch) {
      setCards([]);
      setTotalPages(0);
      onCardSelected(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Construct URL with pagination parameters
    const url = new URL('https://api.scryfall.com/cards/search');
    url.searchParams.set('q', debouncedSearch);

    fetch(url.toString())
      .then(res => {
        if (res.status == 404) return {"data": []};
        if (!res.ok) throw new Error('Search failed');
        return res.json();
      })
      .then(json => {
        setCards(json.data);
        // Calculate total pages based on total cards
        setTotalPages(Math.ceil(json.total_cards / cardsPerPage));
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
        onCardSelected(null);
      });
  }, [debouncedSearch, currentPage]);

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  console.log(cards.slice(cardsPerPage*(currentPage-1), cardsPerPage*(currentPage)));

  const visibleCards = cards.slice(cardsPerPage*(currentPage-1), cardsPerPage*(currentPage));

  return (
    <div className="min-h-screen p-8">
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
          <>
            <div className="deckContainer">
              {visibleCards.map((card, i) =>
                <CardViewer 
                  card={card}
                  key={card.id || i}
                  style={{ zIndex: i }} 
                  className={"card-slide" + ((props.selectedCard && props.selectedCard.id == card.id) ? " cardFocus" : "")}
                  onClick={() => {
                    onCardSelected(card)
                  }}
                />
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-8 space-x-4">
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
