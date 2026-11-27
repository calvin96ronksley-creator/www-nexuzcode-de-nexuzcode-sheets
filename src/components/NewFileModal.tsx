import { FormEvent, useEffect, useState } from 'react';
import { FilePlus2, X } from 'lucide-react';
import { SupportedLanguage } from '../types/sheets';
import {
  LANGUAGE_META,
  detectLanguageFromFilename,
  getTemplateContent,
} from '../utils/languageUtils';

interface NewFileModalProps {
  isOpen: boolean;
  existingNames: string[];
  onClose: () => void;
  onCreate: (name: string, language: SupportedLanguage, content: string) => void;
}

const LANGUAGES = Object.keys(LANGUAGE_META) as SupportedLanguage[];

export function NewFileModal({
  isOpen,
  existingNames,
  onClose,
  onCreate,
}: NewFileModalProps) {
  const [filename, setFilename] = useState('modul.ts');
  const [language, setLanguage] = useState<SupportedLanguage>('typescript');
  const [useTemplate, setUseTemplate] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFilename('modul.ts');
      setLanguage('typescript');
      setUseTemplate(true);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFilenameChange = (val: string) => {
    setFilename(val);
    setError(null);
    if (val.includes('.')) {
      setLanguage(detectLanguageFromFilename(val));
    }
  };

  const handleLanguageChange = (nextLang: SupportedLanguage) => {
    setLanguage(nextLang);
    const meta = LANGUAGE_META[nextLang];
    const baseName = filename.trim().replace(/\.[^/.]+$/, '') || 'sheet';
    setFilename(`${baseName}${meta.ext}`);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    let finalName = filename.trim();
    if (!finalName) {
      setError('Bitte einen gültigen Dateinamen eingeben.');
      return;
    }
    if (!finalName.includes('.')) {
      finalName = `${finalName}${LANGUAGE_META[language].ext}`;
    }
    if (existingNames.some((n) => n.toLowerCase() === finalName.toLowerCase())) {
      setError(`Eine Datei mit dem Namen "${finalName}" existiert bereits im Workspace.`);
      return;
    }

    const content = useTemplate ? getTemplateContent(language, finalName) : '';
    onCreate(finalName, language, content);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-file-title"
    >
      <div className="w-full max-w-md rounded-xl border border-cyan-500/30 bg-[#0b101b] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <FilePlus2 className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            <h2 id="new-file-title" className="font-display text-lg font-semibold text-slate-100">
              Neue Datei erstellen
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
            aria-label="Dialog schließen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="sheet-filename" className="block text-xs font-medium text-slate-300">
              Dateiname
            </label>
            <input
              id="sheet-filename"
              type="text"
              value={filename}
              onChange={(e) => handleFilenameChange(e.target.value)}
              placeholder="z. B. service.ts oder config.json"
              autoFocus
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#06080d] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="sheet-language" className="block text-xs font-medium text-slate-300">
              Syntax-Modus
            </label>
            <select
              id="sheet-language"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#06080d] px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {LANGUAGE_META[lang].label} ({LANGUAGE_META[lang].ext})
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 pt-1 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={useTemplate}
              onChange={(e) => setUseTemplate(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-[#06080d] accent-cyan-400"
            />
            <span>Mit passender Starter-Vorlage initialisieren</span>
          </label>

          {error && (
            <p className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs text-rose-300">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-800/80 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="whitespace-nowrap rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="whitespace-nowrap rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
            >
              Datei anlegen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
