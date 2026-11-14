import { Reveal } from '../ui/Reveal'
import { ActionButton } from '../../../shared/ui/ActionButton'

/** Llamado final: tryouts, sponsors o prensa, con el botón que abre el formulario de contacto */
export function JoinCta({ onContact }: { onContact: () => void }) {
  return (
    <Reveal label="Sumate" className="px-16 max-lg:px-10 max-md:px-4">
      <div className="relative overflow-hidden rounded-3xl border border-violet-hi/35 bg-[radial-gradient(ellipse_at_50%_0%,rgb(142_68_255/0.45),transparent_70%),linear-gradient(to_bottom,rgb(46_38_54/0.7),rgb(0_0_16/0.8))] px-10 py-16 text-center backdrop-blur-md max-md:px-6 max-md:py-12">
        <p className="font-display text-[15px] tracking-[0.3em] text-lilac">TRYOUTS · SPONSORS · PRENSA</p>
        <h2 className="mt-3 font-brand-title text-[clamp(24px,3.3vw,48px)] text-white">
          ¿QUERÉS SUMARTE AL FUEGO?
        </h2>
        <p className="mx-auto mt-4 max-w-140 text-[17px] leading-[1.55] text-body">
          Si querés jugar con nosotros, acompañarnos como marca o contar nuestra historia, escribinos.
        </p>
        <ActionButton onClick={onContact} className="mt-8">
          CONTACTANOS
        </ActionButton>
      </div>
    </Reveal>
  )
}
