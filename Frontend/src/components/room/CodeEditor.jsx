import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ code, language, onChange, onCursorChange, cursors = {}, typingUsers = {} }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  // Track Monaco mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Track local cursor position change
    editor.onDidChangeCursorPosition(() => {
      const position = editor.getPosition();
      const selection = editor.getSelection();
      if (onCursorChange && position && selection) {
        onCursorChange({
          lineNumber: position.lineNumber,
          column: position.column,
          selection: {
            startLineNumber: selection.startLineNumber,
            startColumn: selection.startColumn,
            endLineNumber: selection.endLineNumber,
            endColumn: selection.endColumn,
          },
        });
      }
    });

    // Track local selection highlight change
    editor.onDidChangeCursorSelection(() => {
      const position = editor.getPosition();
      const selection = editor.getSelection();
      if (onCursorChange && position && selection) {
        onCursorChange({
          lineNumber: position.lineNumber,
          column: position.column,
          selection: {
            startLineNumber: selection.startLineNumber,
            startColumn: selection.startColumn,
            endLineNumber: selection.endLineNumber,
            endColumn: selection.endColumn,
          },
        });
      }
    });
  };

  // Sync remote cursors and selections
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    const newDecorations = [];

    Object.entries(cursors).forEach(([userId, { user, position }]) => {
      if (!position) return;
      const { lineNumber, column, selection } = position;

      // Color scheme palette for remote user styles
      const colors = ["#6366F1", "#8B5CF6", "#06B6D4", "#22C55E", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6"];
      const getUserColor = (id) => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
          hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
      };

      const color = getUserColor(userId);
      const styleId = `cursor-style-${userId}`;

      // Dynamic CSS injection for beautiful custom cursors and selections
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.innerHTML = `
          .remote-cursor-${userId} {
            border-left: 2px solid ${color} !important;
            margin-left: -1px;
          }
          .remote-cursor-${userId}::after {
            content: "${user.name}";
            position: absolute;
            top: -16px;
            left: 0;
            background: ${color};
            color: #fff;
            font-size: 9px;
            padding: 1px 4px;
            border-radius: 2px;
            white-space: nowrap;
            pointer-events: none;
            font-family: Inter, sans-serif;
            font-weight: 500;
            opacity: 0.8;
            z-index: 10;
          }
          .remote-selection-${userId} {
            background-color: ${color}33 !important;
          }
        `;
        document.head.appendChild(style);
      }

      // 1. Highlight Selection Range (if something is highlighted)
      if (
        selection &&
        (selection.startLineNumber !== selection.endLineNumber ||
          selection.startColumn !== selection.endColumn)
      ) {
        newDecorations.push({
          range: new monaco.Range(
            selection.startLineNumber,
            selection.startColumn,
            selection.endLineNumber,
            selection.endColumn
          ),
          options: {
            className: `remote-selection-${userId}`,
          },
        });
      }

      // 2. Render Cursor Point
      newDecorations.push({
        range: new monaco.Range(lineNumber, column, lineNumber, column),
        options: {
          className: `remote-cursor-${userId}`,
          hoverMessage: { value: `**${user.name}**` },
        },
      });
    });

    // Replace current decorations list with new one
    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );
  }, [cursors]);

  // Clean up injected style tags on unmount
  useEffect(() => {
    return () => {
      // Find all dynamically injected style tags of this structure
      const injectedStyles = document.querySelectorAll('[id^="cursor-style-"]');
      injectedStyles.forEach((style) => style.remove());
    };
  }, []);

  return (
    <div className="flex h-full flex-col bg-[#0B0F19]">
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(value) => onChange(value ?? "")}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
            padding: { top: 12 },
            scrollBeyondLastLine: false,
          }}
        />
      </div>
      {/* Sleek status bar for typing indicators and language info */}
      <div className="flex h-6 items-center justify-between border-t border-white/5 bg-[#111827] px-4 text-[10px] text-[#9CA3AF]">
        <div className="flex items-center gap-2">
          {Object.keys(typingUsers).length > 0 ? (
            <div className="flex items-center gap-1.5 text-cyan-400 animate-pulse font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>
                {Object.values(typingUsers).join(", ")}
                {Object.keys(typingUsers).length === 1 ? " is typing..." : " are typing..."}
              </span>
            </div>
          ) : (
            <span className="text-white/40">Editor Ready</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>LF</span>
          <span>UTF-8</span>
          <span className="font-semibold text-white/60">{language.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;