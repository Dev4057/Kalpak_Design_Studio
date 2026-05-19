import Image, { type ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

interface ImageWithLoaderProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  wrapperClassName?: string
}

export default function ImageWithLoader({ className, wrapperClassName, ...props }: ImageWithLoaderProps) {
  return (
    <div className={cn('relative overflow-hidden bg-warm-white', wrapperClassName)}>
      <Image
        {...props}
        className={cn('transition-opacity duration-500', className)}
      />
    </div>
  )
}
