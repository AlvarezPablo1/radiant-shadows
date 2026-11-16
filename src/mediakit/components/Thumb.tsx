import { useEffect, useState } from 'react'
import { resolveSrc } from '../lib/images'

export function Thumb({ src, alt = '', className }: { src?: string; alt?: string; className?: string }) {
  const [resolved, setResolved] = useState<{ src: string; url: string }>()
  useEffect(() => {
    if (!src) return
    let alive = true
    resolveSrc(src).then((url) => alive && setResolved({ src, url }))
    return () => {
      alive = false
    }
  }, [src])
  const url = src && resolved?.src === src ? resolved.url : undefined
  return url ? <img src={url} alt={alt} className={className} draggable={false} /> : <span className={'thumb-empty ' + (className ?? '')} />
}
