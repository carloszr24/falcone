export type TeamMember = {
  id: string
  name: string
  role: string
  tenure?: string | null
  initials: string
  /** Ruta en public, p. ej. /images/team/asesor.jpg */
  photo?: string | null
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'andres-falcone',
    name: 'Andrés Falcone',
    role: 'Director',
    tenure: null,
    initials: 'AF',
    photo: null,
  },
]

export const TEAM_QUOTE = {
  text: 'Conocemos Tarifa y su entorno. Escuchamos primero, informamos con claridad y acompañamos cada paso de la compraventa.',
  attribution: 'Andrés Falcone',
  role: 'Director',
} as const
