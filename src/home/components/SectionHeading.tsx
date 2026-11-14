import { Kicker } from './Kicker'

/** Título de una sección de la home: kicker chico y título grande, centrados */
export function SectionHeading({ kicker, title, id }: { kicker: string; title: string; id?: string }) {
  return (
    <div className="text-center">
      <Kicker>{kicker}</Kicker>
      <h2 id={id} className="mt-2 font-display text-[clamp(40px,4.5vw,64px)] leading-none tracking-[0.02em] text-white [text-shadow:3px_3px_0_var(--color-violet)]">
        {title}
      </h2>
    </div>
  )
}
