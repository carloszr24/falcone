export const CONTACT_EMAIL = 'correo@falconepropiedades.com'

export const AGENT = {
  name: 'Falcone Propiedades',
  title: 'Agencia inmobiliaria',
  tagline:
    'Inmobiliaria en Tarifa. Te acompañamos en la compra y venta de tu vivienda con trato cercano y profesional.',
} as const

export const LEGAL = {
  ownerName: 'Falcone Propiedades',
  legalForm: 'autónomo',
  taxId: '',
  address: 'Urb. El Acebuche 8, 11380 Tarifa, Cádiz',
} as const

export const OFFICES = {
  primary: {
    label: 'Oficina',
    line1: 'Urb. El Acebuche 8',
    line2: '11380 Tarifa, Cádiz',
    full: 'Urb. El Acebuche 8, 11380 Tarifa, Cádiz',
    mapsQuery: 'Urb+El+Acebuche+8,+11380+Tarifa,+Cadiz',
  },
} as const

const contactEmail = (process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? CONTACT_EMAIL).trim()

export const CONTACT = {
  address: OFFICES.primary,
  offices: OFFICES,
  phone: {
    display: '627 13 63 16',
    e164: '+34627136316',
    wa: '34627136316',
    label: 'Teléfono',
  },
  email: contactEmail,
} as const

export const mapsHref = `https://maps.google.com/?q=${CONTACT.address.mapsQuery}`
export const phoneHref = `tel:${CONTACT.phone.e164}`
export const hasEmail = CONTACT.email.length > 0
export const emailHref = hasEmail ? `mailto:${CONTACT.email}` : ''
export const whatsappHref = `https://wa.me/${CONTACT.phone.wa}`
export const whatsappDisplay = `+34 ${CONTACT.phone.display}`
