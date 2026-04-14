import { useState } from 'react'

export type Lang = 'en' | 'pt'

export function useLang() {
  const [lang, setLang] = useState<Lang>(() => {
    try { return (localStorage.getItem('defi_lang') as Lang) ?? 'en' } catch { return 'en' }
  })

  function toggleLang() {
    setLang(prev => {
      const next = prev === 'en' ? 'pt' : 'en'
      try { localStorage.setItem('defi_lang', next) } catch {}
      return next
    })
  }

  return { lang, toggleLang }
}
