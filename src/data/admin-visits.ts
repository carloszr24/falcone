export type VisitChannel =
  | 'interesada'
  | 'llamada'
  | 'mail'
  | 'whatsapp'
  | 'visita_presencial'
  | 'referido'
  | 'seguimiento'

export type AdminVisit = {
  id: string
  propertyId: string
  contactName: string
  phone: string
  channel: VisitChannel
  summary: string
  notes: string
  occurredAt: string
  nextAction: string
}

export const VISIT_CHANNEL_LABELS: Record<VisitChannel, string> = {
  interesada: 'Interesada',
  llamada: 'Llamada',
  mail: 'Contacto por mail',
  whatsapp: 'WhatsApp',
  visita_presencial: 'Visita presencial',
  referido: 'Recomendación / referidos',
  seguimiento: 'Seguimiento',
}

export const ADMIN_VISITS: AdminVisit[] = [
  {
    id: 'v01',
    propertyId: 'piso-mar-rojo-tarifa',
    contactName: 'María López García',
    phone: '612 44 18 90',
    channel: 'llamada',
    summary: 'Primera llamada: pide fotos adicionales del salón y el baño reformado.',
    notes: 'Quedamos en enviarle dossier PDF el mismo día.',
    occurredAt: '2026-08-01T10:20:00.000Z',
    nextAction: 'Enviar dossier y proponer visita sábado',
  },
  {
    id: 'v02',
    propertyId: 'triplex-trafalgar-tarifa',
    contactName: 'Carlos Ruiz Benítez',
    phone: '655 22 09 41',
    channel: 'visita_presencial',
    summary: 'Visita al triplex con pareja. Muy interesados en terraza y garaje.',
    notes: 'Preguntaron por IBI y comunidad. Segunda visita pendiente.',
    occurredAt: '2026-08-03T16:00:00.000Z',
    nextAction: 'Confirmar segunda visita esta semana',
  },
  {
    id: 'v03',
    propertyId: 'piso-mar-rojo-tarifa',
    contactName: 'Javier Ortega Díaz',
    phone: '627 88 30 15',
    channel: 'mail',
    summary: 'Email pidiendo estimación de rentabilidad vacacional.',
    notes: 'Adjunto tabla orientativa de ocupación verano/invierno.',
    occurredAt: '2026-08-02T12:05:00.000Z',
    nextAction: 'Llamar en 48h para resolver dudas',
  },
  {
    id: 'v04',
    propertyId: 'piso-mar-rojo-tarifa',
    contactName: 'Pedro Sánchez Romero',
    phone: '633 90 12 64',
    channel: 'whatsapp',
    summary: 'WhatsApp: pregunta si admite alquiler vacacional y orientación sur-oeste.',
    notes: 'Confirmamos orientación y cercanía a Los Lances.',
    occurredAt: '2026-08-04T08:15:00.000Z',
    nextAction: 'Ofrecer visita entre semana',
  },
  {
    id: 'v05',
    propertyId: 'triplex-trafalgar-tarifa',
    contactName: 'Lucía Fernández Vega',
    phone: '649 21 88 03',
    channel: 'interesada',
    summary: 'Marcó interés alto tras ver el anuncio; pide cita con pareja.',
    notes: 'Horario preferente: tardes a partir de 18:00.',
    occurredAt: '2026-08-03T11:40:00.000Z',
    nextAction: 'Agendar visita conjunta',
  },
  {
    id: 'v06',
    propertyId: 'piso-mar-rojo-tarifa',
    contactName: 'Miguel Ángel Torres',
    phone: '670 55 41 18',
    channel: 'llamada',
    summary: 'Llamada de seguimiento: confirma interés si hay ascensor (sí).',
    notes: 'Quiere bajar la próxima semana desde Jerez.',
    occurredAt: '2026-07-31T15:05:00.000Z',
    nextAction: 'Reservar franja martes/miércoles',
  },
  {
    id: 'v07',
    propertyId: 'triplex-trafalgar-tarifa',
    contactName: 'Andrés Méndez Cruz',
    phone: '682 09 44 61',
    channel: 'referido',
    summary: 'Llega referido por un cliente que compró el año pasado.',
    notes: 'Muy enfocado en potencial de alquiler y vistas al mar.',
    occurredAt: '2026-08-02T19:20:00.000Z',
    nextAction: 'Preparar informe de valoración comercial',
  },
  {
    id: 'v08',
    propertyId: 'piso-mar-rojo-tarifa',
    contactName: 'Patricia Gómez León',
    phone: '658 14 26 70',
    channel: 'mail',
    summary: 'Contacto por mail desde Málaga; pide planos si existen.',
    notes: 'No hay planos oficiales; enviamos croquis aproximado.',
    occurredAt: '2026-07-29T08:50:00.000Z',
    nextAction: 'Seguimiento por mail el lunes',
  },
  {
    id: 'v09',
    propertyId: 'triplex-trafalgar-tarifa',
    contactName: 'Raúl Jiménez Ortiz',
    phone: '622 77 01 35',
    channel: 'visita_presencial',
    summary: 'Visita centrada en garaje de 30 m² y play room.',
    notes: 'Le preocupa no tener ascensor; lo valora vs precio.',
    occurredAt: '2026-08-01T17:10:00.000Z',
    nextAction: 'Enviar comparativa con otras opciones',
  },
  {
    id: 'v10',
    propertyId: 'piso-mar-rojo-tarifa',
    contactName: 'Isabel Romero Nieto',
    phone: '637 48 92 10',
    channel: 'llamada',
    summary: 'Llamada matinal: quiere ver el piso esta misma semana.',
    notes: 'Compra condicionada a venta de su piso en Algeciras.',
    occurredAt: '2026-08-04T09:30:00.000Z',
    nextAction: 'Confirmar visita jueves 11:00',
  },
  {
    id: 'v11',
    propertyId: 'triplex-trafalgar-tarifa',
    contactName: 'Nuria Campos Iglesias',
    phone: '609 35 21 48',
    channel: 'seguimiento',
    summary: 'Seguimiento tras comparar Mar Rojo y Trafalgar.',
    notes: 'Se inclina por Trafalgar por terraza y zona.',
    occurredAt: '2026-08-03T13:25:00.000Z',
    nextAction: 'Llamar tras el puente de agosto',
  },
  {
    id: 'v12',
    propertyId: 'piso-mar-rojo-tarifa',
    contactName: 'Helena Duarte Silva',
    phone: '618 90 45 22',
    channel: 'whatsapp',
    summary: 'Consulta por WhatsApp desde Lisboa; pide vídeo corto del hall.',
    notes: 'Turista habitual en Tarifa. Habla español e inglés.',
    occurredAt: '2026-07-30T21:10:00.000Z',
    nextAction: 'Enviar vídeo y enlace Idealista',
  },
  {
    id: 'v13',
    propertyId: 'triplex-trafalgar-tarifa',
    contactName: 'Francisco Morales',
    phone: '654 12 09 88',
    channel: 'interesada',
    summary: 'Alta interés tras open day informal con vecinos.',
    notes: 'Quiere saber si el precio es negociable.',
    occurredAt: '2026-07-27T12:40:00.000Z',
    nextAction: 'Consultar con propiedad margen de negociación',
  },
  {
    id: 'v14',
    propertyId: 'piso-mar-rojo-tarifa',
    contactName: 'Clara Espinosa Ruiz',
    phone: '676 33 50 01',
    channel: 'referido',
    summary: 'Referida por amiga que alquila en Los Lances.',
    notes: 'Busca entrada rápida; puede firmar reserva en 15 días.',
    occurredAt: '2026-08-02T10:00:00.000Z',
    nextAction: 'Proponer visita + reserva condicionada',
  },
  {
    id: 'v15',
    propertyId: 'triplex-trafalgar-tarifa',
    contactName: 'Diego Paredes Gómez',
    phone: '691 28 74 56',
    channel: 'llamada',
    summary: 'Llamada fría tras ver cartel en Calle Trafalgar.',
    notes: 'Preguntó superficie útil y si hay terraza apta para barbacoa.',
    occurredAt: '2026-07-25T19:35:00.000Z',
    nextAction: 'Invitar a visita el sábado',
  },
]
