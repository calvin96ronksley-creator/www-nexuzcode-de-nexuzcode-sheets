import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Compartment, EditorState } from '@codemirror/state';
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
  indentUnit,
} from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { highlightSelectionMatches, openSearchPanel, searchKeymap } from '@codemirror/search';
import { EditorCursorInfo, EditorSettings, SheetFile } from '../types/sheets';
import { getCodeMirrorLanguageExtension } from '../utils/languageUtils';
import { createNeonCodeMirrorTheme } from '../utils/neonThemes';

export interface CodeEditorHandle {
  openSearch: () => void;
  focusEditor: () => void;
  scrollToLine: (lineNumber: number) => void;
}

interface CodeEditorPaneProps {
  file: SheetFile;
  settings: EditorSettings;
  onChangeContent: (fileId: string, nextContent: string) => void;
  onCursorChange: (info: EditorCursorInfo) => void;
}

export const CodeEditorPane = forwardRef<CodeEditorHandle, CodeEditorPaneProps>(
  function CodeEditorPane({ file, settings, onChangeContent, onCursorChange }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const viewRef = useRef<EditorView | null>(null);

    const languageCompartmentRef = useRef(new Compartment());
    const themeCompartmentRef = useRef(new Compartment());
    const wrapCompartmentRef = useRef(new Compartment());
    const tabSizeCompartmentRef = useRef(new Compartment());

    const activeFileIdRef = useRef(file.id);
    const onChangeRef = useRef(onChangeContent);
    const onCursorRef = useRef(onCursorChange);

    onChangeRef.current = onChangeContent;
    onCursorRef.current = onCursorChange;

    useImperativeHandle(ref, () => ({
      openSearch: () => {
        if (viewRef.current) {
          openSearchPanel(viewRef.current);
          viewRef.current.focus();
        }
      },
      focusEditor: () => {
        viewRef.current?.focus();
      },
      scrollToLine: (lineNumber: number) => {
        const view = viewRef.current;
        if (!view) return;
        const clamped = Math.max(1, Math.min(lineNumber, view.state.doc.lines));
        const line = view.state.doc.line(clamped);
        view.dispatch({
          selection: { anchor: line.from },
          effects: EditorView.scrollIntoView(line.from, { y: 'center' }),
        });
        view.focus();
      },
    }));

    // Mount CodeMirror once
    useEffect(() => {
      if (!containerRef.current) return;

      const emitCursor = (state: EditorState) => {
        const sel = state.selection.main;
        const lineObj = state.doc.lineAt(sel.head);
        onCursorRef.current({
          line: lineObj.number,
          column: sel.head - lineObj.from + 1,
          selectionLength: Math.abs(sel.to - sel.from),
          totalLines: state.doc.lines,
          totalChars: state.doc.length,
        });
      };

      const startState = EditorState.create({
        doc: file.content,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightSpecialChars(),
          history(),
          foldGutter(),
          drawSelection(),
          rectangularSelection(),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          highlightActiveLine(),
          highlightSelectionMatches(),
          keymap.of([
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...searchKeymap,
            ...historyKeymap,
            ...foldKeymap,
            indentWithTab,
          ]),
          languageCompartmentRef.current.of(getCodeMirrorLanguageExtension(file.language)),
          themeCompartmentRef.current.of(
            createNeonCodeMirrorTheme(settings.theme, settings.fontSize)
          ),
          wrapCompartmentRef.current.of(settings.wordWrap ? EditorView.lineWrapping : []),
          tabSizeCompartmentRef.current.of(indentUnit.of(' '.repeat(settings.tabSize))),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const nextDoc = update.state.doc.toString();
              onChangeRef.current(activeFileIdRef.current, nextDoc);
            }
            if (update.selectionSet || update.docChanged) {
              emitCursor(update.state);
            }
          }),
        ],
      });

      const view = new EditorView({
        state: startState,
        parent: containerRef.current,
      });

      viewRef.current = view;
      emitCursor(startState);

      return () => {
        view.destroy();
        viewRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Switch document cleanly when active file changes or external reset occurs
    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;

      const fileChanged = activeFileIdRef.current !== file.id;
      activeFileIdRef.current = file.id;
      const currentText = view.state.doc.toString();

      if (fileChanged || currentText !== file.content) {
        view.dispatch({
          changes: { from: 0, to: currentText.length, insert: file.content },
          selection: fileChanged ? { anchor: 0 } : undefined,
        });
      }

      const sel = view.state.selection.main;
      const lineObj = view.state.doc.lineAt(sel.head);
      onCursorRef.current({
        line: lineObj.number,
        column: sel.head - lineObj.from + 1,
        selectionLength: Math.abs(sel.to - sel.from),
        totalLines: view.state.doc.lines,
        totalChars: view.state.doc.length,
      });
    }, [file.id, file.content]);

    // Reconfigure syntax language only when file id or language changes
    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({
        effects: languageCompartmentRef.current.reconfigure(
          getCodeMirrorLanguageExtension(file.language)
        ),
      });
    }, [file.id, file.language]);

    // Update theme & font size dynamically
    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({
        effects: themeCompartmentRef.current.reconfigure(
          createNeonCodeMirrorTheme(settings.theme, settings.fontSize)
        ),
      });
    }, [settings.theme, settings.fontSize]);

    // Update word wrapping dynamically
    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({
        effects: wrapCompartmentRef.current.reconfigure(
          settings.wordWrap ? EditorView.lineWrapping : []
        ),
      });
    }, [settings.wordWrap]);

    // Update tab size dynamically
    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({
        effects: tabSizeCompartmentRef.current.reconfigure(
          indentUnit.of(' '.repeat(settings.tabSize))
        ),
      });
    }, [settings.tabSize]);

    return (
      <div
        ref={containerRef}
        className="nexuz-cm-wrapper relative flex-1 bg-[#070a10]"
        aria-label={`Code-Editor für ${file.name}`}
      />
    );
  }
);
