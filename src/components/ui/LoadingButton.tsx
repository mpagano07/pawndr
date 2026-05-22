'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  loadingLabel?: string
  isLoading?: boolean
  children?: React.ReactNode
  formAction?: (formData: FormData) => void | Promise<void>
}

export function LoadingButton({
  label,
  loadingLabel,
  isLoading = false,
  children,
  className,
  formAction,
  ...props
}: LoadingButtonProps) {
  const displayText = children || label
  const isLoadingState = isLoading || props.disabled

  return (
    <button
      {...props}
      formAction={formAction as never}
      disabled={isLoadingState || props.disabled}
      className={cn(
        'w-full py-3 mt-4 bg-primary text-primary-foreground font-bold rounded-xl',
        'hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(230,57,70,0.3)]',
        'flex items-center justify-center gap-2',
        'disabled:opacity-70 disabled:cursor-not-allowed',
        className
      )}
    >
      {isLoadingState ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{loadingLabel ?? displayText}</span>
        </>
      ) : (
        <span>{displayText}</span>
      )}
    </button>
  )
}
