'use client'

import * as React from 'react'
import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Locale, locales, localeNames } from '@/i18n/config'
import { useRouter, usePathname } from 'next/navigation'
import Cookies from 'js-cookie'

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentLocale, setCurrentLocale] = React.useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return (Cookies.get('NEXT_LOCALE') as Locale) || 'en'
    }
    return 'en'
  })

  const switchLanguage = (locale: Locale) => {
    setCurrentLocale(locale)
    Cookies.set('NEXT_LOCALE', locale, { expires: 365 })
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9">
          <Languages className="h-5 w-5" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLanguage(locale)}
            className={currentLocale === locale ? 'bg-accent' : ''}
          >
            {localeNames[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
