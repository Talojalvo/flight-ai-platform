import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface PromptCardProps {
  title: string
  children: ReactNode
}

export function PromptCard({ title, children }: PromptCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="prompt-card"
    >
      {title && <h2>{title}</h2>}
      {children}
    </motion.div>
  )
}
