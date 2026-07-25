import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface FloatingLoopProps {
  children: ReactNode
  amplitudePx?: number
  durationSeconds?: number
  delaySeconds?: number
}

/**
 * Wraps a sprite in a gentle, infinite up/down drift (a few pixels only,
 * no rotation, no bounce) used for the idle state of scene entities.
 */
export function FloatingLoop({
  children,
  amplitudePx = 6,
  durationSeconds = 3.5,
  delaySeconds = 0
}: FloatingLoopProps) {
  return (
    <motion.div
      animate={{ y: [0, -amplitudePx, 0] }}
      transition={{
        duration: durationSeconds,
        delay: delaySeconds,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  )
}
