'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AnimatedLogo from '@/app/components/logo'
import VaporwaveContainer from '@/app/components/vaporwave'

export default function HomePage() {
	return (
		<VaporwaveContainer>
			<main>
				<p>Blah blah blah blah blah blah blah frontpage copy</p>
				<a href="/login">Login</a>
				<a href="/register">Register</a>
			</main>
		</VaporwaveContainer>
	)
}