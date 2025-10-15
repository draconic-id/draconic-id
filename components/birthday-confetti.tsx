"use client"

import { useEffect } from "react"
import confetti from "canvas-confetti"

interface BirthdayConfettiProps {
  birthDate?: string // ISO date string from the database
}

export function BirthdayConfetti({ birthDate }: BirthdayConfettiProps) {
  useEffect(() => {
    if (!birthDate) return

    const now = new Date()
    const bday = new Date(birthDate)

    // Compare month/day only (ignore year)
    const isBirthday =
      now.getMonth() === bday.getMonth() && now.getDate() === bday.getDate()

    if (!isBirthday) return

    // 3-second confetti burst
    const end = Date.now() + 1 * 1000

    // colors (only 2 supported)
    const colors = [
      "#6ecbff", // sky blue
      "#ffd166", // soft yellow
    ]

    const frame = () => {
      if (Date.now() > end) return
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors,
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors,
      })
      requestAnimationFrame(frame)
    }

    frame()
  }, [birthDate])

  return null // nothing to render, just side effect
}