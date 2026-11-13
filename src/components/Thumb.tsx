import { useEffect, useState } from 'react'
import { resolveSrc } from '../lib/images'

export function Thumb({ src, alt = '', className }: { src?: string; alt?: string; className?: string }) {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    let alive = true
    if (!src) setUrl(undefined)
    else resolveSrc(src).then((u) => alive && setUrl(u))
    return () => {
      alive = false
    }
  }, [src])
  return url ? <img src={url} alt={alt} className={className} draggable={false} /> : <span className={'thumb-empty ' + (className ?? '')} />
}
