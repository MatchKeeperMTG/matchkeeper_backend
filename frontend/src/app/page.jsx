'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AnimatedLogo from '@/app/components/logo'
import PastelContainer from './components/pastel'
import styles from './frontpage.module.css'

export default function HomePage() {
	return (
		<PastelContainer>
			<header>
				<h1>Matchkeeper</h1>
			</header>
			<main>
				<div className={styles.frontpageContainer}>
					<a href="/login"><button className={styles.frontpageLink}>Login</button></a>
					<a href="/register"><button className={styles.frontpageLink}>Register</button></a>
					<a href="/match"><button className={styles.frontpageLink}>Matches</button></a>
				</div>
			</main>
		</PastelContainer>
	)
}