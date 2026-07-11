import Editor from "@monaco-editor/react";

const CodeEditor = ({ code, language, onChange }) => {
  return (
    <Editor
      height="100%"
      language={language}
      theme="vs-dark"
      value={code}
      onChange={(value) => onChange(value ?? "")}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
        padding: { top: 12 },
        scrollBeyondLastLine: false,
      }}
    />
  );
};

export default CodeEditor;