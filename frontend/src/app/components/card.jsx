'use client'

import React, { useEffect, useState, useRef } from "react"

/**
 * A card fetched from Scryfall. If cardID is provided, it will fetch the card from Scryfall individually.
 * Otherwise, set `card` to a Scryfall card object to use a prefetched card.
 * Style can be overridden, as well as Z-index, HTML ID, and click events.
 * @param {{
 *   cardID?: string,
 *   card?: Object,
 *   style?: React.CSSProperties,
 *   className?: string,
 *   zIndex?: number,
 *   id?: string,
 *   onClick?: React.MouseEventHandler<HTMLImageElement>
 * }} props 
 */
export default function CardViewer(props) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        // If a full card object is provided, use it directly
        if (props.card) {
            setData(props.card);
            return;
        }

        // Otherwise, fetch by ID if provided
        if (props.cardID !== undefined) {
            setIsLoading(true);
            setError(null);

            fetch('https://api.scryfall.com/cards/' + props.cardID)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch card');
                    return res.json();
                })
                .then(json => {
                    if (!json.image_uris) {
                        throw new Error('Card image not found');
                    }
                    setData(json);
                })
                .catch(error => {
                    console.error(error);
                    setError(error.message);
                    setData(null);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [props.cardID, props.card]);

    if (isLoading) {
        return (
            <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-gray-300 border-t-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading card...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-4 text-red-600">
                <p>{error}</p>
            </div>
        );
    }

    if (!data || !data.image_uris) {
        return null;
    }

    return (
        <img
            ref={imgRef}
            src={data.image_uris.large}
            alt={data.name}
            id={props.id}
            className={"cardImage " + props.className}
            onMouseEnter={() => {
                setIsHovered(true);
            }}
            onMouseLeave={() => {
                setIsHovered(false);
            }}
            onClick={props.onClick}
            style={{zIndex: props.zIndex}}
        />
    );
}
