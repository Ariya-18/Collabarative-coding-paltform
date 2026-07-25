import { Loader2, Terminal, Clock, Database } from "lucide-react";

const OutputPanel = ({ output, running, input, onInputChange }) => {
  return (
    <div className="flex h-full flex-col bg-[#111827]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <Terminal size={14} className="text-[#9CA3AF]" />
        <h3 className="text-xs font-semibold text-white">Console</h3>
      </div>

      <div className="border-b border-white/10 p-3">
        <label className="mb-1.5 block text-xs text-[#9CA3AF]">Custom Input (stdin)</label>
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          rows={3}
          placeholder="Optional input for your program"
          className="w-full resize-none rounded-lg border border-white/10 bg-[#0B0F19] px-3 py-2 text-xs text-white placeholder:text-[#9CA3AF]/50 outline-none focus:border-[#6366F1]"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
        {running && (
          <div className="flex items-center gap-2 text-[#9CA3AF]">
            <Loader2 size={14} className="animate-spin" />
            Running your code...
          </div>
        )}

        {!running && !output && (
          <p className="text-[#9CA3AF]">Click "Run" to see output here.</p>
        )}

        {!running && output && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  output.status === "Accepted"
                    ? "bg-[#22C55E]/20 text-[#22C55E]"
                    : "bg-[#EF4444]/20 text-[#EF4444]"
                }`}
              >
                {output.status}
              </span>
              {output.time && (
                <span className="flex items-center gap-1 text-[#9CA3AF]">
                  <Clock size={11} /> {output.time}s
                </span>
              )}
              {output.memory && (
                <span className="flex items-center gap-1 text-[#9CA3AF]">
                  <Database size={11} /> {output.memory} KB
                </span>
              )}
            </div>

            {output.stdout && (
              <div>
                <p className="mb-1 text-[#9CA3AF]">stdout</p>
                <pre className="whitespace-pre-wrap rounded-lg bg-[#0B0F19] p-2.5 text-white">
                  {output.stdout}
                </pre>
              </div>
            )}

            {output.compileOutput && (
              <div>
                <p className="mb-1 text-[#F59E0B]">compile error</p>
                <pre className="whitespace-pre-wrap rounded-lg bg-[#0B0F19] p-2.5 text-[#F59E0B]">
                  {output.compileOutput}
                </pre>
              </div>
            )}

            {output.stderr && (
              <div>
                <p className="mb-1 text-[#EF4444]">stderr</p>
                <pre className="whitespace-pre-wrap rounded-lg bg-[#0B0F19] p-2.5 text-[#EF4444]">
                  {output.stderr}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;