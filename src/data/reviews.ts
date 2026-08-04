export type Review = {
  id: number
  name: string
  text: string
}

/** Reseñas genéricas de marca; sustituir por reseñas reales de clientes cuando estén disponibles. */
export const REVIEWS: Review[] = [
  {
    id: 1,
    name: 'Ana M.',
    text: 'Trato cercano y profesional desde el primer contacto. Nos ayudaron a encontrar piso cerca de la playa y resolvieron todas las dudas del proceso.',
  },
  {
    id: 2,
    name: 'Carlos R.',
    text: 'Muy recomendables. Transparencia en cada paso y una atención rápida tanto por teléfono como por WhatsApp.',
  },
  {
    id: 3,
    name: 'Laura G.',
    text: 'Vendimos nuestra vivienda en Tarifa con tranquilidad. Comunicación clara y seguimiento constante hasta la firma.',
  },
]
