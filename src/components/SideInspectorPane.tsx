import { useMemo, useState } from 'react';
import { Braces, Eye, ListTree, Play, RotateCw, X } from 'lucide-react';
import { SheetFile } from '../types/sheets';
import { extractSymbols } from '../utils/languageUtils';

interface SideInspectorPaneProps {
  file: SheetFile;
  onJumpToLine: (line: number) => void;
  onClose: () => void;
}

function renderMarkdownSafely(source: string) {
  const lines = source.split('\n');
  const blocks: Array<{ type: 'h1' | 'h2' | 'h3' | 'li' | 'hr' | 'p' | 'code'; text: string }> = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({ type: 'code', text: codeBuffer.join('\n') });
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeBuffer.push(raw);
      continue;
    }
    if (line === '---') {
      blocks.push({ type: 'hr', text: '' });
    } else if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4) });
    } else if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3) });
    } else if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.slice(2) });
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({ type: 'li', text: line.slice(2) });
    } else if (line.trim()) {
      blocks.push({ type: 'p', text: line });
    }
  }

  return blocks.map((block, index) => {
    const key = `md-${index}`;
    switch (block.type) {
      case 'h1':
        return (
          <h1 key={key} className="font-display mt-2 text-lg font-bold text-cyan-300">
            {block.text}
          </h1>
        );
      case 'h2':
        return (
          <h2 key={key} className="font-display mt-4 text-base font-semibold text-slate-100">
            {block.text}
          </h2>
        );
      case 'h3':
        return (
          <h3 key={key} className="mt-3 text-sm font-semibold text-violet-300">
            {block.text}
          </h3>
        );
      case 'hr':
        return <hr key={key} className="my-3 border-slate-800" />;
      case 'li':
        return (
          <div key={key} className="flex items-start gap-2 text-xs leading-relaxed text-slate-300">
            <span className="text-cyan-400">•</span>
            <span>{block.text.replace(/\*\*/g, '')}</span>
          </div>
        );
      case 'code':
        return (
          <pre
            key={key}
            className="font-mono-code my-2 overflow-x-auto rounded-lg border border-slate-800 bg-[#06080d] p-3 text-xs text-emerald-300"
          >
            {block.text}
          </pre>
        );
      case 'p':
      default:
        return (
          <p key={key} className="text-xs leading-relaxed text-slate-300">
            {block.text.replace(/\*\*/g, '')}
          </p>
        );
    }
  });
}

export function SideInspectorPane({
  file,
  onJumpToLine,
  onClose,
}: SideInspectorPaneProps) {
  const [refreshTick, setRefreshTick] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  const symbols = useMemo(
    () => extractSymbols(file.content, file.language),
    [file.content, file.language]
  );

  const jsonValidation = useMemo(() => {
    if (file.language !== 'json') return null;
    try {
      const parsed = JSON.parse(file.content);
      const topKeys =
        parsed && typeof parsed === 'object' && !Array.isArray(parsed)
          ? Object.keys(parsed)
          : [];
      return {
        valid: true as const,
        type: Array.isArray(parsed) ? `Array (${parsed.length} Einträge)` : typeof parsed,
        topKeys,
      };
    } catch (err) {
      return {
        valid: false as const,
        message: err instanceof Error ? err.message : 'Ungültiges JSON',
      };
    }
  }, [file.content, file.language]);

  const handleRunJavaScript = () => {
    const captured: string[] = [];
    const customConsole = {
      log: (...args: unknown[]) => captured.push(args.map((a) => formatValue(a)).join(' ')),
      info: (...args: unknown[]) => captured.push(args.map((a) => formatValue(a)).join(' ')),
      warn: (...args: unknown[]) => captured.push(`Warnung: ${args.map((a) => formatValue(a)).join(' ')}`),
      error: (...args: unknown[]) => captured.push(`Fehler: ${args.map((a) => formatValue(a)).join(' ')}`),
    };

    try {
      const cleanCode = file.content.replace(/^\s*export\s+/gm, '');
      const runner = new Function('console', cleanCode);
      runner(customConsole);
      if (captured.length === 0) {
        captured.push('Skript ohne Konsolenausgabe ausgeführt.');
      }
    } catch (err) {
      captured.push(`Laufzeitfehler: ${err instanceof Error ? err.message : String(err)}`);
    }
    setConsoleLogs(captured);
  };

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-slate-800/90 bg-[#090d16] lg:w-96">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          {file.language === 'html' || file.language === 'markdown' ? (
            <Eye className="h-4 w-4 text-cyan-400" aria-hidden="true" />
          ) : file.language === 'json' ? (
            <Braces className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          ) : (
            <ListTree className="h-4 w-4 text-cyan-400" aria-hidden="true" />
          )}
          <span>
            {file.language === 'html'
              ? 'Live-Vorschau (HTML)'
              : file.language === 'markdown'
              ? 'Markdown-Vorschau'
              : file.language === 'json'
              ? 'JSON-Inspektor'
              : 'Symbol-Struktur'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {file.language === 'html' && (
            <button
              type="button"
              onClick={() => setRefreshTick((t) => t + 1)}
              className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-cyan-300"
              title="Vorschau neu laden"
              aria-label="Vorschau neu laden"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
            title="Inspektor schließen"
            aria-label="Inspektor schließen"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {file.language === 'html' && (
          <div className="h-full min-h-[320px] overflow-hidden rounded-lg border border-slate-800 bg-black">
            <iframe
              key={`${file.id}-${refreshTick}`}
              title={`HTML-Vorschau für ${file.name}`}
              sandbox="allow-scripts"
              srcDoc={file.content}
              className="h-full min-h-[420px] w-full border-0 bg-[#06080d]"
            />
          </div>
        )}

        {file.language === 'markdown' && (
          <div className="space-y-2.5">{renderMarkdownSafely(file.content)}</div>
        )}

        {file.language === 'json' && jsonValidation && (
          <div className="space-y-4">
            <div
              className={`rounded-lg border p-3.5 text-xs ${
                jsonValidation.valid
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                  : 'border-rose-500/40 bg-rose-950/30 text-rose-300'
              }`}
            >
              <div className="font-semibold">
                {jsonValidation.valid ? 'Gültiges JSON-Dokument' : 'Syntaxfehler im JSON'}
              </div>
              <div className="mt-1 text-slate-300">
                {jsonValidation.valid
                  ? `Strukturtyp: ${jsonValidation.type}`
                  : jsonValidation.message}
              </div>
            </div>

            {jsonValidation.valid && jsonValidation.topKeys.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-medium text-slate-400">
                  Top-Level-Schlüssel ({jsonValidation.topKeys.length})
                </div>
                <ul className="space-y-1">
                  {jsonValidation.topKeys.map((k) => (
                    <li
                      key={k}
                      className="font-mono-code rounded border border-slate-800/80 bg-[#06080d] px-3 py-1.5 text-xs text-cyan-300"
                    >
                      {k}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {file.language !== 'html' &&
          file.language !== 'markdown' &&
          file.language !== 'json' && (
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Erkannte Symbole</span>
                  <span className="font-mono-code">{symbols.length}</span>
                </div>

                {symbols.length === 0 ? (
                  <p className="rounded-lg border border-slate-800/80 bg-[#06080d] p-3 text-xs text-slate-400">
                    Keine Funktionen, Klassen, Interfaces oder Selektoren erkannt.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {symbols.map((sym, i) => (
                      <li key={`${sym.name}-${sym.line}-${i}`}>
                        <button
                          type="button"
                          onClick={() => onJumpToLine(sym.line)}
                          className="flex w-full items-center justify-between rounded-md border border-transparent px-2.5 py-1.5 text-left text-xs transition-colors hover:border-cyan-500/30 hover:bg-slate-800/60"
                        >
                          <span className="truncate font-mono-code text-slate-200">
                            <span className="mr-2 text-cyan-400">{sym.kind}</span>
                            {sym.name}
                          </span>
                          <span className="font-mono-code ml-2 shrink-0 text-slate-500">
                            Z.{sym.line}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {file.language === 'javascript' && (
                <div className="border-t border-slate-800 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">
                      JavaScript-Konsole
                    </span>
                    <button
                      type="button"
                      onClick={handleRunJavaScript}
                      className="flex items-center gap-1.5 rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/30"
                    >
                      <Play className="h-3 w-3" aria-hidden="true" />
                      <span>Ausführen</span>
                    </button>
                  </div>
                  <div className="font-mono-code mt-2.5 min-h-[96px] space-y-1 rounded-lg border border-slate-800 bg-[#06080d] p-3 text-xs text-slate-300">
                    {consoleLogs.length === 0 ? (
                      <span className="text-slate-500">
                        Klicke auf &quot;Ausführen&quot;, um console-Ausgaben zu testen.
                      </span>
                    ) : (
                      consoleLogs.map((entry, idx) => (
                        <div key={idx} className="break-words text-cyan-200">
                          {entry}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
      </div>
    </aside>
  );
}

function formatValue(val: unknown): string {
  if (typeof val === 'string') return val;
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}
