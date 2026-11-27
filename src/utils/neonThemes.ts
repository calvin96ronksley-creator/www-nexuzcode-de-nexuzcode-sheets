import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { NeonThemeId } from '../types/sheets';

interface ThemePalette {
  bg: string;
  gutterBg: string;
  gutterText: string;
  gutterActiveText: string;
  activeLine: string;
  selection: string;
  cursor: string;
  border: string;
  keyword: string;
  control: string;
  string: string;
  number: string;
  functionName: string;
  typeName: string;
  variable: string;
  property: string;
  operator: string;
  comment: string;
  tag: string;
  attribute: string;
  heading: string;
  invalid: string;
}

const PALETTES: Record<NeonThemeId, ThemePalette> = {
  'aether-cyan': {
    bg: '#070a10',
    gutterBg: '#070a10',
    gutterText: '#475569',
    gutterActiveText: '#22d3ee',
    activeLine: 'rgba(34, 211, 238, 0.05)',
    selection: 'rgba(0, 240, 255, 0.18)',
    cursor: '#00f0ff',
    border: '#131d2e',
    keyword: '#c084fc',
    control: '#f472b6',
    string: '#34d399',
    number: '#fbbf24',
    functionName: '#00f0ff',
    typeName: '#38bdf8',
    variable: '#e2e8f0',
    property: '#7dd3fc',
    operator: '#94a3b8',
    comment: '#64748b',
    tag: '#22d3ee',
    attribute: '#c084fc',
    heading: '#00f0ff',
    invalid: '#fb7185',
  },
  'hyperion-violet': {
    bg: '#08070f',
    gutterBg: '#08070f',
    gutterText: '#524f6e',
    gutterActiveText: '#e879f9',
    activeLine: 'rgba(217, 70, 239, 0.06)',
    selection: 'rgba(217, 70, 239, 0.2)',
    cursor: '#e879f9',
    border: '#1c1833',
    keyword: '#e879f9',
    control: '#fb7185',
    string: '#38bdf8',
    number: '#facc15',
    functionName: '#a78bfa',
    typeName: '#22d3ee',
    variable: '#f1f5f9',
    property: '#c4b5fd',
    operator: '#94a3b8',
    comment: '#6d698a',
    tag: '#f472b6',
    attribute: '#38bdf8',
    heading: '#e879f9',
    invalid: '#f43f5e',
  },
  'matrix-emerald': {
    bg: '#050a08',
    gutterBg: '#050a08',
    gutterText: '#3f5f53',
    gutterActiveText: '#10b981',
    activeLine: 'rgba(16, 185, 129, 0.06)',
    selection: 'rgba(16, 185, 129, 0.2)',
    cursor: '#34d399',
    border: '#10241c',
    keyword: '#34d399',
    control: '#2dd4bf',
    string: '#a3e635',
    number: '#fbbf24',
    functionName: '#22d3ee',
    typeName: '#5eead4',
    variable: '#e2f2ea',
    property: '#6ee7b7',
    operator: '#6b8f80',
    comment: '#4c7061',
    tag: '#34d399',
    attribute: '#a3e635',
    heading: '#34d399',
    invalid: '#fb7185',
  },
};

export function createNeonCodeMirrorTheme(themeId: NeonThemeId, fontSize: number): Extension {
  const p = PALETTES[themeId];

  const editorTheme = EditorView.theme(
    {
      '&': {
        color: p.variable,
        backgroundColor: p.bg,
        fontSize: `${fontSize}px`,
        lineHeight: '1.65',
      },
      '.cm-content': {
        caretColor: p.cursor,
        padding: '16px 0',
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: p.cursor,
        borderLeftWidth: '2px',
      },
      '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
        {
          backgroundColor: p.selection,
        },
      '.cm-panels': {
        backgroundColor: '#0b101b',
        color: '#e2e8f0',
        borderTop: `1px solid ${p.border}`,
        borderBottom: `1px solid ${p.border}`,
      },
      '.cm-panels.cm-panels-top': {
        borderBottom: `1px solid ${p.border}`,
      },
      '.cm-search': {
        padding: '8px 14px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        alignItems: 'center',
        fontSize: '12px',
        fontFamily: 'var(--font-sans)',
      },
      '.cm-textfield': {
        backgroundColor: '#06080d',
        color: '#f8fafc',
        border: '1px solid #1e293b',
        borderRadius: '6px',
        padding: '4px 8px',
        outline: 'none',
      },
      '.cm-textfield:focus': {
        borderColor: p.cursor,
      },
      '.cm-button': {
        backgroundImage: 'none',
        backgroundColor: '#111827',
        color: '#e2e8f0',
        border: '1px solid #1e293b',
        borderRadius: '6px',
        padding: '4px 10px',
        cursor: 'pointer',
      },
      '.cm-button:hover': {
        borderColor: p.cursor,
        color: '#ffffff',
      },
      '.cm-gutters': {
        backgroundColor: p.gutterBg,
        color: p.gutterText,
        borderRight: `1px solid ${p.border}`,
        minWidth: '52px',
      },
      '.cm-lineNumbers .cm-gutterElement': {
        padding: '0 12px 0 8px',
        fontVariantNumeric: 'tabular-nums',
      },
      '.cm-activeLineGutter': {
        backgroundColor: p.activeLine,
        color: p.gutterActiveText,
        fontWeight: '600',
      },
      '.cm-activeLine': {
        backgroundColor: p.activeLine,
      },
      '.cm-foldGutter .cm-gutterElement': {
        padding: '0 6px',
        cursor: 'pointer',
        color: p.gutterText,
      },
      '.cm-matchingBracket, .cm-nonmatchingBracket': {
        backgroundColor: 'rgba(34, 211, 238, 0.16)',
        outline: `1px solid ${p.cursor}`,
        borderRadius: '2px',
      },
      '.cm-selectionMatch': {
        backgroundColor: 'rgba(168, 85, 247, 0.18)',
        borderRadius: '2px',
      },
      '.cm-tooltip': {
        backgroundColor: '#0d131f',
        border: `1px solid ${p.border}`,
        borderRadius: '8px',
        color: '#e2e8f0',
      },
    },
    { dark: true }
  );

  const highlightStyle = HighlightStyle.define([
    { tag: tags.keyword, color: p.keyword, fontWeight: '500' },
    { tag: [tags.controlKeyword, tags.moduleKeyword, tags.operatorKeyword], color: p.control, fontWeight: '500' },
    { tag: [tags.name, tags.deleted, tags.character, tags.macroName], color: p.variable },
    { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: p.functionName },
    { tag: [tags.propertyName, tags.definition(tags.propertyName)], color: p.property },
    { tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)], color: p.number },
    { tag: [tags.definition(tags.name), tags.separator], color: p.variable },
    { tag: [tags.typeName, tags.className, tags.namespace, tags.changed, tags.annotation, tags.modifier, tags.self], color: p.typeName },
    { tag: [tags.number, tags.bool, tags.null, tags.atom], color: p.number },
    { tag: [tags.operator, tags.derefOperator], color: p.operator },
    { tag: [tags.string, tags.special(tags.string), tags.regexp], color: p.string },
    { tag: [tags.comment, tags.lineComment, tags.blockComment, tags.docComment], color: p.comment, fontStyle: 'italic' },
    { tag: tags.tagName, color: p.tag },
    { tag: tags.attributeName, color: p.attribute },
    { tag: tags.attributeValue, color: p.string },
    { tag: tags.heading, color: p.heading, fontWeight: '700' },
    { tag: tags.strong, fontWeight: '700', color: '#f8fafc' },
    { tag: tags.emphasis, fontStyle: 'italic', color: p.property },
    { tag: tags.link, color: p.functionName, textDecoration: 'underline' },
    { tag: tags.invalid, color: p.invalid, textDecoration: 'underline' },
  ]);

  return [editorTheme, syntaxHighlighting(highlightStyle)];
}
