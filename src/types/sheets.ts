export type SupportedLanguage =
  | 'typescript'
  | 'javascript'
  | 'tsx'
  | 'jsx'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown'
  | 'plaintext';

export type NeonThemeId = 'aether-cyan' | 'hyperion-violet' | 'matrix-emerald';

export type ReleaseStage = 'Alpha' | 'Beta' | 'RC' | 'Stable' | 'LTS';

export interface SheetFile {
  id: string;
  name: string;
  language: SupportedLanguage;
  content: string;
  updatedAt: number;
  createdAt: number;
  isModified?: boolean;
}

export interface ReleaseCycleEntry {
  letter: string;
  majorVersion: string;
  codename: string;
  domainOrigin: string;
  focusArea: string;
  status: 'active' | 'planned';
}

export interface EditorCursorInfo {
  line: number;
  column: number;
  selectionLength: number;
  totalLines: number;
  totalChars: number;
}

export interface EditorSettings {
  theme: NeonThemeId;
  fontSize: number;
  wordWrap: boolean;
  tabSize: number;
  showMinimapOutline: boolean;
}
