import Image from 'next/image'
import Link from 'next/link'
import {
  HOME_EXTRA_SERVICES,
  PRIMARY_SERVICES,
  type ServiceItem,
} from '@/data/services'
import { TEAM_QUOTE } from '@/data/team'
import { HEADER_OFFSET_CLASS } from '@/lib/logo'

function ScaleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-5 w-5" aria-hidden="true">
      <path d="M12 3v18M5 7h14M7 7l-2 6h4l-2-6M17 7l-2 6h4l-2-6" />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-5 w-5" aria-hidden="true">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-5 w-5" aria-hidden="true">
      <path d="M3 11.25 12 4l9 7.25" />
      <path d="M5.25 10.5V20h13.5v-9.5" />
      <path d="M9.75 20v-5.5h4.5V20" />
    </svg>
  )
}

const primaryIcons = [ScaleIcon, ClipboardIcon]
const homeIcons = [HomeIcon, HomeIcon, HomeIcon, HomeIcon]

function ServiceCard({
  service,
  icon: Icon,
}: {
  service: ServiceItem
  icon?: typeof HomeIcon
}) {
  return (
    <div className="group border border-stone-200 bg-white p-8 transition-colors duration-300 hover:border-brand-burgundy/30">
      {service.partnerLogo ? (
        <div className="mb-6 flex h-12 items-center">
          <Image
            src={service.partnerLogo}
            alt={service.partner ?? service.title}
            width={160}
            height={48}
            className="h-10 w-auto max-w-[9.5rem] object-contain object-left"
          />
        </div>
      ) : Icon ? (
        <span className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-sm border border-stone-200 text-stone-600 transition-colors group-hover:border-brand-burgundy/30 group-hover:text-brand-burgundy">
          <Icon />
        </span>
      ) : null}
      <h3 className="mb-3 font-display text-[16px] md:text-[18px] font-extrabold text-stone-900 transition-colors group-hover:text-brand-burgundy">
        {service.title}
      </h3>
      <p className="text-sm font-light leading-relaxed text-stone-500">{service.desc}</p>
    </div>
  )
}

export default function SobreNosotrosPage() {
  return (
    <div className={HEADER_OFFSET_CLASS}>
      <section className="border-b border-stone-200 px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <nav className="mb-8 flex items-center gap-2 text-xs font-light text-stone-400">
            <Link href="/" className="transition-colors hover:text-stone-600">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-stone-600">Sobre nosotros</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="font-display text-[26px] font-extrabold leading-tight text-stone-900 md:text-[40px]">
              Una inmobiliaria construida sobre la confianza
            </h1>
            <p className="mt-6 text-base font-light leading-relaxed text-stone-500 md:text-lg">
              Acompañamos a familias y particulares en las decisiones más importantes de su vida. Sin prisa,
              sin presión, con la honestidad que cada cliente merece.
            </p>
          </div>

          <div className="my-14 h-px bg-stone-200" />

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
              <div className="absolute left-1/2 top-[52%] h-[128%] w-[128%] -translate-x-1/2 -translate-y-1/2">
                <Image
                  src="/images/tarifa-sobre-nosotros.png"
                  alt="Vista de Tarifa"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            <div className="lg:pt-4">
              <h2 className="font-display text-[20px] font-extrabold leading-snug text-stone-900 md:text-[24px]">
                Sobre nosotros
              </h2>
              <div className="mt-6 space-y-5 text-sm font-light leading-relaxed text-stone-600 md:text-base">
                <p>
                  Una tradición familiar que se ha transmitido de generación en generación, cimentada en
                  valores profundos y en un genuino compromiso con las personas. Desde nuestros inicios,
                  hemos entendido que el patrimonio inmobiliario no solo representa un activo material, sino
                  también un espacio donde se construyen sueños, memorias y proyectos de vida.
                </p>
                <p>
                  Nuestra principal motivación es ayudar. Ya sea facilitando la compra o venta de una
                  propiedad, asesorando en inversiones o encontrando el hogar ideal. Creemos que el verdadero
                  valor de nuestro trabajo radica en la capacidad de comprender las inquietudes de nuestros
                  clientes y acompañarlos en cada paso, con honestidad, dedicación y un trato cercano que
                  refleje el espíritu de servicio que nos define.
                </p>
                <p>Un legado de confianza, compromiso y pasión por el sector inmobiliario.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-stone-50 px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl space-y-20">
          <div>
            <div className="mb-10 max-w-2xl">
              <p className="mb-3 text-[10px] font-light uppercase tracking-[0.22em] text-brand-burgundy">
                Cómo trabajamos
              </p>
              <h2 className="font-display text-[26px] font-extrabold text-stone-900 md:text-[40px]">
                Asesoramiento, valoración y marketing
              </h2>
              <p className="mt-4 text-sm font-light leading-relaxed text-stone-500 md:text-base">
                Acompañamos a compradores y vendedores con un servicio completo, desde la búsqueda hasta la
                difusión de su propiedad.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {HOME_EXTRA_SERVICES.map((service, index) => (
                <ServiceCard key={service.title} service={service} icon={homeIcons[index] ?? HomeIcon} />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 text-[10px] font-light uppercase tracking-[0.22em] text-brand-burgundy">
                Más que una inmobiliaria
              </p>
              <h2 className="font-display text-[20px] font-extrabold text-stone-900 md:text-[24px]">
                Servicios inmobiliarios
              </h2>
              <p className="mt-4 text-sm font-light leading-relaxed text-stone-500">
                Plusvalía y asesoramiento jurídico con un trato cercano y profesional.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {PRIMARY_SERVICES.map((service, index) => (
                <ServiceCard key={service.title} service={service} icon={primaryIcons[index] ?? HomeIcon} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-stone-200 px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <blockquote className="border border-stone-200 bg-stone-50 px-8 py-10 md:px-12 md:py-12">
            <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-center md:text-left">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border border-stone-200 bg-stone-100 md:h-32 md:w-32">
                <Image src="/images/andres-falcone.jpg" alt={TEAM_QUOTE.attribution} fill className="object-cover object-top" sizes="128px" />
              </div>
              <div>
                <p className="font-display text-2xl font-light leading-relaxed text-stone-800 md:text-3xl">
                  “{TEAM_QUOTE.text}”
                </p>
                <footer className="mt-6 text-sm font-light text-stone-500">
                  {TEAM_QUOTE.attribution}
                  <span className="text-stone-400"> — {TEAM_QUOTE.role}</span>
                </footer>
              </div>
            </div>
          </blockquote>

          <div className="mt-20 flex flex-col items-start justify-between gap-6 border border-stone-200 bg-white p-8 md:flex-row md:items-center md:p-10">
            <div>
              <h3 className="font-display text-[19px] md:text-[22px] font-extrabold text-stone-900">¿Hablamos?</h3>
              <p className="mt-2 max-w-md text-sm font-light leading-relaxed text-stone-500">
                Cuéntenos qué necesita y le atenderemos.
              </p>
            </div>
            <Link
              href="/contacto"
              className="inline-flex shrink-0 items-center gap-2 border border-brand-burgundy px-8 py-3.5 font-display text-[10px] font-extrabold uppercase tracking-[0.14em] text-brand-burgundy transition-colors hover:bg-brand-burgundy hover:text-white"
            >
              Escríbanos
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
