import { createContext, useContext } from 'react'
import { DEFAULT_CONTENT, type Content } from '../../shared/content/content'

export const ContentContext = createContext<Content>(DEFAULT_CONTENT)

/** Contenido del sitio (lo editable desde /admin) */
export const useContent = () => useContext(ContentContext)
