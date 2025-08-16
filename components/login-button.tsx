'use client'

import * as React from 'react'
import { signIn } from 'next-auth/react'

import { type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { IconGoogle } from './ui/icons'

interface LoginButtonProps extends ButtonProps {
}

export function LoginButton({
  className,
  ...props
}: LoginButtonProps) {
  return (
    <button
      className={cn(
        'flex items-center justify-center gap-3 w-full bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-6 py-3 font-medium transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-slate-500',
        className
      )}
      onClick={() => {
        toast.loading(`Signing in ...`, {
          duration: 1000 * 60
        })
        signIn('google', {}, { prompt: 'login' })
      }}
      {...props}
    >
      <IconGoogle className="size-5" />
      <span>Continue with Google</span>
    </button>
  )
}
