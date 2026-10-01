import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  Code2,
  Cpu,
  Layers,
  CheckCircle2,
  FileSpreadsheet,
  Globe,
  Database,
  ArrowRight,
  Shield,
  Laptop,
  Compass,
} from 'lucide-react';
import { CLAUDE_MODELS } from '../constants/models';
import { ClaudeModelId } from '../types';

interface AbilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel: ClaudeModelId;
  onSelectModel: (modelId: ClaudeModelId) => void;
}

export const AbilitiesModal: React.FC<AbilitiesModalProps> = ({
  isOpen,
  onClose,
  currentModel,
  onSelectModel,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'tools' | 'artifacts'>('matrix');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#FAF9F5] dark:bg-[#1C1B18] rounded-3xl shadow-2xl border border-[#DDD8CE] dark:border-[#38352F] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 px-5 border-b border-[#E5E1D8] dark:border-[#2C2925] flex items-center justify-between bg-white dark:bg-[#22201D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D97757] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm text-[#1A1917] dark:text-[#EDE8E0]">
                Claude Models & Abilities Matrix
              </h2>
              <span className="text-[11px] text-[#7A766F] dark:text-[#9A968D]">
                Anthropic Claude 5 Lineup • Fable 5.1 Pinnacle Top Flagship
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

        {/* Tab Switcher */}
        <div className="px-5 py-2.5 border-b border-[#E5E1D8] dark:border-[#2C2925] bg-white dark:bg-[#201F1C] flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'matrix'
                ? 'bg-[#1C1A17] dark:bg-white text-white dark:text-[#1C1A17]'
                : 'text-[#69655D] dark:text-[#A7A299] hover:bg-[#ECE8DF] dark:hover:bg-[#2B2925]'
            }`}
          >
            All Models Compared (5)
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'tools'
                ? 'bg-[#1C1A17] dark:bg-white text-white dark:text-[#1C1A17]'
                : 'text-[#69655D] dark:text-[#A7A299] hover:bg-[#ECE8DF] dark:hover:bg-[#2B2925]'
            }`}
          >
            Agentic Tools & Ecosystem
          </button>
          <button
            onClick={() => setActiveTab('artifacts')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'artifacts'
                ? 'bg-[#1C1A17] dark:bg-white text-white dark:text-[#1C1A17]'
                : 'text-[#69655D] dark:text-[#A7A299] hover:bg-[#ECE8DF] dark:hover:bg-[#2B2925]'
            }`}
          >
            Artifacts & File Export Capabilities
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#8F5520] dark:text-amber-200 flex items-center gap-3">
                <span className="text-xl">🏆</span>
                <div>
                  <div className="font-bold text-xs">Claude Fable 5.1 is Ranked #1 Top & Best Flagship</div>
                  <div className="text-[11px] opacity-90">
                    Sits above Opus 5 in capability with supreme Level 5 reasoning, advanced dual-use safety measures, and autonomous code execution.
                  </div>
                </div>
              </div>

              {/* Models Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CLAUDE_MODELS.map((m) => {
                  const isSelected = m.id === currentModel;
                  const isFable = m.id === 'claude-fable-5-1';
                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isFable
                          ? 'border-[#D97757] bg-gradient-to-br from-[#FFFBF8] to-[#FBF3EC] dark:from-[#2A231E] dark:to-[#221C18] shadow-sm'
                          : 'border-[#E0DCD4] dark:border-[#38352F] bg-white dark:bg-[#23211D]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-sm text-[#1A1917] dark:text-white">
                              {m.name}
                            </span>
                            {isFable ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/40">
                                ★ TOP & BEST
                              </span>
                            ) : (
                              <span
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                                style={{
                                  backgroundColor: `${m.accent}15`,
                                  color: m.accent,
                                }}
                              >
                                {m.tier}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-[#524E46] dark:text-[#C5C0B6] mb-3 leading-relaxed">
                          {m.description}
                        </p>

                        <div className="space-y-1.5 pt-2 border-t border-[#EAE6DE] dark:border-[#322F2A] text-[11px]">
                          <div className="flex items-center justify-between text-[#6B675E] dark:text-[#A7A399]">
                            <span>Thinking Level:</span>
                            <strong className="text-[#1A1917] dark:text-white">
                              {m.thinkingLevel}
                            </strong>
                          </div>
                          <div className="flex items-center justify-between text-[#6B675E] dark:text-[#A7A399]">
                            <span>Reasoning Power:</span>
                            <span className="font-mono font-semibold text-[#C96442] dark:text-[#E88F73]">
                              {m.reasoningPower}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[#6B675E] dark:text-[#A7A399]">
                            <span>Speed & Throughput:</span>
                            <span className="text-[#3A7550] dark:text-emerald-400 font-medium">
                              {m.speed}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#EAE6DE] dark:border-[#322F2A]">
                        {isSelected ? (
                          <div className="w-full py-1.5 px-3 rounded-xl bg-[#1C1A17] dark:bg-white text-white dark:text-[#1C1A17] font-semibold text-center text-xs flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                            <span>Active Model</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              onSelectModel(m.id);
                              onClose();
                            }}
                            className="w-full py-1.5 px-3 rounded-xl bg-[#ECE8DF] dark:bg-[#2C2A26] hover:bg-[#D97757] hover:text-white text-[#1C1A17] dark:text-white font-medium text-center text-xs transition-colors flex items-center justify-center gap-1"
                          >
                            <span>Switch to {m.name}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-3">
              <div className="text-xs text-[#6B675E] dark:text-[#A7A399]">
                Claude models integrate seamlessly with Anthropic's full suite of desktop, agentic, and workspace tools:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#23211D] border border-[#E0DCD4] dark:border-[#38352F] space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#1A1917] dark:text-white">
                    <Laptop className="w-4 h-4 text-[#D97757]" />
                    <span>Claude Code (Agentic CLI)</span>
                  </div>
                  <p className="text-[11px] text-[#6B675E] dark:text-[#A7A399]">
                    Autonomous software engineer tool running directly inside your terminal, desktop app, or mobile shell.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#23211D] border border-[#E0DCD4] dark:border-[#38352F] space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#1A1917] dark:text-white">
                    <Layers className="w-4 h-4 text-purple-500" />
                    <span>Claude Cowork (Desktop)</span>
                  </div>
                  <p className="text-[11px] text-[#6B675E] dark:text-[#A7A399]">
                    Knowledge-work companion coordinating cross-application research, synthesis, and writing on macOS and Windows.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#23211D] border border-[#E0DCD4] dark:border-[#38352F] space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#1A1917] dark:text-white">
                    <Compass className="w-4 h-4 text-blue-500" />
                    <span>Claude in Chrome</span>
                  </div>
                  <p className="text-[11px] text-[#6B675E] dark:text-[#A7A399]">
                    Browsing agent navigating live web pages, extracting structured data, and synthesizing live research.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#23211D] border border-[#E0DCD4] dark:border-[#38352F] space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#1A1917] dark:text-white">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    <span>Claude in Excel & PowerPoint</span>
                  </div>
                  <p className="text-[11px] text-[#6B675E] dark:text-[#A7A399]">
                    Deep financial modeling, formula computation, table structuring, and presentation slide design.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'artifacts' && (
            <div className="space-y-3">
              <div className="text-xs text-[#6B675E] dark:text-[#A7A399]">
                Every model in this app outputs standalone files as interactive Artifacts with live code preview & instant file downloads:
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3 rounded-xl bg-white dark:bg-[#23211D] border border-[#E0DCD4] dark:border-[#38352F]">
                  <div className="font-bold text-xs text-[#C96442]">React & JSX</div>
                  <div className="text-[10px] text-[#7A766F] mt-1">Live interactive apps with sound & state</div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#23211D] border border-[#E0DCD4] dark:border-[#38352F]">
                  <div className="font-bold text-xs text-blue-600">HTML / Tailwind</div>
                  <div className="text-[10px] text-[#7A766F] mt-1">Responsive websites & single page tools</div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#23211D] border border-[#E0DCD4] dark:border-[#38352F]">
                  <div className="font-bold text-xs text-emerald-600">Spreadsheets (.csv)</div>
                  <div className="text-[10px] text-[#7A766F] mt-1">Grid view & instant Excel export</div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#23211D] border border-[#E0DCD4] dark:border-[#38352F]">
                  <div className="font-bold text-xs text-purple-600">Slides (.pptx)</div>
                  <div className="text-[10px] text-[#7A766F] mt-1">Structured slide decks & cards</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Credit */}
        <div className="p-3.5 bg-white dark:bg-[#22201D] border-t border-[#E5E1D8] dark:border-[#2C2925] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#7A766F] dark:text-[#9A968D] gap-2">
          <span>Anthropic Claude 5 Ecosystem • Gemini Engine Backend</span>
          <span>
            App created by <strong className="font-bold text-[#1A1917] dark:text-white">Hafiz Muhammad Huzaifa Shamim</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
