import { cn } from '@/lib/utils'

type Props = {
  className?: string
}

export function BrandName({ className }: Props) {
  return (
    <span className={cn('font-display font-light tracking-[0.02em]', className)}>
      Falcone
    </span>
  )
}
