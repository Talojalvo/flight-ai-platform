import type { CSSProperties, ReactNode } from 'react'

interface ScenePositionProps {
  top?: string
  left?: string
  right?: string
  bottom?: string
  widthPx: number | string
  zIndex?: number
  children: ReactNode
}

/**
 * Anchors a sprite within a scene. `widthPx` accepts either a fixed pixel
 * number or a responsive CSS length (e.g. "clamp(160px, 20vw, 420px)").
 * When `left` is given, the element is horizontally centered on that point
 * via calc(), so scene code can reason in simple "center of the plane is at
 * 58% across" terms regardless of whether the width itself is fluid.
 */
export function ScenePosition({ top, left, right, bottom, widthPx, zIndex, children }: ScenePositionProps) {
  const width = typeof widthPx === 'number' ? `${widthPx}px` : widthPx

  const style: CSSProperties = {
    position: 'absolute',
    top,
    left,
    right,
    bottom,
    width,
    marginLeft: left ? `calc(${width} / -2)` : undefined,
    zIndex
  }

  return <div style={style}>{children}</div>
}
