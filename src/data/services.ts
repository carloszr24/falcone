export type ServiceItem = {
  title: string
  desc: string
  partner?: string
  partnerLogo?: string
}

/** Tarjetas principales — «Más que una inmobiliaria». */
export const PRIMARY_SERVICES: ServiceItem[] = [
  {
    title: 'Financiación 100%',
    desc: 'Le ayudamos a estudiar y gestionar opciones de financiación adaptadas a su operación, con un acompañamiento claro en cada fase.',
  },
  {
    title: 'Plusvalía',
    desc: 'Asesoramiento y gestión en materia de plusvalía municipal para que conozca sus obligaciones y plazos con total transparencia.',
  },
  {
    title: 'Cambio de titularidad de luz sin coste',
    desc: 'Tramitamos el cambio de titularidad del suministro eléctrico sin coste adicional, para que pueda entrar en su vivienda con menos preocupaciones.',
  },
  {
    title: 'Asesoramiento jurídico',
    desc: 'Orientación profesional en documentación, trámites notariales y registrales, con la máxima diligencia en cada operación.',
  },
]

/** Servicios clave de Falcone (compra, valoración y marketing). */
export const HOME_EXTRA_SERVICES: ServiceItem[] = [
  {
    title: 'Asesoramiento',
    desc: 'Al comprador: lo acompañamos en todo el proceso, desde la búsqueda del inmueble que desea hasta la finalización de la compra, asesorándolo en lo que necesite.',
  },
  {
    title: 'Propuesta de valor',
    desc: 'La experiencia de las últimas operaciones realizadas y propiedades ofrecidas en la zona dan como resultado el valor estimado para su propiedad, así como las distintas posibilidades de ofrecimiento o usos posibles.',
  },
  {
    title: 'Tasación e informe',
    desc: 'Al vendedor: su inmueble será valuado no solo teniendo en cuenta los parámetros tradicionales, sino también considerando su potencial.',
  },
  {
    title: 'Comunicación y marketing',
    desc: 'Para un servicio diferenciado, en marketing y comunicación contamos con las últimas herramientas tecnológicas, de diseño y difusión: websites, redes sociales y portales.',
  },
]

/** Menú de navegación — resumen de servicios. */
export const SERVICE_ITEMS: ServiceItem[] = [
  {
    title: 'Compra y venta',
    desc: 'Acompañamiento integral en operaciones de compraventa en Tarifa y la costa de Cádiz.',
  },
  ...HOME_EXTRA_SERVICES,
  {
    title: 'Alquiler',
    desc: 'Gestión de alquileres residenciales con acompañamiento en cada fase del proceso.',
  },
]
