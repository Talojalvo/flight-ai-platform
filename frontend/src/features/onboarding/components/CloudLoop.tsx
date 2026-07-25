import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface CloudLoopProps {
  children: ReactNode
  travelVw?: number
  durationSeconds?: number
  delaySeconds?: number
  /** 'rtl' drifts right-to-left (default), 'ltr' drifts left-to-right. */
  direction?: 'rtl' | 'ltr'
  /**
   * When false, the loop stops and the cloud smoothly fades to fully
   * transparent instead of continuing to cycle — used to guarantee the
   * cloud is gone before a scene transition starts, rather than being cut
   * off mid-pass.
   */
  active?: boolean
}

/**
 * Continuously drifts a cloud sprite past a fixed anchor point, one
 * direction only (never reverses/ping-pongs). It fades in just after
 * entering its travel range and fades out just before leaving it, so the
 * instant reset back to the start happens while fully transparent — each
 * pass reads as a fresh cloud arriving rather than the same one snapping
 * back.
 */
export function CloudLoop({
  children,
  travelVw = 20,
  durationSeconds = 9,
  delaySeconds = 0,
  direction = 'rtl',
  active = true
}: CloudLoopProps) {
  const startX = direction === 'rtl' ? `${travelVw}vw` : `-${travelVw}vw`
  const endX = direction === 'rtl' ? `-${travelVw}vw` : `${travelVw}vw`

  if (!active) {
    return (
      <motion.div animate={{ opacity: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      animate={{
        x: [startX, endX],
        opacity: [0, 1, 1, 0]
      }}
      transition={{
        x: { duration: durationSeconds, delay: delaySeconds, ease: 'linear', repeat: Infinity, repeatType: 'loop' },
        opacity: {
          duration: durationSeconds,
          delay: delaySeconds,
          times: [0, 0.12, 0.88, 1],
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'linear'
        }
      }}
    >
      {children}
    </motion.div>
  )
}
