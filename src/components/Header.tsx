import React, { useState } from 'react';
import {
  ChevronDown,
  Sparkles,
  Database,
  Code2,
  Sliders,
  Plus,
  Info,
  Check,
  PanelRightClose,
  PanelRightOpen,
  Menu,
  Cpu,
  User,
} from 'lucide-react';
import { CLAUDE_MODELS } from '../constants/models';
import { ClaudeModelId, ToneStyle, Artifact, UserAccount } from '../types';

interface HeaderProps {
  currentModel: ClaudeModelId;
  onSelectModel: (model: ClaudeModelId) => void;
  toneStyle: ToneStyle;
  onSelectToneStyle: (style: ToneStyle) => void;
  onOpenMemory: () => void;
  onOpenPromptInspector: () => void;
  onOpenAbilities: () => void;
  onNewChat: () => void;
  memoryCount: number;
  activeArtifact: Artifact | null;
  isArtifactPanelOpen: boolean;
  onToggleArtifactPanel: () => void;
  onToggleSidebar: () => void;
  currentUser: UserAccount;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModel,
  onSelectModel,
  toneStyle,
  onSelectToneStyle,
  onOpenMemory,
  onOpenPromptInspector,
  onOpenAbilities,
  onNewChat,
  memoryCount,
  activeArtifact,
  isArtifactPanelOpen,
  onToggleArtifactPanel,
  onToggleSidebar,
  currentUser,
  onOpenAuth,
}) => {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);

  const activeModelInfo =
    CLAUDE_MODELS.find((m) => m.id === currentModel) || CLAUDE_MODELS[0];

  return (
    <header className="h-14 border-b border-[#e5e2db] dark:border-[#33302b] bg-[#FAF9F5] dark:bg-[#1E1D1A] px-3 md:px-5 flex items-center justify-between select-none z-30 transition-colors">
      {/* Left: Mobile Menu, App Brand, Model Selector */}
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-[#6B6862] dark:text-[#A4A099] hover:bg-[#EAE7DF] dark:hover:bg-[#2C2A25] md:hidden"
          title="Toggle chats"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand & Model Selector */}
        <div className="relative">
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#EAE7DF] dark:hover:bg-[#2C2A25] transition-colors text-left"
          >
            {/* Claude Sparkle Icon */}
            <div className="w-6 h-6 rounded-lg bg-[#D97757] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-semibold text-sm text-[#1A1917] dark:text-[#EDEDEC] tracking-tight">
                  {activeModelInfo.name}
                </span>
                {activeModelInfo.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-[#D97757]/15 text-[#C96442] dark:text-[#E88F73]">
                    {activeModelInfo.badge}
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-[#85827A] dark:text-[#9E9A91]" />
              </div>
              <span className="text-[11px] text-[#7A7770] dark:text-[#9A968E] hidden sm:inline">
                {activeModelInfo.tier}
              </span>
            </div>
          </button>

          {/* Model Dropdown Menu */}
          {isModelDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsModelDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1.5 w-80 bg-white dark:bg-[#252320] border border-[#E0DCD4] dark:border-[#38352F] rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-[#EAE7DF] dark:border-[#33302B] mb-1">
                  <div className="text-xs font-semibold text-[#66635C] dark:text-[#A8A49C] uppercase tracking-wider">
                    Anthropic Claude 5 Models
                  </div>
                  <div className="text-[11px] text-[#8C8880] dark:text-[#7A766F]">
                    Powered via Gemini API Engine
                  </div>
                </div>

                <div className="space-y-1.5 max-h-[75vh] overflow-y-auto pr-0.5">
                  {CLAUDE_MODELS.map((model) => {
                    const isSelected = model.id === currentModel;
                    const isFable = model.id === 'claude-fable-5-1';
                    return (
                      <button
                        key={model.id}
                        onClick={() => {
                          onSelectModel(model.id);
                          setIsModelDropdownOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between border ${
                          isSelected
                            ? 'bg-[#FDF9F5] dark:bg-[#342D28] border-[#D97757]/40 shadow-xs'
                            : 'border-transparent hover:bg-[#F3F0EA] dark:hover:bg-[#2C2A26] text-[#2F2D2A] dark:text-[#DCD9D2]'
                        }`}
                      >
                        <div className="flex-1 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-[#1A1917] dark:text-white">
                              {model.name}
                            </span>
                            {isFable ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                ★ TOP & BEST
                              </span>
                            ) : model.badge ? (
                              <span
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                                style={{
                                  backgroundColor: `${model.accent}18`,
                                  color: model.accent,
                                }}
                              >
                                {model.badge}
                              </span>
                            ) : null}
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-[11px]">
                            <span className="font-semibold text-[#8C5E3E] dark:text-[#E89978]">
                              {model.tier}
                            </span>
                            <span className="text-[#88857D] dark:text-[#7A776F]">•</span>
                            <span className="text-[#6B675E] dark:text-[#A7A399]">
                              {model.thinkingLevel.split('—')[0].trim()}
                            </span>
                          </div>

                          <p className="text-xs text-[#5F5C54] dark:text-[#A8A49C] mt-1 leading-snug">
                            {model.tagline}
                          </p>

                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#7A766F] dark:text-[#9A968D]">
                            <span className="px-1.5 py-0.5 rounded bg-[#ECE7DC] dark:bg-[#2C2A26] font-mono">
                              🧠 {model.reasoningPower}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-[#ECE7DC] dark:bg-[#2C2A26]">
                              ⚡ {model.speed}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <Check className="w-4 h-4 text-[#D97757] mt-1 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Actions, Tone, Memory, Artifacts, New Chat */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Style / Tone Dropdown */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setIsToneDropdownOpen(!isToneDropdownOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#DDD9D0] dark:border-[#38352F] text-xs font-medium text-[#4D4B45] dark:text-[#C5C1B8] hover:bg-[#ECE9E2] dark:hover:bg-[#2B2925] transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-[#87837A]" />
            <span className="capitalize">{toneStyle}</span>
            <ChevronDown className="w-3 h-3 text-[#87837A]" />
          </button>

          {isToneDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsToneDropdownOpen(false)}
              />
              <div className="absolute top-full right-0 mt-1 w-44 bg-white dark:bg-[#252320] border border-[#E0DCD4] dark:border-[#38352F] rounded-xl shadow-lg p-1 z-50">
                {(['normal', 'concise', 'explanatory', 'formal'] as ToneStyle[]).map(
                  (style) => (
                    <button
                      key={style}
                      onClick={() => {
                        onSelectToneStyle(style);
                        setIsToneDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between capitalize ${
                        toneStyle === style
                          ? 'bg-[#F6EFE9] dark:bg-[#342D28] text-[#C96442] dark:text-[#E88F73] font-medium'
                          : 'text-[#484540] dark:text-[#CCC8BF] hover:bg-[#F3F0EA] dark:hover:bg-[#2C2A26]'
                      }`}
                    >
                      <span>{style}</span>
                      {toneStyle === style && <Check className="w-3.5 h-3.5" />}
                    </button>
                  )
                )}
              </div>
            </>
          )}
        </div>

        {/* Claude Abilities Matrix Button */}
        <button
          onClick={onOpenAbilities}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#DDD9D0] dark:border-[#38352F] text-xs font-medium text-[#4D4B45] dark:text-[#C5C1B8] hover:bg-[#ECE9E2] dark:hover:bg-[#2B2925] transition-colors"
          title="Compare Claude Models & Abilities"
        >
          <Cpu className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span>Abilities</span>
        </button>

        {/* Memory Filesystem Button */}
        <button
          onClick={onOpenMemory}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#DDD9D0] dark:border-[#38352F] text-xs font-medium text-[#4D4B45] dark:text-[#C5C1B8] hover:bg-[#ECE9E2] dark:hover:bg-[#2B2925] transition-colors"
          title="Claude Memory Filesystem"
        >
          <Database className="w-3.5 h-3.5 text-[#D97757]" />
          <span className="hidden md:inline">Memory</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#EAE6DD] dark:bg-[#36332C] text-[#69655D] dark:text-[#AAA59C] font-semibold">
            {memoryCount}
          </span>
        </button>

        {/* System Prompt / Fable Guidelines Inspector */}
        <button
          onClick={onOpenPromptInspector}
          className="p-1.5 rounded-lg border border-[#DDD9D0] dark:border-[#38352F] text-[#6B6862] dark:text-[#A4A099] hover:bg-[#ECE9E2] dark:hover:bg-[#2B2925] transition-colors"
          title="Inspect Claude Fable 5.1 Instructions & Architecture"
        >
          <Info className="w-4 h-4 text-[#7A766F]" />
        </button>

        {/* User Account / Auth Toggle */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl border border-[#DDD9D0] dark:border-[#38352F] hover:border-[#D97757] transition-all text-left"
          title={currentUser.isGuest ? 'Guest Mode (Click to Sign in)' : `Signed in as ${currentUser.email}`}
        >
          <div className="w-6 h-6 rounded-full overflow-hidden bg-[#ECE8DF] dark:bg-[#34312B] flex items-center justify-center text-[#55524B] shrink-0 text-xs">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-3.5 h-3.5" />
            )}
          </div>
          <span className="text-[11px] font-semibold text-[#1A1917] dark:text-white hidden sm:inline max-w-[80px] truncate">
            {currentUser.name}
          </span>
        </button>

        {/* Artifact Drawer Toggle (if active artifact exists) */}
        {activeArtifact && (
          <button
            onClick={onToggleArtifactPanel}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isArtifactPanelOpen
                ? 'bg-[#D97757] text-white'
                : 'border border-[#D97757]/40 text-[#C96442] dark:text-[#E88F73] bg-[#D97757]/10 hover:bg-[#D97757]/20'
            }`}
            title="Toggle Artifacts Preview"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Artifact</span>
            {isArtifactPanelOpen ? (
              <PanelRightClose className="w-3.5 h-3.5" />
            ) : (
              <PanelRightOpen className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#D97757] hover:bg-[#C96442] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
          title="Start new conversation"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>
    </header>
  );
};
