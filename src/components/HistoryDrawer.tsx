import React, { useState } from 'react';
import { HistoryItem } from '../types/calculator';
import { X, Trash2, Download, Copy, Check, CornerDownLeft } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  onSelectExpression: (expr: string) => void;
  onSelectResult: (result: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onSelectExpression,
  onSelectResult,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExport = () => {
    if (history.length === 0) return;
    const lines = history.map(
      (h) => `[${new Date(h.timestamp).toLocaleTimeString()}] ${h.expression} = ${h.result}`
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnica_history_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col p-4 sm:p-5 overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Calculation Tape</h2>
            <p className="text-xs text-slate-400">History of expressions and evaluations</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between py-2.5 border-b border-slate-800/80 text-xs">
          <span className="font-mono text-slate-400">
            {history.length} {history.length === 1 ? 'entry' : 'entries'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={history.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button
              onClick={onClearHistory}
              disabled={history.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* History Tape List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 py-3 pr-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-xs font-mono text-slate-500">
              No calculations recorded yet.
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 hover:border-slate-700 transition-colors font-mono"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    <span>·</span>
                    <span className="text-cyan-400/80">{item.angleMode}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(item.id, item.result)}
                      title="Copy result"
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        onSelectExpression(item.expression);
                        onClose();
                      }}
                      title="Load formula into calculator"
                      className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expression */}
                <div
                  onClick={() => {
                    onSelectExpression(item.expression);
                    onClose();
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer break-all"
                >
                  {item.expression}
                </div>

                {/* Result */}
                <div
                  onClick={() => {
                    onSelectResult(item.result);
                    onClose();
                  }}
                  className="text-base font-bold text-white hover:text-cyan-300 cursor-pointer text-right break-all"
                >
                  = {item.result}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
