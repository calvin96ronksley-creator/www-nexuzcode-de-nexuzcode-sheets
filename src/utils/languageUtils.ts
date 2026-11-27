import { Extension } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { SupportedLanguage } from '../types/sheets';

export const LANGUAGE_META: Record<
  SupportedLanguage,
  { label: string; shortLabel: string; ext: string; accentClass: string }
> = {
  typescript: {
    label: 'TypeScript',
    shortLabel: 'TS',
    ext: '.ts',
    accentClass: 'text-cyan-400',
  },
  tsx: {
    label: 'TypeScript JSX',
    shortLabel: 'TSX',
    ext: '.tsx',
    accentClass: 'text-sky-400',
  },
  javascript: {
    label: 'JavaScript',
    shortLabel: 'JS',
    ext: '.js',
    accentClass: 'text-amber-400',
  },
  jsx: {
    label: 'JavaScript JSX',
    shortLabel: 'JSX',
    ext: '.jsx',
    accentClass: 'text-yellow-400',
  },
  html: {
    label: 'HTML5',
    shortLabel: 'HTML',
    ext: '.html',
    accentClass: 'text-orange-400',
  },
  css: {
    label: 'CSS3',
    shortLabel: 'CSS',
    ext: '.css',
    accentClass: 'text-fuchsia-400',
  },
  json: {
    label: 'JSON',
    shortLabel: 'JSON',
    ext: '.json',
    accentClass: 'text-emerald-400',
  },
  markdown: {
    label: 'Markdown',
    shortLabel: 'MD',
    ext: '.md',
    accentClass: 'text-violet-400',
  },
  plaintext: {
    label: 'Klartext',
    shortLabel: 'TXT',
    ext: '.txt',
    accentClass: 'text-slate-400',
  },
};

export function detectLanguageFromFilename(filename: string): SupportedLanguage {
  const lower = filename.trim().toLowerCase();
  if (lower.endsWith('.tsx')) return 'tsx';
  if (lower.endsWith('.ts') || lower.endsWith('.mts') || lower.endsWith('.cts')) return 'typescript';
  if (lower.endsWith('.jsx')) return 'jsx';
  if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) return 'javascript';
  if (lower.endsWith('.html') || lower.endsWith('.htm') || lower.endsWith('.svg')) return 'html';
  if (lower.endsWith('.css') || lower.endsWith('.scss')) return 'css';
  if (lower.endsWith('.json') || lower.endsWith('.jsonc')) return 'json';
  if (lower.endsWith('.md') || lower.endsWith('.mdx')) return 'markdown';
  return 'plaintext';
}

export function getCodeMirrorLanguageExtension(language: SupportedLanguage): Extension[] {
  switch (language) {
    case 'typescript':
      return [javascript({ typescript: true, jsx: false })];
    case 'tsx':
      return [javascript({ typescript: true, jsx: true })];
    case 'javascript':
      return [javascript({ typescript: false, jsx: false })];
    case 'jsx':
      return [javascript({ typescript: false, jsx: true })];
    case 'html':
      return [html()];
    case 'css':
      return [css()];
    case 'json':
      return [json()];
    case 'markdown':
      return [markdown()];
    case 'plaintext':
    default:
      return [];
  }
}

export function formatBytes(text: string): string {
  const bytes = new Blob([text]).size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function downloadFileToDisk(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export interface CodeSymbol {
  name: string;
  kind: 'function' | 'class' | 'interface' | 'type' | 'const' | 'heading' | 'selector';
  line: number;
}

export function extractSymbols(content: string, language: SupportedLanguage): CodeSymbol[] {
  const lines = content.split('\n');
  const symbols: CodeSymbol[] = [];

  lines.forEach((rawLine, idx) => {
    const lineNum = idx + 1;
    const line = rawLine.trim();
    if (!line) return;

    if (language === 'typescript' || language === 'tsx' || language === 'javascript' || language === 'jsx') {
      const fnMatch = line.match(/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/);
      if (fnMatch) {
        symbols.push({ name: fnMatch[1], kind: 'function', line: lineNum });
        return;
      }
      const classMatch = line.match(/^(?:export\s+)?(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)/);
      if (classMatch) {
        symbols.push({ name: classMatch[1], kind: 'class', line: lineNum });
        return;
      }
      const ifaceMatch = line.match(/^(?:export\s+)?interface\s+([A-Za-z_$][\w$]*)/);
      if (ifaceMatch) {
        symbols.push({ name: ifaceMatch[1], kind: 'interface', line: lineNum });
        return;
      }
      const typeMatch = line.match(/^(?:export\s+)?type\s+([A-Za-z_$][\w$]*)\s*=/);
      if (typeMatch) {
        symbols.push({ name: typeMatch[1], kind: 'type', line: lineNum });
        return;
      }
      const constFnMatch = line.match(/^(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?(?:\(|<)/);
      if (constFnMatch) {
        symbols.push({ name: constFnMatch[1], kind: 'const', line: lineNum });
      }
    } else if (language === 'markdown') {
      const mdMatch = line.match(/^(#{1,3})\s+(.+)/);
      if (mdMatch) {
        symbols.push({ name: mdMatch[2], kind: 'heading', line: lineNum });
      }
    } else if (language === 'css') {
      const cssMatch = line.match(/^([.#@][A-Za-z0-9_-]+(?:\s+[^{]+)?)\s*\{/);
      if (cssMatch) {
        symbols.push({ name: cssMatch[1].trim(), kind: 'selector', line: lineNum });
      }
    }
  });

  return symbols;
}

export function getTemplateContent(language: SupportedLanguage, filename: string): string {
  switch (language) {
    case 'typescript':
      return `/**
 * ${filename}
 * Nexuzcode Sheets — v1.0 Alpha 'Aether'
 * (c) Calvin Ronksley (hexzhen3x7) | GNU GPLv3
 */

export interface SheetConfig {
  readonly id: string;
  readonly codename: 'Aether';
  readonly strictMode: boolean;
}

export function createSheetConfig(id: string): SheetConfig {
  return {
    id,
    codename: 'Aether',
    strictMode: true,
  };
}

console.log(createSheetConfig('nexuz-core'));
`;
    case 'tsx':
      return `import type { FC } from 'react';

interface NeonPanelProps {
  title: string;
  version?: string;
}

export const NeonPanel: FC<NeonPanelProps> = ({ title, version = '1.0 Alpha' }) => {
  return (
    <section className="rounded-lg border border-cyan-500/30 bg-slate-950 p-6">
      <h2 className="text-lg font-semibold text-cyan-300">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">Release: {version} · Aether</p>
    </section>
  );
};
`;
    case 'javascript':
      return `/**
 * ${filename}
 * Nexuzcode Sheets — JavaScript Module
 */

export function formatReleaseLabel(major, minor, stage, codename) {
  return \`v\${major}.\${minor} \${stage} '\${codename}'\`;
}

const current = formatReleaseLabel(1, 0, 'Alpha', 'Aether');
console.info('Aktive Version:', current);
`;
    case 'jsx':
      return `export function CyberCard({ label }) {
  return (
    <div className="border border-cyan-400/30 bg-slate-900 px-4 py-3 text-cyan-100">
      {label}
    </div>
  );
}
`;
    case 'html':
      return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <title>Nexuzcode Sheet — Aether Vorschau</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #060911;
      color: #e2e8f0;
      font-family: system-ui, sans-serif;
    }
    .panel {
      padding: 2rem 2.5rem;
      border: 1px solid rgba(0, 240, 255, 0.35);
      border-radius: 12px;
      background: #0b111d;
      box-shadow: 0 0 32px rgba(0, 240, 255, 0.1);
    }
    h1 {
      margin: 0 0 0.5rem;
      color: #22d3ee;
      font-size: 1.5rem;
    }
    p {
      margin: 0;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <main class="panel">
    <h1>Nexuzcode Sheets — Aether</h1>
    <p>Live-HTML-Vorschau direkt im Workspace.</p>
  </main>
</body>
</html>
`;
    case 'css':
      return `/* Nexuzcode Sheets — Aether Neon Token System */
:root {
  --aether-bg: #06080d;
  --aether-surface: #0d131f;
  --aether-cyan: #00f0ff;
  --aether-violet: #a855f7;
  --aether-emerald: #10b981;
}

.aether-surface {
  background-color: var(--aether-surface);
  border: 1px solid rgba(0, 240, 255, 0.22);
  color: #e2e8f0;
}
`;
    case 'json':
      return `{
  "product": "Nexuzcode Sheets",
  "version": "1.0.0-alpha.1",
  "stage": "Alpha",
  "codename": "Aether",
  "publisher": "Nexuzcode-DE | MetaNexuz",
  "author": "Calvin Ronksley (hexzhen3x7)",
  "license": "GNU GPLv3"
}
`;
    case 'markdown':
      return `# ${filename.replace(/\.md$/i, '')}

Erstellt mit **Nexuzcode Sheets v1.0 Alpha 'Aether'**.

## Eigenschaften

- Syntax Highlighting für TypeScript, JavaScript, HTML, CSS, JSON & Markdown
- Sofortiges Erstellen, Bearbeiten, Laden und Exportieren lokaler Dateien
- Lizenziert unter **GNU GPLv3**
`;
    case 'plaintext':
    default:
      return `Nexuzcode Sheets — v1.0 Alpha 'Aether'\n`;
  }
}
