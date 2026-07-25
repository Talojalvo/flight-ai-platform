import { useEffect, useState } from 'react'

export function useAssetPreloader(urls: string[]): boolean {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loaders = urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const image = new Image()
          image.onload = () => resolve()
          image.onerror = () => resolve()
          image.src = url
        })
    )

    Promise.all(loaders).then(() => {
      if (!cancelled) {
        setIsReady(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [urls])

  return isReady
}
