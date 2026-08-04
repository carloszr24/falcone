import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  LOGO_FOOTER_CLASS,
  LOGO_FOOTER_HEIGHT_CLASS,
  LOGO_HEADER_HEIGHT_CLASS,
  LOGO_IMAGE_CLASS,
  LOGO_RENDER,
  LOGO_SRC,
  type LogoTone,
} from '@/lib/logo'
import { AGENT } from '@/lib/contact'

type Props = {
  className?: string
  variant?: 'header' | 'footer'
  /** Kept for Navbar API compatibility; logo always sits on a white plate. */
  tone?: LogoTone
  priority?: boolean
}

export function SiteLogo({ className, variant = 'header', priority = false }: Props) {
  const isFooter = variant === 'footer'
  const imageClass = isFooter ? LOGO_FOOTER_CLASS : LOGO_IMAGE_CLASS
  const sizes = isFooter ? '180px' : '(max-width: 768px) 140px, 180px'

  return (
    <span
      role="img"
      aria-label={AGENT.name}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5',
        'px-2.5 py-1.5',
        isFooter ? LOGO_FOOTER_HEIGHT_CLASS : LOGO_HEADER_HEIGHT_CLASS,
        className
      )}
    >
      <Image
        src={LOGO_SRC}
        alt=""
        aria-hidden
        width={LOGO_RENDER.width}
        height={LOGO_RENDER.height}
        sizes={sizes}
        priority={priority}
        className={cn(imageClass, 'bg-white')}
      />
    </span>
  )
}
