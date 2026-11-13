import './home.css'

/* Sitio público de Radiant Shadows. Por ahora cada sección muestra "Próximamente". */

interface Page {
  path: string
  label: string
  kicker: string
  title: string
  script: string
  text: string
}

const HOME: Page = {
  path: '/',
  label: 'Inicio',
  kicker: 'Esports · Valorant',
  title: 'RADIANT SHADOWS',
  script: 'el fuego sigue',
  text: 'Estamos preparando nuestra nueva casa. Muy pronto vas a poder conocer al equipo, nuestros rosters y todo lo que se viene.',
}

const SECTIONS: Page[] = [
  { path: '/quienes-somos', label: 'Quiénes somos', kicker: 'Radiant Shadows', title: 'QUIÉNES SOMOS', script: 'próximamente', text: 'Nuestra historia, nuestra forma de competir y la gente que mantiene vivo el fuego.' },
  { path: '/equipos', label: 'Nuestros equipos', kicker: 'Radiant Shadows', title: 'NUESTROS EQUIPOS', script: 'próximamente', text: 'Conocé a los dragones de MAIN y GC: jugadores, staff y su camino en cada competencia.' },
  { path: '/merch', label: 'Merch', kicker: 'Tienda oficial', title: 'MERCH', script: 'próximamente', text: 'La indumentaria oficial de los dragones está en camino. Camisetas, buzos y más.' },
  { path: '/logros', label: 'Logros', kicker: 'Radiant Shadows', title: 'LOGROS', script: 'próximamente', text: 'Cada copa, cada podio y cada partido que nos trajo hasta acá, todo en un solo lugar.' },
  { path: '/contacto', label: 'Contactanos', kicker: 'Hablemos', title: 'CONTACTANOS', script: 'próximamente', text: 'Muy pronto vas a poder escribirnos desde acá para sponsors, prensa o tryouts.' },
]

const path = location.pathname.replace(/\/+$/, '') || '/'
const page = SECTIONS.find((s) => s.path === path) ?? HOME
const year = new Date().getFullYear()

const link = (s: Page) => `<a href="${s.path}" class="nav-link${s.path === page.path ? ' active' : ''}${s.path === '/contacto' ? ' cta' : ''}"${s.path === page.path ? ' aria-current="page"' : ''}>${s.label}</a>`
const left = SECTIONS.slice(0, 3)
const right = SECTIONS.slice(3)

document.title = page === HOME ? 'Radiant Shadows · Esports de Valorant' : `${page.label} · Radiant Shadows`

document.getElementById('app')!.innerHTML = `
  <div class="bg" aria-hidden="true">
    <div class="hex"></div>
    <img class="silhouette" src="/brand/logos/rs-negative.png" alt="" />
    <div class="neon a"></div>
    <div class="neon b"></div>
    <div class="embers"></div>
  </div>
  <i class="corner tl" aria-hidden="true"></i><i class="corner tr" aria-hidden="true"></i>
  <i class="corner bl" aria-hidden="true"></i><i class="corner br" aria-hidden="true"></i>

  <header class="nav" id="nav">
    <nav class="nav-inner" aria-label="Principal">
      <div class="nav-side left">${left.map(link).join('')}</div>
      <a class="nav-logo" href="/" aria-label="Radiant Shadows — inicio">
        <img src="/brand/logos/rs-positive.png" alt="" />
      </a>
      <div class="nav-side right">${right.map(link).join('')}</div>
      <button class="burger" id="burger" aria-label="Abrir menú" aria-expanded="false" aria-controls="menu">
        <span></span><span></span>
      </button>
    </nav>
  </header>
  <div class="menu" id="menu" hidden>
    ${SECTIONS.map((s, i) => `<a href="${s.path}" class="menu-link${s.path === page.path ? ' active' : ''}" style="--i:${i}">${s.label}</a>`).join('')}
  </div>

  <main class="hero${page === HOME ? ' is-home' : ''}">
    <div class="hero-text">
      <span class="kicker">${page.kicker}</span>
      <h1>${page === HOME ? 'RADIANT<br /><span>SHADOWS</span>' : page.title}</h1>
      <span class="script">${page.script}</span>
      <p>${page.text}</p>
      <div class="soon"><i></i>Próximamente</div>
    </div>
    <div class="hero-art" aria-hidden="true">
      <img class="dragon" src="/brand/mascots/kael-dragon.png" alt="" />
    </div>
  </main>

  <footer class="foot">
    <span class="tags">#SomosDRAGONES · #ElFuegoSigue · #VamosDRAGONES</span>
    <span class="copy">RADIANT SHADOWS • ${year}</span>
  </footer>
  <div class="side" aria-hidden="true">RADIANT SHADOWS · VALORANT · TEMPORADA ${year}</div>
`

/* brasas flotando */
const embers = document.querySelector('.embers')!
for (let i = 0; i < 34; i++) {
  const e = document.createElement('i')
  e.className = 'ember' + (Math.random() < 0.25 ? ' gold' : '')
  e.style.left = Math.random() * 100 + 'vw'
  e.style.top = 25 + Math.random() * 85 + 'vh'
  e.style.animationDuration = 6 + Math.random() * 8 + 's'
  e.style.animationDelay = -Math.random() * 12 + 's'
  embers.appendChild(e)
}

/* menú en celular */
const burger = document.getElementById('burger')!
const menu = document.getElementById('menu')!
const nav = document.getElementById('nav')!
burger.addEventListener('click', () => {
  const open = menu.hidden === true
  menu.hidden = !open
  nav.classList.toggle('open', open)
  burger.setAttribute('aria-expanded', String(open))
  burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú')
  document.body.style.overflow = open ? 'hidden' : ''
})
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !menu.hidden) burger.click()
})

/* nav sólido al bajar */
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10)
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

/* el contenido entra cuando termina la animación del logo (o enseguida si no hay animación) */
const splash = document.getElementById('splash')
const reveal = () => {
  document.documentElement.classList.remove('splashing')
  document.body.classList.add('ready')
}
if (splash?.dataset.play !== undefined) {
  setTimeout(reveal, 1050)
  setTimeout(() => splash?.remove(), 1700)
} else requestAnimationFrame(reveal)
