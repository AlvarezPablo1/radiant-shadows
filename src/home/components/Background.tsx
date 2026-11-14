/** Brasas con posiciones y tiempos al azar, calculadas una sola vez al cargar */
const EMBERS = Array.from({ length: 34 }, () => ({
  gold: Math.random() < 0.25,
  left: Math.random() * 100 + 'vw',
  top: 25 + Math.random() * 85 + 'vh',
  animationDuration: 6 + Math.random() * 8 + 's',
  animationDelay: -Math.random() * 12 + 's',
}))

/** Fondo de marca: hexágonos, silueta, neones, brasas, y texto lateral */
export function Background({ year }: { year: number }) {
  return (
    <>
      <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden bg-brand">
        <div className="absolute inset-[-10%] bg-hex opacity-16" />
        <img
          src="/brand/logos/rs-negative.png"
          alt=""
          className="absolute top-1/2 right-[-18vh] w-[min(110vh,1100px)] max-w-none -translate-y-1/2 opacity-[0.045] tint-violet"
        />
        <Neon className="top-[30%] animate-drift" />
        <Neon className="top-[78%] animate-drift-slow" />
        <div>
          {EMBERS.map(({ gold, ...style }, i) => (
            <i
              key={i}
              style={style}
              className={
                'absolute h-3 w-0.5 rotate-45 animate-rise rounded-xs opacity-0 ' +
                (gold
                  ? 'bg-[#ffd28a] shadow-[0_0_8px_var(--color-ember)]'
                  : 'bg-lilac shadow-[0_0_8px_var(--color-violet-hi)]')
              }
            />
          ))}
        </div>
        {/* velo oscuro encima de todo el fondo: lo apaga un poco para que resalte el contenido */}
        <div className="absolute inset-0 bg-night/35" />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-1/2 right-7.5 z-3 -translate-y-1/2 font-display text-[13px] tracking-[0.4em] whitespace-nowrap text-lilac/40 [writing-mode:vertical-rl] max-md:hidden"
      >
        RADIANT SHADOWS · VALORANT · TEMPORADA {year}
      </div>
    </>
  )
}

function Neon({ className }: { className: string }) {
  return <div className={'absolute left-[-10%] h-0.75 w-[120%] transform-[rotate(-7deg)] bg-[#f2e8ff] opacity-80 shadow-neon ' + className} />
}

