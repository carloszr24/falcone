import Link from 'next/link'
import Image from 'next/image'
import { Property } from '@/types'
import { formatPrice, OPERATION_LABELS, parseImages, STATUS_BADGE_CLASSES, STATUS_LABELS, TYPE_LABELS } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
  variant?: 'default' | 'featuredMinimal'
  priority?: boolean
}

const statusColors = STATUS_BADGE_CLASSES

export function PropertyCard({ property, variant = 'default', priority = false }: PropertyCardProps) {
  const images = parseImages(property.images)
  const firstImage = images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
  const isFeaturedMinimal = variant === 'featuredMinimal'

  return (
    <Link href={`/propiedades/${property.id}`} className="group block">
      <article className="card-hover overflow-hidden bg-white border border-stone-100">
        {/* Image */}
        <div className={cn('relative overflow-hidden bg-stone-100', isFeaturedMinimal ? 'aspect-[3/4]' : 'aspect-[16/10]')}>
          <Image
            src={firstImage}
            alt={property.title}
            fill
            priority={priority}
            quality={75}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={isFeaturedMinimal ? '(max-width: 768px) 86vw, (max-width: 1024px) 68vw, 31vw' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          />
          {/* Status badge */}
          {!isFeaturedMinimal && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-100 transition-opacity duration-300" />
              <span className={cn(
                'absolute bottom-3 left-3 z-10 text-xs font-medium px-2.5 py-1 border',
                property.status !== 'vendido' && 'backdrop-blur-sm',
                statusColors[property.status] || statusColors.disponible
              )}>
                {STATUS_LABELS[property.status] || property.status}
              </span>
              {/* Image count */}
              {images.length > 1 && (
                <span className="absolute top-3 right-3 z-10 bg-black/50 text-white text-xs px-2 py-1 backdrop-blur-sm">
                  +{images.length} fotos
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-black/55 px-5 py-4 text-sm text-white backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
                Ver propiedad →
              </span>
            </>
          )}
        </div>

        {!isFeaturedMinimal && (
          <div className="md:hidden border-b border-stone-100 px-4 py-3">
            <span className="font-display text-2xl font-extrabold text-stone-900">
              {formatPrice(property.price, property.operation)}
            </span>
          </div>
        )}

        {/* Content */}
        <div className={cn('p-6', isFeaturedMinimal && 'p-4')}>
          <div className={cn('flex items-start justify-between gap-4', isFeaturedMinimal ? 'mb-4' : 'mb-3')}>
            <h3 className={cn(
              'font-medium text-stone-900 leading-snug line-clamp-2 group-hover:text-gold transition-colors',
              isFeaturedMinimal ? 'text-base' : 'text-lg'
            )}>
              {property.title}
            </h3>
          </div>

          {!isFeaturedMinimal && (
            <>
              <p className="text-sm text-stone-500 mb-5">
                {property.location}
              </p>

              {/* Stats */}
              {(property.sqMeters || property.bedrooms || property.bathrooms) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-[0.18em] text-stone-500 mb-5 pb-5 border-b border-stone-100">
                  {property.sqMeters && <span>{property.sqMeters} m²</span>}
                  {property.bedrooms != null && property.bedrooms > 0 && (
                    <span>{property.bedrooms} hab.</span>
                  )}
                  {property.bathrooms && <span>{property.bathrooms} baños</span>}
                  <span className="ml-auto text-[11px] bg-stone-100 px-2.5 py-1 text-stone-600 tracking-[0.12em] uppercase">
                    {TYPE_LABELS[property.type] || property.type}
                  </span>
                  <span className="text-[11px] bg-stone-100 px-2.5 py-1 text-stone-600 tracking-[0.12em] uppercase">
                    {OPERATION_LABELS[property.operation || 'venta'] || property.operation || 'Venta'}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Price */}
          <div
            className={cn(
              'flex items-center justify-between',
              isFeaturedMinimal ? 'pt-0' : 'hidden md:flex'
            )}
          >
            <span className="font-display text-2xl font-extrabold text-stone-900">
              {formatPrice(property.price, property.operation)}
            </span>
            {!isFeaturedMinimal && (
              <span className="text-xs uppercase tracking-[0.18em] text-gold group-hover:translate-x-1 transition-transform inline-block">
                Ver →
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

export function PropertyCardSkeleton() {
  return (
    <div className="bg-white border border-stone-100">
      <div className="skeleton aspect-[4/3]" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-6 w-1/3 mt-4" />
      </div>
    </div>
  )
}
