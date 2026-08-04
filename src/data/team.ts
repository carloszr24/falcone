export type TeamMember = {
  id: string
  name: string
  role: string
  tenure?: string | null
  initials: string
  /** Ruta en public, p. ej. /images/team/asesor.jpg */
  photo?: string | null
}

/** Placeholders listos para sustituir `photo` cuando tenga las imágenes del equipo. */
export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'equipo-falcone',
    name: 'Equipo Falcone',
    role: 'Asesoría inmobiliaria',
    tenure: null,
    initials: 'FP',
    photo: null,
  },
]

export const TEAM_QUOTE = {
  text: 'Conocemos Tarifa y su entorno. Escuchamos primero, informamos con claridad y acompañamos cada paso de la compraventa.',
  attribution: 'Falcone Propiedades',
  role: 'Tarifa',
} as const
