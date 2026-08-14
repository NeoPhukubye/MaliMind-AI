import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { languages } from '../../i18n'

export default function LanguageSelector() {
  const { i18n, t } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-500" />
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="text-sm bg-transparent border border-gray-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label={t('languageSelector.label')}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  )
}
