import { Kicker } from './Kicker'

/** Título de una sección de la home: kicker chico y título grande, centrados */
export function SectionHeading({ kicker, title, id }: { kicker: string; title: string; id?: string }) {
  return (
    <div className="text-center">
      <Kicker>{kicker}</Kicker>
      <h2 id={id} className="mt-2 font-brand-title text-[clamp(22px,2.5vw,35px)] text-white">
        {title}
      </h2>
    </div>
  )
}
