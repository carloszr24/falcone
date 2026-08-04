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

/** Servicios con colaboradores externos. */
export const PARTNER_SERVICES: ServiceItem[] = [
  {
    title: 'Cambios de titularidad',
    desc: 'Gestión de cambios de titularidad de suministros energéticos con el respaldo de Iberdrola.',
    partner: 'Iberdrola',
    partnerLogo: '/images/iberdrola.webp',
  },
  {
    title: 'Contratación de alarmas',
    desc: 'Asesoramiento y contratación de sistemas de alarma para su vivienda con Securitas Direct.',
    partner: 'Securitas Direct',
    partnerLogo: '/images/securitas.png',
  },
]

/** Montaje y mantenimiento del hogar. */
export const HOME_EXTRA_SERVICES: ServiceItem[] = [
  {
    title: 'Mamparas de baño',
    desc: 'Instalación y asesoramiento en mamparas de baño para ganar confort y funcionalidad en su hogar.',
  },
  {
    title: 'Persianas',
    desc: 'Suministro e instalación de persianas con acabados adaptados a las necesidades de su vivienda.',
  },
  {
    title: 'Mosquiteras',
    desc: 'Soluciones de mosquiteras a medida para disfrutar del exterior con mayor comodidad.',
  },
  {
    title: 'Otros servicios',
    desc: 'Montaje y mantenimiento adicional del hogar. Consúltenos y le orientamos según su caso.',
  },
]

/** Menú de navegación — resumen de servicios. */
export const SERVICE_ITEMS: ServiceItem[] = [
  {
    title: 'Compra y venta',
    desc: 'Acompañamiento integral en operaciones de compraventa en Tarifa y la costa de Cádiz.',
  },
  ...PRIMARY_SERVICES,
  {
    title: 'Alquiler',
    desc: 'Gestión de alquileres residenciales con acompañamiento en cada fase del proceso.',
  },
]
