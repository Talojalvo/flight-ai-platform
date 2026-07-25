import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface SceneBackgroundProps {
  src: string
  children?: ReactNode
}

export function SceneBackground({ src, children }: SceneBackgroundProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden'
      }}
    >
      {children}
    </motion.div>
  )
}
