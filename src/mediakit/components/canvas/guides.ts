export interface Guides {
  /** margen como % del lado corto */
  margin: number
  rows: number
  cols: number
  center: boolean
  snap: boolean
}

/** líneas de guía (en coordenadas del diseño) */
export function guideLines(g: Guides, w: number, h: number) {
  const m = (Math.min(w, h) * g.margin) / 100
  const xs = [m, w - m]
  const ys = [m, h - m]
  if (g.center) {
    xs.push(w / 2)
    ys.push(h / 2)
  }
  for (let i = 1; i < g.cols; i++) xs.push(m + ((w - 2 * m) * i) / g.cols)
  for (let i = 1; i < g.rows; i++) ys.push(m + ((h - 2 * m) * i) / g.rows)
  return { xs, ys, m }
}
