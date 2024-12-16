'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AnimatedLogo from '@/app/components/logo'
import PastelContainer from './components/pastel'
import styles from './frontpage.module.css'

export default function HomePage() {
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const router = useRouter()

	useEffect(() => {
		// Check if token exists in localStorage
		const token = localStorage.getItem('token')
		setIsLoggedIn(!!token)
	}, [])

	const handleLogout = () => {
		localStorage.removeItem('token')
		setIsLoggedIn(false)
		router.refresh()
	}

	return (
		<PastelContainer>
			<header>
				<h1>Matchkeeper</h1>
			</header>
			<main>
				<div className={styles.frontpageContainer}>
					{!isLoggedIn ? (
						<>
							<a href="/login"><button className={styles.frontpageLink}>Login</button></a>
							<a href="/register"><button className={styles.frontpageLink}>Register</button></a>
						</>
					) : (
						<>
							<a href="/events"><button className={styles.frontpageLink}>Matches</button></a>
							<a href="/createEvent"><button className={styles.frontpageLink}>Create Match</button></a>
							<a href="/browseCards"><button className={styles.frontpageLink}>Browse Cards</button></a>
							<a href="#"><button onClick={handleLogout} className={styles.frontpageLink}>Logout</button></a>
						</>
					)}
				</div>
			</main>
		</PastelContainer>
	)
}