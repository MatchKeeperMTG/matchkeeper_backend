'use client'

import React, { useEffect, useState } from "react"

/**
 * 
 * @param {{cardID: string, style: React.CSSProperties, className: string}} props 
 */
export default function CardViewer(props) {
    const [data, setData] = useState(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        console.log('https://api.scryfall.com/cards/' + props.cardID);
        if (props.cardID !== undefined) {
            fetch('https://api.scryfall.com/cards/' + props.cardID)
                .then(res => res.json())
                .then(json => {
                    console.log(json);
                    setData(json);
                })
                .catch(error => {
                    console.log(data);

                    console.error(error);
                    setData(null);
                });
        }
    }, [props.cardID]);

    if (!data) {
        return (<div>Loading...</div>);
    } else {
        if (data.image_uris === undefined) {
            setData(null);
            return (<div>Error!</div>);
        }
        return (
            <img
                src={data.image_uris.normal}
                alt={data.name}
                className={"cardImage " + props.className}
                onMouseEnter={() => {
                    setIsHovered(true);
                }}
                onMouseLeave={() => {
                    setIsHovered(false);
                }}
                style={{zIndex: props.zIndex}}
            />
        );
    }
}