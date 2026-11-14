import type { LegalDoc } from '../data/legal'
import { Kicker } from './Kicker'
import { Modal } from './Modal'
import { Soon } from './Soon'

/** Modal de los textos legales del footer; por ahora sólo avisa que vienen pronto */
export function LegalModal({ doc, onClose }: { doc: LegalDoc | null; onClose: () => void }) {
  return (
    <Modal open={!!doc} onClose={onClose} labelledBy="legal-title" className="items-start gap-3.5">
      <Kicker>Legal</Kicker>
      <h2 id="legal-title" className="-mt-1.5 font-display text-[40px] leading-none tracking-[0.03em] max-sm:text-[32px]">
        {doc?.title}
      </h2>
      <p className="text-[15px] text-muted">Estamos preparando este documento. Muy pronto vas a poder leerlo acá.</p>
      <Soon className="mt-2" />
    </Modal>
  )
}
