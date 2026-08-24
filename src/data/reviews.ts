export type Review = {
  id: number
  name: string
  text: string
  timeAgo: string
}

/** Reseñas reales de Google de clientes de Falcone Propiedades. */
export const REVIEWS: Review[] = [
  {
    id: 1,
    name: 'Eva Rodríguez',
    text: 'Profesional y trato excepcional. La gestión con Andrés ha sido simplemente perfecta. Con su acompañamiento todo ha sido realmente ágil y fácil. Gracias Andrés por tu dedicación.',
    timeAgo: 'Hace 2 meses',
  },
  {
    id: 2,
    name: 'dieguiloslances',
    text: 'Excelente experiencia en la compra de mi vivienda gracias a Andrés. Estuvo 100% pendiente y atento en todo momento, solucionando y mediando rápidamente cualquier problema con los trámites y el papeleo. Su implicación marca la diferencia. Totalmente recomendado.',
    timeAgo: 'Hace 3 meses',
  },
  {
    id: 3,
    name: 'vamores',
    text: 'Más de tres años intentando vender un inmueble sin éxito, hasta que conocimos a Andrés y en 2 meses lo conseguimos. Profesionalidad, seriedad, rigurosidad y disponibilidad. Totalmente recomendable. Muy contentas con la gestión.',
    timeAgo: 'Hace 6 meses',
  },
  {
    id: 4,
    name: 'Rosario Rodríguez Borrego',
    text: 'Andrés gran profesional, trato serio y cercano, eficiente. Totalmente recomendable. Sin duda volvería a contratar a su empresa.',
    timeAgo: 'Hace 2 meses',
  },
  {
    id: 5,
    name: 'Maria Luisa Saameño Calvo',
    text: 'He tenido una experiencia muy satisfactoria, un trato increíble y muy profesional, acompañándote en todos los pasos hasta terminar la operación con éxito. Un servicio altamente recomendable. Una relación muy familiar. Muchas gracias Andrés.',
    timeAgo: 'Hace 5 meses',
  },
  {
    id: 6,
    name: 'Wuilly Wonka',
    text: 'Un asesoramiento y seguimiento de 10, y el trato personal de Andrés muy humano y cercano, muchas gracias por todo.',
    timeAgo: 'Hace 2 meses',
  },
  {
    id: 7,
    name: 'Carmen Perez',
    text: 'Andrés es un excelente profesional. Me dio confianza desde el primer momento. Sin duda volvería a contratar sus servicios.',
    timeAgo: 'Hace 9 meses',
  },
  {
    id: 8,
    name: 'Juan Antonio Sales Martínez',
    text: 'Muy buena atención, nos asesoró muy bien, nos ayudó todo lo posible, muy atentos…',
    timeAgo: 'Hace un año',
  },
  {
    id: 9,
    name: 'rafa pg',
    text: 'Experiencia increíble, facilidad total y transparencia en el proceso de venta, gracias.',
    timeAgo: 'Hace un año',
  },
  {
    id: 10,
    name: 'Lola Rodríguez',
    text: 'Excelente profesional. Serio, muy formal y pendiente de todo el proceso de venta, desde el primer momento. Totalmente recomendable.',
    timeAgo: 'Hace 2 meses',
  },
]
