import { motion, type HTMLMotionProps } from 'framer-motion'

interface PixelSpriteProps extends HTMLMotionProps<'img'> {
  src: string
  alt: string
  widthPx: number | string
}

/**
 * Renders pixel art at a fixed width with height left to `auto`, so the
 * browser always derives height from the image's intrinsic aspect ratio
 * instead of a caller-supplied value that could stretch it.
 */
export function PixelSprite({ src, alt, widthPx, style, ...motionProps }: PixelSpriteProps) {
  return (
    <motion.img
      src={src}
      alt={alt}
      draggable={false}
      className="pixelated"
      style={{
        width: widthPx,
        height: 'auto',
        display: 'block',
        pointerEvents: 'none',
        ...style
      }}
      {...motionProps}
    />
  )
}
