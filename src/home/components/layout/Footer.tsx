import { Fragment } from 'react'
import { LEGAL_DOCS, type LegalDoc } from '../../data/legal'
import { SOCIALS } from '../../data/socials'
import { SocialIcon } from '../socials/SocialIcon'

/** Pie de página en una sola línea: años y legales a la izquierda, redes a la derecha */
export function Footer({ onLegal }: { onLegal: (doc: LegalDoc) => void }) {
  return (
    <footer className="relative z-2 bg-[#0a0a0c]">
      <div className="mx-auto max-w-page px-16 max-lg:px-10 max-md:px-4">
        <div className="flex items-center justify-between gap-6 border-t border-white/6 py-6 text-[13px] tracking-[0.02em] max-md:flex-col-reverse max-md:py-7 max-md:text-center">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[#8a8a92] max-md:flex-col">
            <span>2025 - 2026 Radiant Shadows</span>
            <nav aria-label="Legales" className="flex items-center gap-2.5 text-[#a5a5ad]">
              {LEGAL_DOCS.map((d, i) => (
                <Fragment key={d.id}>
                  {i > 0 && <span aria-hidden="true">·</span>}
                  <button type="button" onClick={() => onLegal(d)} className="cursor-pointer transition-colors duration-150 hover:text-white">
                    {d.label}
                  </button>
                </Fragment>
              ))}
            </nav>
          </div>

          <ul aria-label="Redes sociales" className="flex items-center gap-2">
            {SOCIALS.map((s) => (
              <li key={s.name}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.name}: ${s.handle} (se abre en otra pestaña)`}
                  title={s.name}
                  className="grid size-10 place-items-center rounded-full border border-white/8 bg-white/3 text-[#c8c8ce] transition-colors duration-150 hover:border-white/20 hover:bg-white/8 hover:text-white"
                >
                  <SocialIcon icon={s.icon} className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
