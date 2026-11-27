import {
  ChangeEvent,
  DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Copy,
  Download,
  FileCode,
  FilePlus2,
  FolderOpen,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
  WrapText,
  X,
} from 'lucide-react';
import { INITIAL_SHEETS, PROJECT_IDENTITY } from './data/aetherCodex';
import {
  EditorCursorInfo,
  EditorSettings,
  NeonThemeId,
  SheetFile,
  SupportedLanguage,
} from './types/sheets';
import {
  LANGUAGE_META,
  detectLanguageFromFilename,
  downloadFileToDisk,
  formatBytes,
} from './utils/languageUtils';
import { CodeEditorHandle, CodeEditorPane } from './components/CodeEditorPane';
import { NewFileModal } from './components/NewFileModal';
import { AetherCodexModal } from './components/AetherCodexModal';
import { SideInspectorPane } from './components/SideInspectorPane';

const STORAGE_KEY_FILES = 'nexuzcode_sheets_aether_files_v1';
const STORAGE_KEY_SETTINGS = 'nexuzcode_sheets_aether_settings_v1';
const STORAGE_KEY_ACTIVE = 'nexuzcode_sheets_aether_active_v1';

const DEFAULT_SETTINGS: EditorSettings = {
  theme: 'aether-cyan',
  fontSize: 14,
  wordWrap: false,
  tabSize: 2,
  showMinimapOutline: false,
};

const ALL_LANGUAGES = Object.keys(LANGUAGE_META) as SupportedLanguage[];

function loadStoredFiles(): SheetFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FILES);
    if (!raw) return INITIAL_SHEETS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Fallback to starter sheets
  }
  return INITIAL_SHEETS;
}

function loadStoredSettings(): EditorSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function App() {
  const [files, setFiles] = useState<SheetFile[]>(() => loadStoredFiles());
  const [openTabIds, setOpenTabIds] = useState<string[]>(() => {
    const stored = loadStoredFiles();
    return stored.slice(0, 4).map((f) => f.id);
  });
  const [activeFileId, setActiveFileId] = useState<string>(() => {
    const storedActive = localStorage.getItem(STORAGE_KEY_ACTIVE);
    const storedFiles = loadStoredFiles();
    if (storedActive && storedFiles.some((f) => f.id === storedActive)) {
      return storedActive;
    }
    return storedFiles[0]?.id ?? '';
  });

  const [settings, setSettings] = useState<EditorSettings>(() => loadStoredSettings());
  const [showSidebar, setShowSidebar] = useState(true);
  const [showInspector, setShowInspector] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [fileFilter, setFileFilter] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const [cursorInfo, setCursorInfo] = useState<EditorCursorInfo>({
    line: 1,
    column: 1,
    selectionLength: 0,
    totalLines: 1,
    totalChars: 0,
  });

  const editorRef = useRef<CodeEditorHandle | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  const activeFile = useMemo(
    () => files.find((f) => f.id === activeFileId) ?? null,
    [files, activeFileId]
  );

  const filteredFiles = useMemo(() => {
    const q = fileFilter.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, fileFilter]);

  const showToast = useCallback((message: string) => {
    setStatusNotice(message);
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setStatusNotice(null);
    }, 3200);
  }, []);

  // Persist workspace to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files));
    } catch {
      // Ignore storage quota errors
    }
  }, [files]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, activeFileId);
    } catch {
      // Ignore
    }
  }, [activeFileId]);

  // Keyboard shortcuts: Ctrl/Cmd+S downloads active file, Ctrl/Cmd+N opens New File modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (activeFile) {
          downloadFileToDisk(activeFile.name, activeFile.content);
          setFiles((prev) =>
            prev.map((f) => (f.id === activeFile.id ? { ...f, isModified: false } : f))
          );
          showToast(`"${activeFile.name}" gespeichert`);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeFile, showToast]);

  const openFile = useCallback((fileId: string) => {
    setActiveFileId(fileId);
    setOpenTabIds((prev) => (prev.includes(fileId) ? prev : [...prev, fileId]));
  }, []);

  const handleCloseTab = useCallback(
    (tabId: string) => {
      setOpenTabIds((prev) => {
        const nextTabs = prev.filter((id) => id !== tabId);
        if (activeFileId === tabId) {
          const closedIdx = prev.indexOf(tabId);
          const fallback = nextTabs[closedIdx] ?? nextTabs[closedIdx - 1] ?? '';
          setActiveFileId(fallback);
        }
        return nextTabs;
      });
    },
    [activeFileId]
  );

  const handleCreateFile = useCallback(
    (name: string, language: SupportedLanguage, content: string) => {
      const id = `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const now = Date.now();
      const created: SheetFile = {
        id,
        name,
        language,
        content,
        createdAt: now,
        updatedAt: now,
        isModified: false,
      };
      setFiles((prev) => [created, ...prev]);
      setOpenTabIds((prev) => [...prev, id]);
      setActiveFileId(id);
      showToast(`Datei "${name}" erstellt`);
    },
    [showToast]
  );

  const handleContentChange = useCallback((fileId: string, nextContent: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? { ...f, content: nextContent, updatedAt: Date.now(), isModified: true }
          : f
      )
    );
  }, []);

  const handleLanguageOverride = (nextLang: SupportedLanguage) => {
    if (!activeFile) return;
    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFile.id ? { ...f, language: nextLang, updatedAt: Date.now() } : f
      )
    );
  };

  const handleImportFileList = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const loaded: SheetFile[] = [];
      for (const diskFile of Array.from(fileList)) {
        try {
          const text = await diskFile.text();
          const language = detectLanguageFromFilename(diskFile.name);
          const now = Date.now();
          loaded.push({
            id: `sheet-${now}-${Math.random().toString(36).slice(2, 7)}`,
            name: diskFile.name,
            language,
            content: text,
            createdAt: now,
            updatedAt: now,
            isModified: false,
          });
        } catch {
          showToast(`Fehler beim Lesen von "${diskFile.name}"`);
        }
      }

      if (loaded.length > 0) {
        setFiles((prev) => {
          const next = [...prev];
          for (const item of loaded) {
            const existingIdx = next.findIndex(
              (f) => f.name.toLowerCase() === item.name.toLowerCase()
            );
            if (existingIdx >= 0) {
              next[existingIdx] = {
                ...next[existingIdx],
                content: item.content,
                language: item.language,
                updatedAt: Date.now(),
                isModified: false,
              };
              item.id = next[existingIdx].id;
            } else {
              next.unshift(item);
            }
          }
          return next;
        });

        setOpenTabIds((prev) => {
          const merged = [...prev];
          for (const item of loaded) {
            if (!merged.includes(item.id)) merged.push(item.id);
          }
          return merged;
        });
        setActiveFileId(loaded[0].id);
        showToast(
          loaded.length === 1
            ? `"${loaded[0].name}" geladen`
            : `${loaded.length} Dateien geladen`
        );
      }
    },
    [showToast]
  );

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    void handleImportFileList(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    void handleImportFileList(e.dataTransfer.files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDeleteFile = (fileId: string) => {
    const target = files.find((f) => f.id === fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setOpenTabIds((prev) => {
      const next = prev.filter((id) => id !== fileId);
      if (activeFileId === fileId) {
        setActiveFileId(next[0] ?? '');
      }
      return next;
    });
    if (target) {
      showToast(`"${target.name}" entfernt`);
    }
  };

  const handleDuplicateActive = () => {
    if (!activeFile) return;
    const dotIdx = activeFile.name.lastIndexOf('.');
    const base = dotIdx > 0 ? activeFile.name.slice(0, dotIdx) : activeFile.name;
    const ext = dotIdx > 0 ? activeFile.name.slice(dotIdx) : '';
    const copyName = `${base}-kopie${ext}`;
    handleCreateFile(copyName, activeFile.language, activeFile.content);
  };

  const startRename = (file: SheetFile) => {
    setRenamingId(file.id);
    setRenameDraft(file.name);
  };

  const commitRename = () => {
    if (!renamingId) return;
    const trimmed = renameDraft.trim();
    if (!trimmed) {
      setRenamingId(null);
      return;
    }
    const nextLang = detectLanguageFromFilename(trimmed);
    setFiles((prev) =>
      prev.map((f) =>
        f.id === renamingId ? { ...f, name: trimmed, language: nextLang } : f
      )
    );
    setRenamingId(null);
    showToast(`Umbenannt in "${trimmed}"`);
  };

  const handleOpenCodexInEditor = (filename: string, content: string) => {
    const existing = files.find((f) => f.name === filename);
    if (existing) {
      openFile(existing.id);
    } else {
      handleCreateFile(filename, 'markdown', content);
    }
  };

  const handleRestoreStarterSheets = () => {
    setFiles(INITIAL_SHEETS);
    setOpenTabIds(INITIAL_SHEETS.map((f) => f.id));
    setActiveFileId(INITIAL_SHEETS[0].id);
    showToast('Starter-Sheets von Aether wiederhergestellt');
  };

  const openTabs = useMemo(
    () => openTabIds.map((id) => files.find((f) => f.id === id)).filter(Boolean) as SheetFile[],
    [openTabIds, files]
  );

  return (
    <div
      className="flex h-screen w-full flex-col overflow-hidden bg-[#06080d] text-slate-100"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Hidden native file input for loading local files */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".ts,.tsx,.js,.jsx,.mjs,.cjs,.html,.htm,.css,.scss,.json,.md,.txt,.svg,.xml,.yaml,.yml,.csv,.log,text/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* TOP BAR CONTRACT: 3 zones separated by gap-8 */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-8 border-b border-slate-800/90 bg-[#080b12] px-5">
        {/* Zone 1: Single-line Brand Title */}
        <a
          href="#workspace"
          onClick={(e) => {
            e.preventDefault();
            setIsCodexOpen(true);
          }}
          className="font-display whitespace-nowrap shrink-0 text-lg font-bold tracking-tight text-cyan-300 transition-colors hover:text-cyan-200"
        >
          Nexuzcode Sheets
        </a>

        {/* Zone 2: 4 concise single-line nav controls */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Workspace-Navigation">
          <button
            type="button"
            onClick={() => setShowSidebar((s) => !s)}
            className={`whitespace-nowrap shrink-0 text-sm font-medium transition-colors ${
              showSidebar ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Dateien
          </button>
          <button
            type="button"
            onClick={() => setShowInspector((s) => !s)}
            className={`whitespace-nowrap shrink-0 text-sm font-medium transition-colors ${
              showInspector ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Inspektor
          </button>
          <button
            type="button"
            onClick={() => editorRef.current?.openSearch()}
            className="whitespace-nowrap shrink-0 text-sm font-medium text-slate-400 transition-colors hover:text-slate-100"
          >
            Suchen
          </button>
          <button
            type="button"
            onClick={() => setIsCodexOpen(true)}
            className="whitespace-nowrap shrink-0 text-sm font-medium text-slate-400 transition-colors hover:text-slate-100"
          >
            Aether Codex
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="whitespace-nowrap shrink-0 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
          >
            Neue Datei
          </button>
        </div>
      </header>

      {/* WORKSPACE UTILITY TOOLBAR (below top bar) */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-[#0a0f18] px-4 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-slate-700/80 bg-[#0d1421] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-cyan-300"
          >
            <FolderOpen className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
            <span>Datei laden</span>
          </button>

          <button
            type="button"
            disabled={!activeFile}
            onClick={() => {
              if (!activeFile) return;
              downloadFileToDisk(activeFile.name, activeFile.content);
              setFiles((prev) =>
                prev.map((f) => (f.id === activeFile.id ? { ...f, isModified: false } : f))
              );
              showToast(`"${activeFile.name}" heruntergeladen`);
            }}
            className="flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-slate-700/80 bg-[#0d1421] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            <span>Speichern</span>
          </button>

          <button
            type="button"
            disabled={!activeFile}
            onClick={handleDuplicateActive}
            className="hidden items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-slate-700/80 bg-[#0d1421] px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Duplizieren</span>
          </button>

          <button
            type="button"
            onClick={() => editorRef.current?.openSearch()}
            className="flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-slate-700/80 bg-[#0d1421] px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white md:hidden"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Suchen</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {statusNotice && (
            <span className="text-xs font-medium text-emerald-400">{statusNotice}</span>
          )}

          {activeFile && (
            <label className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="sr-only">Syntax-Modus</span>
              <select
                value={activeFile.language}
                onChange={(e) => handleLanguageOverride(e.target.value as SupportedLanguage)}
                aria-label="Syntax-Modus auswählen"
                className="rounded-md border border-slate-700/80 bg-[#070a10] px-2.5 py-1 text-xs font-medium text-cyan-300 focus:border-cyan-400 focus:outline-none"
              >
                {ALL_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {LANGUAGE_META[lang].label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <select
            value={settings.theme}
            onChange={(e) =>
              setSettings((s) => ({ ...s, theme: e.target.value as NeonThemeId }))
            }
            aria-label="Neon-Farbschema wählen"
            className="rounded-md border border-slate-700/80 bg-[#070a10] px-2.5 py-1 text-xs font-medium text-slate-200 focus:border-cyan-400 focus:outline-none"
          >
            <option value="aether-cyan">Neon: Aether Cyan</option>
            <option value="hyperion-violet">Neon: Hyperion Violet</option>
            <option value="matrix-emerald">Neon: Matrix Emerald</option>
          </select>

          <div className="flex items-center rounded-md border border-slate-700/80 bg-[#070a10]">
            <button
              type="button"
              onClick={() =>
                setSettings((s) => ({ ...s, fontSize: Math.max(11, s.fontSize - 1) }))
              }
              className="px-2 py-1 text-xs text-slate-400 hover:text-white"
              aria-label="Schrift verkleinern"
            >
              -
            </button>
            <span className="font-mono-code px-1.5 text-xs text-slate-300">
              {settings.fontSize}px
            </span>
            <button
              type="button"
              onClick={() =>
                setSettings((s) => ({ ...s, fontSize: Math.min(22, s.fontSize + 1) }))
              }
              className="px-2 py-1 text-xs text-slate-400 hover:text-white"
              aria-label="Schrift vergrößern"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSettings((s) => ({ ...s, wordWrap: !s.wordWrap }))}
            aria-pressed={settings.wordWrap}
            className={`flex items-center gap-1 whitespace-nowrap shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
              settings.wordWrap
                ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-300'
                : 'border-slate-700/80 bg-[#070a10] text-slate-400 hover:text-slate-200'
            }`}
          >
            <WrapText className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Umbruch</span>
          </button>
        </div>
      </div>

      {/* MAIN WORKSPACE SPLIT */}
      <div className="relative flex min-h-0 flex-1">
        {/* Drag & Drop overlay */}
        {isDragOver && (
          <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center border-2 border-dashed border-cyan-400 bg-cyan-950/30 backdrop-blur-xs">
            <div className="rounded-xl border border-cyan-400/50 bg-[#090e18] px-6 py-4 text-center shadow-xl">
              <p className="font-display text-base font-semibold text-cyan-300">
                Dateien hier ablegen zum Laden
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Unterstützt TS, JS, TSX, HTML, CSS, JSON, Markdown und Klartext
              </p>
            </div>
          </div>
        )}

        {/* LEFT SIDEBAR: FILE EXPLORER */}
        {showSidebar && (
          <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800/90 bg-[#080c14]">
            <div className="border-b border-slate-800/80 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-slate-300">
                  Workspace-Dateien
                </span>
                <span className="font-mono-code text-xs text-slate-500">
                  {files.length}
                </span>
              </div>
              <div className="relative mt-2.5">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={fileFilter}
                  onChange={(e) => setFileFilter(e.target.value)}
                  placeholder="Dateien filtern..."
                  aria-label="Dateien filtern"
                  className="w-full rounded-md border border-slate-800 bg-[#06080d] py-1.5 pl-8 pr-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-cyan-400/70 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {filteredFiles.length === 0 ? (
                <div className="px-2 py-6 text-center text-xs text-slate-500">
                  Keine passenden Dateien gefunden.
                </div>
              ) : (
                <ul className="space-y-0.5">
                  {filteredFiles.map((file) => {
                    const isActive = file.id === activeFileId;
                    const meta = LANGUAGE_META[file.language];

                    return (
                      <li key={file.id} className="group relative">
                        {renamingId === file.id ? (
                          <div className="px-2 py-1">
                            <input
                              type="text"
                              value={renameDraft}
                              onChange={(e) => setRenameDraft(e.target.value)}
                              onBlur={commitRename}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitRename();
                                if (e.key === 'Escape') setRenamingId(null);
                              }}
                              autoFocus
                              className="w-full rounded border border-cyan-400 bg-[#06080d] px-2 py-1 text-xs text-slate-100 focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div
                            className={`flex items-center justify-between rounded-md px-2.5 py-2 text-xs transition-colors ${
                              isActive
                                ? 'bg-cyan-500/12 text-cyan-200'
                                : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => openFile(file.id)}
                              className="flex min-w-0 flex-1 items-center gap-2 text-left"
                            >
                              <FileCode
                                className={`h-3.5 w-3.5 shrink-0 ${meta.accentClass}`}
                                aria-hidden="true"
                              />
                              <span className="truncate font-medium">
                                {file.name}
                                {file.isModified ? ' *' : ''}
                              </span>
                            </button>

                            <div className="ml-2 flex shrink-0 items-center gap-1">
                              <span
                                className={`font-mono-code text-[11px] group-hover:hidden ${meta.accentClass}`}
                              >
                                {meta.shortLabel}
                              </span>
                              <div className="hidden items-center gap-0.5 group-hover:flex">
                                <button
                                  type="button"
                                  onClick={() => startRename(file)}
                                  className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-cyan-300"
                                  title="Umbenennen"
                                  aria-label={`${file.name} umbenennen`}
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFile(file.id)}
                                  className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-rose-400"
                                  title="Löschen"
                                  aria-label={`${file.name} löschen`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Sidebar Release & Legal Footer */}
            <div className="border-t border-slate-800/80 bg-[#070a10] p-3 text-[11px] leading-relaxed text-slate-400">
              <div className="font-medium text-slate-200">
                {PROJECT_IDENTITY.currentVersion} &apos;{PROJECT_IDENTITY.codename}&apos;
              </div>
              <div className="mt-0.5 text-slate-400">Nexuzcode-DE | MetaNexuz</div>
              <div className="mt-1 flex items-center justify-between text-slate-500">
                <span>GNU GPLv3</span>
                <button
                  type="button"
                  onClick={handleRestoreStarterSheets}
                  className="inline-flex items-center gap-1 text-slate-400 transition-colors hover:text-cyan-300"
                  title="Starter-Dateien wiederherstellen"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* CENTER EDITOR VIEWPORT */}
        <main className="flex min-w-0 flex-1 flex-col bg-[#070a10]">
          {/* Open File Tabs */}
          {openTabs.length > 0 && (
            <div
              className="flex shrink-0 items-center overflow-x-auto border-b border-slate-800/90 bg-[#080c14]"
              role="tablist"
              aria-label="Geöffnete Dateien"
            >
              {openTabs.map((tab) => {
                const isSelected = tab.id === activeFileId;
                const meta = LANGUAGE_META[tab.language];
                return (
                  <div
                    key={tab.id}
                    role="tab"
                    aria-selected={isSelected}
                    className={`group flex shrink-0 items-center gap-2 border-r border-slate-800/80 px-3.5 py-2.5 text-xs transition-colors ${
                      isSelected
                        ? 'border-b-2 border-b-cyan-400 bg-[#070a10] text-slate-100'
                        : 'bg-[#090d16] text-slate-400 hover:bg-[#0b101b] hover:text-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFileId(tab.id)}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <span className={`font-mono-code text-[11px] ${meta.accentClass}`}>
                        {meta.shortLabel}
                      </span>
                      <span className="max-w-[160px] truncate font-medium">
                        {tab.name}
                        {tab.isModified ? ' *' : ''}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCloseTab(tab.id)}
                      className="rounded p-0.5 text-slate-500 opacity-70 transition-colors hover:bg-slate-800 hover:text-slate-100 group-hover:opacity-100"
                      aria-label={`Tab ${tab.name} schließen`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Editor + Optional Inspector */}
          <div className="flex min-h-0 flex-1">
            {activeFile ? (
              <>
                <CodeEditorPane
                  ref={editorRef}
                  file={activeFile}
                  settings={settings}
                  onChangeContent={handleContentChange}
                  onCursorChange={setCursorInfo}
                />
                {showInspector && (
                  <SideInspectorPane
                    file={activeFile}
                    onJumpToLine={(line) => editorRef.current?.scrollToLine(line)}
                    onClose={() => setShowInspector(false)}
                  />
                )}
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="max-w-md space-y-4 rounded-xl border border-slate-800 bg-[#0a0f18] p-8">
                  <FilePlus2 className="mx-auto h-8 w-8 text-cyan-400" aria-hidden="true" />
                  <h2 className="font-display text-lg font-semibold text-slate-100">
                    Kein Sheet geöffnet
                  </h2>
                  <p className="text-sm text-slate-400">
                    Erstelle eine neue Code-Datei, lade eine Datei von deinem Gerät oder wähle
                    eines der vorhandenen Sheets aus der Seitenleiste.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsNewModalOpen(true)}
                      className="whitespace-nowrap rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
                    >
                      Neue Datei erstellen
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="whitespace-nowrap rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-cyan-300"
                    >
                      Lokale Datei laden
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CLEAN EDITOR STATUS & COPYRIGHT FOOTER */}
      <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-800/90 bg-[#080b12] px-4 py-1.5 text-[11px] text-slate-400">
        <div className="flex items-center gap-3 overflow-hidden">
          {activeFile ? (
            <>
              <span className="font-mono-code whitespace-nowrap text-cyan-300">
                Zeile {cursorInfo.line}, Spalte {cursorInfo.column}
              </span>
              {cursorInfo.selectionLength > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-code whitespace-nowrap">
                    {cursorInfo.selectionLength} ausgewählt
                  </span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="font-mono-code whitespace-nowrap">
                {cursorInfo.totalLines} Zeilen
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-code whitespace-nowrap">
                {formatBytes(activeFile.content)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap">
                {LANGUAGE_META[activeFile.language].label}
              </span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span className="hidden whitespace-nowrap sm:inline">UTF-8</span>
            </>
          ) : (
            <span>Bereit</span>
          )}
        </div>

        <div className="hidden items-center gap-2 truncate text-slate-500 md:flex">
          <span>{PROJECT_IDENTITY.copyright}</span>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => setIsCodexOpen(true)}
            className="text-slate-400 transition-colors hover:text-cyan-300"
          >
            GNU GPLv3 & Release-Leitfaden
          </button>
        </div>
      </footer>

      {/* MODALS */}
      <NewFileModal
        isOpen={isNewModalOpen}
        existingNames={files.map((f) => f.name)}
        onClose={() => setIsNewModalOpen(false)}
        onCreate={handleCreateFile}
      />

      <AetherCodexModal
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
        onOpenInEditor={handleOpenCodexInEditor}
      />
    </div>
  );
}
