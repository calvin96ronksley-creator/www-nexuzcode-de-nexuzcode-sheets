import { useState } from 'react';
import { BookOpen, Download, FileCode2, Scale, X } from 'lucide-react';
import {
  ALPHABET_CODENAME_ROADMAP,
  GPLV3_FRAMEWORK_SUMMARY,
  PROJECT_IDENTITY,
  RELEASE_CYCLE_RULES,
  generateCodexMarkdown,
} from '../data/aetherCodex';
import { downloadFileToDisk } from '../utils/languageUtils';

interface AetherCodexModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInEditor: (filename: string, content: string) => void;
}

type CodexTab = 'overview' | 'releases' | 'legal';

export function AetherCodexModal({
  isOpen,
  onClose,
  onOpenInEditor,
}: AetherCodexModalProps) {
  const [activeTab, setActiveTab] = useState<CodexTab>('overview');

  if (!isOpen) return null;

  const handleExportMarkdown = () => {
    downloadFileToDisk('AETHER-CODEX.md', generateCodexMarkdown());
  };

  const handleLoadIntoEditor = () => {
    onOpenInEditor('AETHER-CODEX.md', generateCodexMarkdown());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="codex-title"
    >
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-cyan-500/30 bg-[#090d16] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="min-w-0">
            <h2 id="codex-title" className="font-display text-lg font-semibold text-slate-100">
              Nexuzcode Sheets — Codex & Release-Leitfaden
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              <span>{PROJECT_IDENTITY.currentVersion} '{PROJECT_IDENTITY.codename}'</span>
              <span aria-hidden="true"> · </span>
              <span>{PROJECT_IDENTITY.manufacturer}</span>
              <span aria-hidden="true"> · </span>
              <span>{PROJECT_IDENTITY.licenseName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
            aria-label="Codex schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-800 bg-[#070a10] px-6 py-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-cyan-500/15 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Projektvorstellung</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('releases')}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
              activeTab === 'releases'
                ? 'bg-cyan-500/15 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Release-Systematik (A–Z)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('legal')}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
              activeTab === 'legal'
                ? 'bg-cyan-500/15 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Aether-Ökosystem & GNU GPLv3</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <section className="rounded-lg border border-slate-800 bg-[#0d1320] p-5">
                <h3 className="font-display text-base font-semibold text-cyan-300">
                  01. Nutzen & Verwendungszweck
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  <strong>Nexuzcode Sheets</strong> ist ein präziser, futuristisch gestalteter
                  Web-Code-Editor mit Echtzeit-Syntax-Highlighting für JavaScript, TypeScript,
                  TSX/JSX, HTML5, CSS3, JSON und Markdown. Die Umgebung richtet sich an
                  Softwareentwickler, die Code-Module, Konfigurations-Sheets und Dokumentation
                  ohne Ablenkung in einer kontrastreichen Neon-Oberfläche erstellen, aus
                  lokalen Dateien laden, inspizieren und wieder exportieren möchten.
                </p>
              </section>

              <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-[#0d1320] p-5">
                  <div className="text-xs font-medium text-slate-400">Hersteller & Community</div>
                  <div className="mt-1.5 text-sm font-semibold text-slate-100">
                    {PROJECT_IDENTITY.manufacturer}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    Unabhängige Entwickler-Community mit Fokus auf saubere TypeScript- und
                    JavaScript-Architektur sowie offene Werkzeugketten.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-[#0d1320] p-5">
                  <div className="text-xs font-medium text-slate-400">Author & Owner</div>
                  <div className="mt-1.5 text-sm font-semibold text-slate-100">
                    {PROJECT_IDENTITY.copyright}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    Aktiver Release-Stand: <span className="font-mono-code text-cyan-300">v{PROJECT_IDENTITY.semver}</span> ({PROJECT_IDENTITY.currentVersion} '{PROJECT_IDENTITY.codename}').
                  </p>
                </div>
              </section>

              <section className="rounded-lg border border-slate-800 bg-[#0d1320] p-5">
                <h3 className="font-display text-base font-semibold text-slate-100">
                  02. Kernfunktionen der Version 1.0 Alpha 'Aether'
                </h3>
                <ul className="mt-3 grid grid-cols-1 gap-2.5 text-sm text-slate-300 md:grid-cols-2">
                  <li className="border-b border-slate-800/70 pb-2">
                    Multi-Language Syntax Highlighting (TS, JS, TSX, HTML, CSS, JSON, MD)
                  </li>
                  <li className="border-b border-slate-800/70 pb-2">
                    Dateien direkt im Browser erstellen, umbenennen, duplizieren & herunterladen
                  </li>
                  <li className="border-b border-slate-800/70 pb-2">
                    Lokale Dateien per Dateiauswahl oder Drag & Drop laden
                  </li>
                  <li className="border-b border-slate-800/70 pb-2">
                    Live-Vorschau für HTML/Markdown & Symbol-Struktur für JS/TS
                  </li>
                </ul>
              </section>
            </div>
          )}

          {activeTab === 'releases' && (
            <div className="space-y-6">
              <section className="rounded-lg border border-slate-800 bg-[#0d1320] p-5">
                <h3 className="font-display text-base font-semibold text-cyan-300">
                  Leitfaden zur systematischen Versions- & Codename-Vergabe
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Jeder Hauptrelease-Zyklus von Nexuzcode Sheets kombiniert eine klassische
                  semantische Versionsnummer (<span className="font-mono-code text-cyan-300">MAJOR.MINOR.PATCH</span>)
                  mit einer Reifegrad-Stufe (<span className="font-mono-code text-violet-300">Alpha / Beta / RC / Stable</span>)
                  sowie einem technologisch-physikalischen Codenamen in streng alphabetischer Reihenfolge
                  von <strong>A (Aether)</strong> bis <strong>Z (Zenith)</strong>.
                </p>

                <div className="mt-4 space-y-2.5">
                  {RELEASE_CYCLE_RULES.map((rule) => (
                    <div
                      key={rule.phase}
                      className="flex flex-col gap-1 border-t border-slate-800/80 pt-2.5 sm:flex-row sm:items-baseline sm:justify-between"
                    >
                      <div className="shrink-0 text-xs font-semibold text-slate-200">
                        {rule.phase}{' '}
                        <span className="font-mono-code font-normal text-cyan-400">
                          [{rule.pattern}]
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 sm:max-w-lg sm:text-right">
                        {rule.purpose}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="overflow-hidden rounded-lg border border-slate-800 bg-[#0d1320]">
                <div className="border-b border-slate-800 px-5 py-3">
                  <h4 className="font-display text-sm font-semibold text-slate-100">
                    Vollständige A–Z Codename-Matrix (Zyklus 1)
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-800 bg-[#070a10] text-slate-400">
                      <tr>
                        <th className="px-4 py-2.5 font-medium">Index</th>
                        <th className="px-4 py-2.5 font-medium">Version</th>
                        <th className="px-4 py-2.5 font-medium">Codename</th>
                        <th className="px-4 py-2.5 font-medium">Ursprung</th>
                        <th className="px-4 py-2.5 font-medium">Architektur-Fokus</th>
                        <th className="px-4 py-2.5 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {ALPHABET_CODENAME_ROADMAP.map((entry) => {
                        const isActive = entry.status === 'active';
                        return (
                          <tr
                            key={entry.letter}
                            className={
                              isActive
                                ? 'bg-cyan-500/10 text-slate-100'
                                : 'text-slate-300 hover:bg-slate-800/35'
                            }
                          >
                            <td className="font-mono-code px-4 py-2.5 font-semibold text-cyan-400">
                              {entry.letter}
                            </td>
                            <td className="font-mono-code whitespace-nowrap px-4 py-2.5">
                              {entry.majorVersion}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2.5 font-semibold text-slate-100">
                              {entry.codename}
                            </td>
                            <td className="px-4 py-2.5 text-slate-400">{entry.domainOrigin}</td>
                            <td className="px-4 py-2.5 text-slate-300">{entry.focusArea}</td>
                            <td className="whitespace-nowrap px-4 py-2.5 text-right font-medium">
                              {isActive ? (
                                <span className="text-emerald-400">Aktives Release</span>
                              ) : (
                                <span className="text-slate-500">Geplant</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'legal' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-800 bg-[#0d1320] p-5">
                <h3 className="font-display text-base font-semibold text-emerald-400">
                  Rechtliche Rahmenbedingungen — 'Aether'-Ökosystem
                </h3>
                <p className="mt-1.5 text-xs text-slate-400">
                  Lizenzmodell: {PROJECT_IDENTITY.licenseName} · SPDX:{' '}
                  <span className="font-mono-code text-slate-300">{PROJECT_IDENTITY.licenseSpdx}</span>
                </p>
              </div>

              {GPLV3_FRAMEWORK_SUMMARY.map((clause) => (
                <section
                  key={clause.title}
                  className="rounded-lg border border-slate-800 bg-[#0d1320] p-5"
                >
                  <h4 className="text-sm font-semibold text-slate-100">{clause.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{clause.text}</p>
                </section>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-[#070a10] px-6 py-3.5">
          <span className="text-xs text-slate-400">
            {PROJECT_IDENTITY.copyright}
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleLoadIntoEditor}
              className="whitespace-nowrap rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/60 hover:text-cyan-300"
            >
              Als Sheet im Editor öffnen
            </button>
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-cyan-400 px-3.5 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Leitfaden (.md) speichern</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
