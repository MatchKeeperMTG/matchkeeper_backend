'use client'
import { useState } from "react"
import CardSearch from "./components/card_search"

export default function Home() {
    const [selectedCard, setSelectedCard] = useState(null);

    return (
        <div>
            {(selectedCard && <p>You selected {selectedCard.name}!</p>)}
            <CardSearch onCardSelected={setSelectedCard} selectedCard={selectedCard}/>
        </div>   
    )
}