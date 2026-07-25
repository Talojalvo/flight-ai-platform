import { useEffect, useState } from 'react'

export function useCyclingMessage(messages: string[], intervalMs = 2200): string {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % messages.length)
    }, intervalMs)

    return () => clearInterval(timer)
  }, [messages, intervalMs])

  return messages[index]
}
