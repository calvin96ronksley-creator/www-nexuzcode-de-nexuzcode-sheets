import { ReleaseCycleEntry, SheetFile } from '../types/sheets';

export const PROJECT_IDENTITY = {
  name: 'Nexuzcode Sheets',
  currentVersion: '1.0 Alpha',
  semver: '1.0.0-alpha.1',
  codename: 'Aether',
  manufacturer: "'Nexuzcode-DE | MetaNexuz' - Private Community",
  copyright: '(c) by Calvin Ronksley (hexzhen3x7) [Author & Owner]',
  licenseName: 'GNU General Public License v3.0 (GNU GPLv3)',
  licenseSpdx: 'GPL-3.0-or-later',
} as const;

export const RELEASE_CYCLE_RULES = [
  {
    phase: 'Alpha (a.x)',
    pattern: 'X.0 Alpha — <Codename>',
    purpose: 'Architektur-Fundament, Kern-APIs, experimentelle UI-Module und frühe Community-Tests innerhalb von Nexuzcode-DE.',
  },
  {
    phase: 'Beta (b.x)',
    pattern: 'X.0 Beta — <Codename>',
    purpose: 'Feature-Freeze für neue Kernmodule, Syntax-Engine-Optimierung, Stabilisierung der Datei-Pipelines.',
  },
  {
    phase: 'Release Candidate (rc.x)',
    pattern: 'X.0 RC — <Codename>',
    purpose: 'Sicherheits- und Kompatibilitätsprüfung, finales Bugfixing vor dem öffentlichen Produktiv-Release.',
  },
  {
    phase: 'Stable / GA',
    pattern: 'X.0 Stable — <Codename>',
    purpose: 'Vollständig freigegebene Hauptversion mit dokumentierter API und verifiziertem GPLv3-Quellpaket.',
  },
  {
    phase: 'Minor & Patch (X.Y.Z)',
    pattern: 'X.Y.Z — <Codename>',
    purpose: 'Minor-Releases (X.Y) erweitern Funktionen ohne Bruch; Patch-Releases (X.Y.Z) liefern gezielte Fehlerbehebungen unter demselben Codenamen.',
  },
] as const;

export const ALPHABET_CODENAME_ROADMAP: ReleaseCycleEntry[] = [
  {
    letter: 'A',
    majorVersion: '1.0 Alpha',
    codename: 'Aether',
    domainOrigin: 'Quantenfeld & Trägermedium',
    focusArea: 'Initiale Code-Editor-Engine, Neon-Designsystem, Syntax Highlighting & lokales Dateimanagement.',
    status: 'active',
  },
  {
    letter: 'B',
    majorVersion: '2.0',
    codename: 'Baryon',
    domainOrigin: 'Subatomare Kernphysik',
    focusArea: 'Erweiterte AST-Analyse, Multi-Cursor-Workflows und persistente Workspace-Profile.',
    status: 'planned',
  },
  {
    letter: 'C',
    majorVersion: '3.0',
    codename: 'Cryon',
    domainOrigin: 'Supraleitung & Kryotechnik',
    focusArea: 'Zero-Latency-Indexing großer Codebasen und Worker-basierte Hintergrund-Validierung.',
    status: 'planned',
  },
  {
    letter: 'D',
    majorVersion: '4.0',
    codename: 'Dynamo',
    domainOrigin: 'Elektromagnetische Induktion',
    focusArea: 'Modulares Plugin-SDK für Community-Sprachpakete und benutzerdefinierte Formatter.',
    status: 'planned',
  },
  {
    letter: 'E',
    majorVersion: '5.0',
    codename: 'Echelon',
    domainOrigin: 'Gestaffelte Systemarchitektur',
    focusArea: 'Hierarchische Projekt-Workspaces, Split-Diff-Ansichten und Workspace-Snapshots.',
    status: 'planned',
  },
  {
    letter: 'F',
    majorVersion: '6.0',
    codename: 'Flux',
    domainOrigin: 'Magnetischer Fluss & Datenstrom',
    focusArea: 'Reaktive Live-Execution-Pipelines für JavaScript- und TypeScript-Snippets.',
    status: 'planned',
  },
  {
    letter: 'G',
    majorVersion: '7.0',
    codename: 'Graviton',
    domainOrigin: 'Relativistische Feldtheorie',
    focusArea: 'Tiefensuche über Projektgrenzen hinweg und semantische Symbol-Referenzierung.',
    status: 'planned',
  },
  {
    letter: 'H',
    majorVersion: '8.0',
    codename: 'Helios',
    domainOrigin: 'Fusionsenergie & Spektrallicht',
    focusArea: 'Adaptives Spektral-Theming und barrierefreie Hochkontrast-Profile.',
    status: 'planned',
  },
  {
    letter: 'I',
    majorVersion: '9.0',
    codename: 'Ion',
    domainOrigin: 'Geladene Teilchenphysik',
    focusArea: 'Leichtgewichtige Edge-Synchronisation und portable Konfigurationsbündel.',
    status: 'planned',
  },
  {
    letter: 'J',
    majorVersion: '10.0',
    codename: 'Joule',
    domainOrigin: 'Thermodynamische Energieeinheit',
    focusArea: 'Energie- und speichereffiziente Virtualisierung für Dateien mit 100.000+ Zeilen.',
    status: 'planned',
  },
  {
    letter: 'K',
    majorVersion: '11.0',
    codename: 'Krypton',
    domainOrigin: 'Edelgas & Spektrallaser',
    focusArea: 'Signierte Release-Artefakte und kryptographische Integritätsprüfung für Pakete.',
    status: 'planned',
  },
  {
    letter: 'L',
    majorVersion: '12.0',
    codename: 'Lumen',
    domainOrigin: 'Photometrischer Lichtstrom',
    focusArea: 'Präzisions-Rendering für eingebettete Diagramme, SVG-Inspektoren und WebGL-Vorschauen.',
    status: 'planned',
  },
  {
    letter: 'M',
    majorVersion: '13.0',
    codename: 'Matrix',
    domainOrigin: 'Lineare Algebra & Tensorräume',
    focusArea: 'Tabellarische Code-Sheets und strukturierte JSON/CSV-Transformationen.',
    status: 'planned',
  },
  {
    letter: 'N',
    majorVersion: '14.0',
    codename: 'Nebula',
    domainOrigin: 'Interstellare Sternentstehung',
    focusArea: 'Verteilte Community-Templates und kollaborative Patch-Reviews.',
    status: 'planned',
  },
  {
    letter: 'O',
    majorVersion: '15.0',
    codename: 'Orbital',
    domainOrigin: 'Quantenmechanische Aufenthaltsräume',
    focusArea: 'Isolierte Sandbox-Container für sichere Web- und Node-Skriptausführung.',
    status: 'planned',
  },
  {
    letter: 'P',
    majorVersion: '16.0',
    codename: 'Photon',
    domainOrigin: 'Masselose Lichtquanten',
    focusArea: 'Instant-Boot-Architektur und GPU-beschleunigte Canvas-Overlays.',
    status: 'planned',
  },
  {
    letter: 'Q',
    majorVersion: '17.0',
    codename: 'Quantum',
    domainOrigin: 'Quantenzustände & Kohärenz',
    focusArea: 'Zustandsbasierte Time-Travel-History für parallele Code-Varianten.',
    status: 'planned',
  },
  {
    letter: 'R',
    majorVersion: '18.0',
    codename: 'Resonance',
    domainOrigin: 'Akustische & elektromagnetische Schwingung',
    focusArea: 'Echtzeit-Diagnostics, Linter-Hooks und harmonisierte Tastaturmakros.',
    status: 'planned',
  },
  {
    letter: 'S',
    majorVersion: '19.0',
    codename: 'Singularity',
    domainOrigin: 'Astrophysikalische Raumzeit-Verdichtung',
    focusArea: 'Vereinheitlichte Workspace-Engine für Desktop-PWA und lokale Dateisysteme.',
    status: 'planned',
  },
  {
    letter: 'T',
    majorVersion: '20.0',
    codename: 'Tachyon',
    domainOrigin: 'Hypothetische Überlicht-Teilchen',
    focusArea: 'Sub-Millisekunden-Parser-Pipeline und prädiktive Navigation.',
    status: 'planned',
  },
  {
    letter: 'U',
    majorVersion: '21.0',
    codename: 'Umbra',
    domainOrigin: 'Kernschatten & Kontrastoptik',
    focusArea: 'Tiefdunkle Studio-Modi und augenschonende Nacht-Ergonomie.',
    status: 'planned',
  },
  {
    letter: 'V',
    majorVersion: '22.0',
    codename: 'Vector',
    domainOrigin: 'Gerichtete Größen & Geometrie',
    focusArea: 'Vektorbasierte UI-Inspektoren und geometrische Layout-Debugger.',
    status: 'planned',
  },
  {
    letter: 'W',
    majorVersion: '23.0',
    codename: 'Waveform',
    domainOrigin: 'Signalverarbeitung & Fourier-Analyse',
    focusArea: 'WebAudio- und Signal-Visualisierung direkt aus Code-Sheets heraus.',
    status: 'planned',
  },
  {
    letter: 'X',
    majorVersion: '24.0',
    codename: 'Xenon',
    domainOrigin: 'Ionenantriebe & Hochleistungsoptik',
    focusArea: 'Cross-Plattform-Export für eigenständige Web-Bundles.',
    status: 'planned',
  },
  {
    letter: 'Y',
    majorVersion: '25.0',
    codename: 'Yottabyte',
    domainOrigin: 'Skalierungspräfix (10^24)',
    focusArea: 'Streaming-Parser für gigantische Datensätze und Log-Archive.',
    status: 'planned',
  },
  {
    letter: 'Z',
    majorVersion: '26.0',
    codename: 'Zenith',
    domainOrigin: 'Astronomischer Scheitelpunkt',
    focusArea: 'Abschluss des ersten A–Z-Zyklus und Übergang in die nächste Generation (A2).',
    status: 'planned',
  },
];

export const GPLV3_FRAMEWORK_SUMMARY = [
  {
    title: '1. Freiheitsgrade & Quellcode-Zugang (Copyleft)',
    text: 'Jeder Nutzer von Nexuzcode Sheets im Aether-Ökosystem hat das Recht, die Software für jeden Zweck auszuführen, den vollständigen Quellcode einzusehen, zu modifizieren und sowohl originale als auch veränderte Versionen weiterzugeben — vorausgesetzt, jede Weitergabe erfolgt ebenfalls unter den Bedingungen der GNU General Public License v3.0.',
  },
  {
    title: '2. Verpflichtende Lizenz- und Urheberrechtshinweise',
    text: 'Bei Verbreitung von Quellcode oder kompilierten Bundles müssen der ursprüngliche Urheberrechtshinweis "(c) by Calvin Ronksley (hexzhen3x7) [Author & Owner]", die Herkunftsangabe "Nexuzcode-DE | MetaNexuz - Private Community" sowie der vollständige Text der GNU GPLv3 unverändert beibehalten werden.',
  },
  {
    title: '3. Änderungen & Derivate im Aether-Ökosystem',
    text: 'Modifizierte Ableitungen müssen deutlich als veränderte Versionen gekennzeichnet und mit einem Änderungsdatum versehen werden. Proprietäre Erweiterungen oder das Verschließen von abgeleitetem Quellcode sind gemäß GNU GPLv3 unzulässig.',
  },
  {
    title: '4. Gewährleistungs- und Haftungsausschluss (Sections 15–17 GPLv3)',
    text: 'Die Software wird "WIE BESEHEN" (AS IS) ohne jegliche ausdrückliche oder stillschweigende Gewährleistung bereitgestellt, soweit dies gesetzlich zulässig ist. Die Haftung für Datenverlust oder Folgeschäden liegt beim jeweiligen Anwender.',
  },
  {
    title: '5. Marken- & Community-Identität',
    text: 'Während der Quellcode unter der GNU GPLv3 frei lizenziert ist, verbleiben die Bezeichnungen "Nexuzcode-DE", "MetaNexuz" und die offizielle Zuordnung zu Author & Owner Calvin Ronksley (hexzhen3x7) als identitätsstiftende Ursprungsnachweise geschützt; Forks dürfen keine offizielle Zertifizierung durch Nexuzcode-DE suggerieren.',
  },
] as const;

export function generateCodexMarkdown(): string {
  const roadmapTable = ALPHABET_CODENAME_ROADMAP.map(
    (item) =>
      `| ${item.letter} | ${item.majorVersion} | **${item.codename}** | ${item.domainOrigin} | ${item.focusArea} | ${item.status === 'active' ? 'Aktiv' : 'Geplant'} |`
  ).join('\n');

  const rulesList = RELEASE_CYCLE_RULES.map(
    (r) => `- **${r.phase}** (\`${r.pattern}\`): ${r.purpose}`
  ).join('\n');

  const legalList = GPLV3_FRAMEWORK_SUMMARY.map(
    (g) => `### ${g.title}\n${g.text}`
  ).join('\n\n');

  return `# Nexuzcode Sheets — Version 1.0 Alpha 'Aether'

**Hersteller:** ${PROJECT_IDENTITY.manufacturer}  
**Urheberrecht:** ${PROJECT_IDENTITY.copyright}  
**Lizenz:** ${PROJECT_IDENTITY.licenseName}

---

## 1. Projektvorstellung & Verwendungszweck

**Nexuzcode Sheets** ist ein spezialisierter, futuristisch gestalteter Code-Editor mit Echtzeit-Syntax-Highlighting für moderne Web- und Softwareentwicklung (TypeScript, JavaScript, TSX/JSX, HTML5, CSS3, JSON und Markdown). Entwickelt für maximale Klarheit in dunklen Neon-Arbeitsumgebungen, ermöglicht die Anwendung das unmittelbare Erstellen, Laden, Strukturieren und Exportieren lokaler Code-Sheets ohne unnötigen Ballast.

---

## 2. Systematischer Leitfaden für zukünftige Release-Zyklen

Alle Releases von **Nexuzcode Sheets** folgen einem deterministischen, alphabetisch inkrementellen Codename-System (A bis Z), kombiniert mit semantischer Versionierung (\`MAJOR.MINOR.PATCH [Stage]\`).

### Aufbau der Versionsnummer
- Jede **Major-Version** schreitet exakt um einen Buchstaben im Alphabet voran (\`1.0\` = **A**, \`2.0\` = **B**, ..., \`26.0\` = **Z**).
- Nach Abschluss von Buchstabe **Z** (\`26.0 Zenith\`) beginnt Zyklus 2 mit dem Präfix \`A2\` (z. B. \`27.0 Aether-II\` oder zweiter Generationen-Stamm).
- Codenamen stammen konsequent aus Physik, Quantenmechanik, Photonik, Informatik und Raumfahrttechnik.

### Reifegrad-Stufen (Stages)
${rulesList}

### Vollständige A–Z Codename-Matrix

| Buchstabe | Version | Codename | Technologischer Ursprung | Geplanter Fokus | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
${roadmapTable}

---

## 3. Rechtliche Rahmenbedingungen — 'Aether'-Ökosystem (GNU GPLv3)

${legalList}
`;
}

export const INITIAL_SHEETS: SheetFile[] = [
  {
    id: 'sheet-aether-core',
    name: 'aether-engine.ts',
    language: 'typescript',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 1800000,
    content: `/**
 * Nexuzcode Sheets — v1.0 Alpha 'Aether'
 * Hersteller: 'Nexuzcode-DE | MetaNexuz' - Private Community
 * (c) by Calvin Ronksley (hexzhen3x7) [Author & Owner]
 * Lizenz: GNU General Public License v3.0 (GPL-3.0-or-later)
 */

export type ReleaseStage = 'Alpha' | 'Beta' | 'RC' | 'Stable';

export interface ReleaseDescriptor<TCode extends string = string> {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly stage: ReleaseStage;
  readonly codename: TCode;
  readonly license: 'GNU-GPLv3';
}

const ALPHABET_CODENAMES = [
  'Aether', 'Baryon', 'Cryon', 'Dynamo', 'Echelon', 'Flux',
  'Graviton', 'Helios', 'Ion', 'Joule', 'Krypton', 'Lumen',
  'Matrix', 'Nebula', 'Orbital', 'Photon', 'Quantum', 'Resonance',
  'Singularity', 'Tachyon', 'Umbra', 'Vector', 'Waveform',
  'Xenon', 'Yottabyte', 'Zenith',
] as const;

export function resolveCodename(majorVersion: number): string {
  if (majorVersion < 1) {
    throw new RangeError('Major-Version muss mindestens 1 sein.');
  }
  const index = (majorVersion - 1) % ALPHABET_CODENAMES.length;
  const cycle = Math.floor((majorVersion - 1) / ALPHABET_CODENAMES.length) + 1;
  const baseName = ALPHABET_CODENAMES[index];
  return cycle === 1 ? baseName : \`\${baseName} Gen-\${cycle}\`;
}

export function createReleaseBadge(descriptor: ReleaseDescriptor): string {
  const { major, minor, patch, stage, codename } = descriptor;
  const base = \`v\${major}.\${minor}.\${patch}\`;
  return stage === 'Stable'
    ? \`\${base} '\${codename}'\`
    : \`\${base} \${stage} '\${codename}'\`;
}

export const CURRENT_RELEASE: ReleaseDescriptor<'Aether'> = {
  major: 1,
  minor: 0,
  patch: 0,
  stage: 'Alpha',
  codename: 'Aether',
  license: 'GNU-GPLv3',
};

console.info(createReleaseBadge(CURRENT_RELEASE));
`,
  },
  {
    id: 'sheet-release-matrix',
    name: 'release-matrix.json',
    language: 'json',
    createdAt: Date.now() - 3000000,
    updatedAt: Date.now() - 1200000,
    content: JSON.stringify(
      {
        project: PROJECT_IDENTITY.name,
        release: {
          version: PROJECT_IDENTITY.currentVersion,
          semver: PROJECT_IDENTITY.semver,
          codename: PROJECT_IDENTITY.codename,
          cycleLetter: 'A',
        },
        publisher: PROJECT_IDENTITY.manufacturer,
        copyright: PROJECT_IDENTITY.copyright,
        license: PROJECT_IDENTITY.licenseName,
        nextPlannedReleases: ALPHABET_CODENAME_ROADMAP.slice(0, 6).map((r) => ({
          letter: r.letter,
          version: r.majorVersion,
          codename: r.codename,
          domain: r.domainOrigin,
        })),
      },
      null,
      2
    ),
  },
  {
    id: 'sheet-aether-codex-md',
    name: 'AETHER-CODEX.md',
    language: 'markdown',
    createdAt: Date.now() - 2400000,
    updatedAt: Date.now() - 900000,
    content: generateCodexMarkdown(),
  },
  {
    id: 'sheet-neon-preview',
    name: 'aether-preview.html',
    language: 'html',
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now() - 600000,
    content: `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      padding: 2rem;
      background: radial-gradient(circle at top right, #0e1d33 0%, #06080d 65%);
      color: #e2e8f0;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sheet-card {
      width: 100%;
      max-width: 520px;
      background: rgba(13, 19, 31, 0.9);
      border: 1px solid rgba(0, 240, 255, 0.3);
      border-radius: 12px;
      padding: 28px;
      box-shadow: 0 0 40px rgba(0, 240, 255, 0.08);
    }
    .kicker {
      font-size: 12px;
      letter-spacing: 0.08em;
      color: #22d3ee;
      margin-bottom: 8px;
    }
    h1 {
      margin: 0 0 12px;
      font-size: 24px;
      color: #f8fafc;
    }
    p {
      margin: 0 0 20px;
      line-height: 1.6;
      color: #94a3b8;
      font-size: 14px;
    }
    .meta {
      padding-top: 16px;
      border-top: 1px solid rgba(148, 163, 184, 0.15);
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <article class="sheet-card">
    <div class="kicker">Nexuzcode Sheets · v1.0 Alpha 'Aether'</div>
    <h1>Futuristische Code-Umgebung</h1>
    <p>
      Diese Live-Vorschau rendert HTML- und CSS-Sheets direkt im Workspace.
      Bearbeite den Quelltext links, um Änderungen sofort sichtbar zu machen.
    </p>
    <div class="meta">
      Nexuzcode-DE | MetaNexuz · (c) Calvin Ronksley (hexzhen3x7) · GNU GPLv3
    </div>
  </article>
</body>
</html>`,
  },
];
