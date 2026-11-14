/** Una sección del sitio. Si tiene `children`, en el nav es un desplegable y no una página propia. */
export interface Page {
  path: string
  label: string
  kicker: string
  title: string
  script: string
  text: string
  children?: Page[]
}
