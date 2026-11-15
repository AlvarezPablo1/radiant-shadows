/** Agentes de Valorant: nombre y retrato (public/brand/agents, sacados de valorant-api.com) */
export const AGENTS: { id: string; name: string; role: string }[] = [
  { id: 'astra', name: 'Astra', role: 'Controlador' },
  { id: 'breach', name: 'Breach', role: 'Iniciador' },
  { id: 'brimstone', name: 'Brimstone', role: 'Controlador' },
  { id: 'chamber', name: 'Chamber', role: 'Centinela' },
  { id: 'clove', name: 'Clove', role: 'Controlador' },
  { id: 'cypher', name: 'Cypher', role: 'Centinela' },
  { id: 'deadlock', name: 'Deadlock', role: 'Centinela' },
  { id: 'fade', name: 'Fade', role: 'Iniciador' },
  { id: 'gekko', name: 'Gekko', role: 'Iniciador' },
  { id: 'harbor', name: 'Harbor', role: 'Controlador' },
  { id: 'hush', name: 'Hush', role: 'Duelista' },
  { id: 'iso', name: 'Iso', role: 'Duelista' },
  { id: 'jett', name: 'Jett', role: 'Duelista' },
  { id: 'kayo', name: 'KAY/O', role: 'Iniciador' },
  { id: 'killjoy', name: 'Killjoy', role: 'Centinela' },
  { id: 'miks', name: 'Miks', role: 'Controlador' },
  { id: 'neon', name: 'Neon', role: 'Duelista' },
  { id: 'omen', name: 'Omen', role: 'Controlador' },
  { id: 'phoenix', name: 'Phoenix', role: 'Duelista' },
  { id: 'raze', name: 'Raze', role: 'Duelista' },
  { id: 'reyna', name: 'Reyna', role: 'Duelista' },
  { id: 'sage', name: 'Sage', role: 'Centinela' },
  { id: 'skye', name: 'Skye', role: 'Iniciador' },
  { id: 'sova', name: 'Sova', role: 'Iniciador' },
  { id: 'tejo', name: 'Tejo', role: 'Iniciador' },
  { id: 'veto', name: 'Veto', role: 'Centinela' },
  { id: 'viper', name: 'Viper', role: 'Controlador' },
  { id: 'vyse', name: 'Vyse', role: 'Centinela' },
  { id: 'waylay', name: 'Waylay', role: 'Duelista' },
  { id: 'yoru', name: 'Yoru', role: 'Duelista' },
]

/** el agente a partir de lo cargado (acepta el nombre escrito a mano, sin importar mayúsculas ni signos) */
export function findAgent(v = '') {
  const k = v.toLowerCase().replace(/[^a-z0-9]/g, '')
  return k ? AGENTS.find((a) => a.id === k) : undefined
}
/** la versión difuminada (desenfoque gaussiano ya aplicado: se ve suave y parejo en cualquier tamaño y navegador) */
export const agentImage = (v?: string) => {
  const a = findAgent(v)
  return a ? `/brand/agents/${a.id}.webp` : undefined
}
