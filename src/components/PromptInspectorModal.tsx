import React, { useState } from 'react';
import { X, Sparkles, Shield, Cpu, Layers, Check } from 'lucide-react';
import { getModelSystemInstruction } from '../constants/prompt';
import { CLAUDE_MODELS } from '../constants/models';
import { ClaudeModelId } from '../types';

interface PromptInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModelName: string;
}

export const PromptInspectorModal: React.FC<PromptInspectorModalProps> = ({
  isOpen,
  onClose,
  activeModelName,
}) => {
  const initialModel =
    CLAUDE_MODELS.find((m) => m.name === activeModelName)?.id || 'claude-fable-5-1';
  const [selectedModelId, setSelectedModelId] = useState<ClaudeModelId>(initialModel);

  if (!isOpen) return null;

  const currentModelInfo =
    CLAUDE_MODELS.find((m) => m.id === selectedModelId) || CLAUDE_MODELS[0];
  const isFable = currentModelInfo.id === 'claude-fable-5-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[85vh] bg-[#FAF9F5] dark:bg-[#1C1B18] rounded-2xl shadow-2xl border border-[#DDD8CE] dark:border-[#38352F] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 px-5 border-b border-[#E5E1D8] dark:border-[#2C2925] flex items-center justify-between bg-white dark:bg-[#22201D]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: currentModelInfo.accent }}
            >
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm text-[#1A1917] dark:text-[#EDE8E0]">
                Claude Architecture & System Instruction Inspector
              </h2>
              <span className="text-[11px] text-[#7A766F] dark:text-[#9A968D]">
                Anthropic Models Architecture • Dedicated Instructions Per Model
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A766F] hover:bg-[#EAE6DD] dark:hover:bg-[#2F2C27] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Model Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-[#E5E1D8] dark:border-[#2C2925] bg-[#FAF9F5] dark:bg-[#1E1D1A] flex items-center gap-1.5 overflow-x-auto">
          {CLAUDE_MODELS.map((m) => {
            const isTabActive = m.id === selectedModelId;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedModelId(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isTabActive
                    ? 'bg-[#1C1A17] dark:bg-white text-white dark:text-[#1C1A17] shadow-xs'
                    : 'bg-[#ECE8DF] dark:bg-[#2B2925] text-[#69655D] dark:text-[#A7A299] hover:text-[#1C1A17] dark:hover:text-white'
                }`}
              >
                <span>{m.name}</span>
                {m.id === 'claude-fable-5-1' && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-300 font-bold">
                    TOP
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Tabs / Info */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Architecture Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white dark:bg-[#23211D] border border-[#E0DCD4] dark:border-[#38352F] space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#1A1917] dark:text-[#EDE8E0]">
                <Sparkles
                  className="w-3.5 h-3.5"
                  style={{ color: currentModelInfo.accent }}
                />
                <span>Tier & Status</span>
              </div>
              <p className="text-[11px] text-[#7A766F] dark:text-[#9A968D]">
                <strong>{currentModelInfo.tier}</strong>
                {isFable && ' • Ranked #1 Pinnacle Flagship'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-[#23211D] border border-[#E0DCD4] dark:border-[#38352F] space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#1A1917] dark:text-[#EDE8E0]">
                <Cpu className="w-3.5 h-3.5 text-blue-500" />
                <span>Thinking Level</span>
              </div>
              <p className="text-[11px] text-[#7A766F] dark:text-[#9A968D]">
                {currentModelInfo.thinkingLevel}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-[#23211D] border border-[#E0DCD4] dark:border-[#38352F] space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#1A1917] dark:text-[#EDE8E0]">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                <span>Reasoning Power & Speed</span>
              </div>
              <p className="text-[11px] text-[#7A766F] dark:text-[#9A968D]">
                {currentModelInfo.reasoningPower} • {currentModelInfo.speed}
              </p>
            </div>
          </div>

          {/* System Instructions Viewer */}
          <div className="space-y-1.5">
            <div className="font-semibold text-xs text-[#1A1917] dark:text-[#EDE8E0] flex items-center justify-between">
              <span>System Prompt For {currentModelInfo.name}</span>
              <span className="text-[10px] text-[#8C877D] font-mono">
                {currentModelInfo.tier}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#1C1A17] text-[#EDEAE3] font-mono text-[11px] leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap border border-[#38352F]">
              {getModelSystemInstruction(selectedModelId)}
            </div>
          </div>

          {/* Anthropic Guidelines Summary */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#23211D] border border-[#E0DCD4] dark:border-[#38352F] space-y-2 text-[#4A4741] dark:text-[#C5C0B6]">
            <div className="font-semibold text-xs text-[#1A1917] dark:text-white flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-green-600" />
              <span>Key Behavioral & Safety Guarantees</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li>
                <strong>Critical Child Safety:</strong> Refuses any romantic/sexual content involving minors, states principle rather than detection mechanics.
              </li>
              <li>
                <strong>Copyright Protection:</strong> Refuses verbatim song lyrics or poetry after 1929, offers to invent original works instead.
              </li>
              <li>
                <strong>Tone & Hierarchy:</strong> Warm, constructive, kind, avoids filler words like "genuinely", "honestly", "straightforward". Uses full markdown headings, underlines, tables, and blockquotes.
              </li>
              <li>
                <strong>Ad-free:</strong> "Claude products are ad-free."
              </li>
              <li>
                <strong>Knowledge Cutoff:</strong> End of June 2026.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
