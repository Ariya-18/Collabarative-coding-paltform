import { Terminal, Loader2 } from "lucide-react";

const OutputPanel = ({ running, result }) => {
  const isAccepted = result?.status === "Accepted";

  return (
    <div className="flex flex-col h-full bg-[#0B0F19] border-t border-white/10">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 text-[#9CA3AF] text-xs font-medium uppercase tracking-wide">
        <Terminal size={14} />
        Output
        {running && <Loader2 size={14} className="animate-spin ml-1" />}
      </div>
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {!result && !running && (
          <p className="text-[#9CA3AF]">Run your code to see output here.</p>
        )}
        {running && (
          <p className="text-[#9CA3AF]">Running{result?.by ? ` by ${result.by}` : ""}...</p>
        )}
        {result && !running && (
          <>
            <p className={`mb-2 ${isAccepted ? "text-[#22C55E]" : "text-[#F59E0B]"}`}>
              Status: {result.status}
            </p>
            {result.compile_output && (
              <pre className="text-[#EF4444] whitespace-pre-wrap mb-2">{result.compile_output}</pre>
            )}
            {result.stdout && (
              <pre className="text-white whitespace-pre-wrap mb-2">{result.stdout}</pre>
            )}
            {result.stderr && (
              <pre className="text-[#EF4444] whitespace-pre-wrap">{result.stderr}</pre>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;