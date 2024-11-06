'use client'
import CardViewer from "./components/card";
import { useEffect, useState } from "react";

export default function Home() {
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('https://api.scryfall.com/cards/search?q=' + encodeURIComponent(search))
      .then(res => res.json())
      .then(json => {
        console.log(json);
        setCards(json.data);
      })
      .catch(err => console.error(err))
  }, [search]);

  return (
    <div>
      <input value={search} onChange={event => setSearch(event.target.value)} />
      <div className="deckContainer">
        {cards.map((card, i) => {
          return <CardViewer cardID={card.id} key={i} style={{ zIndex: i }} className="card-slide" />
        })}
      </div>
    </div>
  );
}
