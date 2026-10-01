import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Globe,
  Square,
  Sparkles,
  Code2,
  BookOpen,
  Palette,
  Heading,
  Bold,
  Italic,
  Underline,
  List,
  Table,
} from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string, enableSearch: boolean) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  hasMessages: boolean;
}

const SUGGESTIONS = [
  {
    icon: Sparkles,
    label: 'About Claude Fable 5.1',
    prompt: 'What is Claude Fable 5.1, what tier does it belong to, and how does it compare to Claude Mythos 5.1 and Opus 5?',
  },
  {
    icon: Code2,
    label: 'Build React Artifact',
    prompt: 'Build a beautiful, interactive Pomodoro timer app in React with sound alerts, custom intervals, and task logging.',
  },
  {
    icon: Palette,
    label: 'Vector SVG Graphic',
    prompt: 'Generate an original SVG vector illustration of a futuristic floating greenhouse biosphere with layered gradients.',
  },
  {
    icon: BookOpen,
    label: 'Prompting Advice',
    prompt: 'What are the recommended prompting techniques for getting Claude to be most helpful, and how should I structure XML tags?',
  },
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  hasMessages,
}) => {
  const [text, setText] = useState('');
  const [enableSearch, setEnableSearch] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    if (!text.trim() || isStreaming) return;
    onSendMessage(text.trim(), enableSearch);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const insertFormatting = (prefix: string, suffix: string = '', placeholder: string = '') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const currentVal = text;

    let selected = currentVal.substring(start, end);
    if (!selected) selected = placeholder;

    const replacement = `${prefix}${selected}${suffix}`;
    const nextVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    setText(nextVal);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start + prefix.length,
          start + prefix.length + selected.length
        );
      }
    }, 10);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-2.5 sm:px-4 md:px-6 pb-2.5 sm:pb-4">
      {/* Suggestions if chat is empty */}
      {!hasMessages && (
        <div className="mb-3 sm:mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SUGGESTIONS.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => onSendMessage(item.prompt, enableSearch)}
                className="text-left p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#23211D] border border-[#E2DDD3] dark:border-[#38352F] hover:border-[#D97757]/80 hover:shadow-xs transition-all group active:scale-[0.99]"
              >
                <div className="flex items-center gap-2 mb-0.5 sm:mb-1 text-xs font-semibold text-[#1A1917] dark:text-[#EDE8E0]">
                  <Icon className="w-3.5 h-3.5 text-[#D97757] group-hover:scale-110 transition-transform" />
                  <span>{item.label}</span>
                </div>
                <p className="text-[11px] text-[#7A766F] dark:text-[#9A968D] line-clamp-1 leading-snug">
                  {item.prompt}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Input Box */}
      <div className="relative rounded-2xl bg-white dark:bg-[#23211D] border border-[#DDD8CE] dark:border-[#38352F] shadow-sm focus-within:border-[#D97757] focus-within:ring-2 focus-within:ring-[#D97757]/20 transition-all p-2 sm:p-2.5">
        {/* Quick Markdown Formatting Controls */}
        <div className="flex items-center gap-1 pb-1.5 mb-1 border-b border-[#F0ECE4] dark:border-[#2C2A26] overflow-x-auto text-[11px] text-[#7A766F] dark:text-[#9A968D] no-scrollbar">
          <button
            type="button"
            onClick={() => insertFormatting('### ', '\n', 'Heading')}
            className="p-1.5 rounded hover:bg-[#F3F0EA] dark:hover:bg-[#2C2A26] hover:text-[#181715] dark:hover:text-white transition-colors shrink-0"
            title="Add Heading"
          >
            <Heading className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('**', '**', 'bold text')}
            className="p-1.5 rounded hover:bg-[#F3F0EA] dark:hover:bg-[#2C2A26] hover:text-[#181715] dark:hover:text-white transition-colors shrink-0"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*', 'italic text')}
            className="p-1.5 rounded hover:bg-[#F3F0EA] dark:hover:bg-[#2C2A26] hover:text-[#181715] dark:hover:text-white transition-colors shrink-0"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('<u>', '</u>', 'underlined text')}
            className="p-1.5 rounded hover:bg-[#F3F0EA] dark:hover:bg-[#2C2A26] hover:text-[#181715] dark:hover:text-white transition-colors shrink-0"
            title="Underline"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('`', '`', 'code')}
            className="p-1.5 rounded hover:bg-[#F3F0EA] dark:hover:bg-[#2C2A26] hover:text-[#181715] dark:hover:text-white transition-colors font-mono shrink-0"
            title="Inline Code"
          >
            <Code2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('- ', '\n', 'list item')}
            className="p-1.5 rounded hover:bg-[#F3F0EA] dark:hover:bg-[#2C2A26] hover:text-[#181715] dark:hover:text-white transition-colors shrink-0"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              insertFormatting(
                '| Feature | Description |\n|---|---|\n| Item 1 | Details |\n',
                '',
                ''
              )
            }
            className="p-1.5 rounded hover:bg-[#F3F0EA] dark:hover:bg-[#2C2A26] hover:text-[#181715] dark:hover:text-white transition-colors shrink-0"
            title="Insert Table"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Reply to Claude Fable 5.1..."
          rows={1}
          className="w-full max-h-36 sm:max-h-48 px-1.5 py-1 text-sm bg-transparent outline-none resize-none text-[#1C1A17] dark:text-[#EDE8E0] placeholder-[#8A857C] dark:placeholder-[#7A766E] leading-relaxed"
        />

        {/* Toolbar row */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F0ECE4] dark:border-[#2C2A26] mt-1 text-xs">
          {/* Left tools: Web Search toggle */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setEnableSearch(!enableSearch)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-[11px] font-medium active:scale-95 ${
                enableSearch
                  ? 'bg-[#D97757]/15 text-[#C96442] dark:text-[#E88F73] border border-[#D97757]/30'
                  : 'text-[#69655D] dark:text-[#A7A299] hover:bg-[#F3F0EA] dark:hover:bg-[#2C2A26]'
              }`}
              title="Search the web with Gemini Search Grounding"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Web Search</span>
            </button>
          </div>

          {/* Right action: Send or Stop */}
          <div>
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1C1A17] dark:bg-white text-white dark:text-[#1C1A17] flex items-center justify-center hover:opacity-90 transition-opacity active:scale-95"
                title="Stop response"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!text.trim()}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all ${
                  text.trim()
                    ? 'bg-[#D97757] hover:bg-[#C96442] text-white shadow-xs cursor-pointer active:scale-95'
                    : 'bg-[#E5E1D7] dark:bg-[#34312B] text-[#9A958A] dark:text-[#6A665E] cursor-not-allowed'
                }`}
                title="Send message"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 text-center text-[11px] text-[#8C877D] dark:text-[#7A766F]">
        Claude Fable 5.1 (Mythos-Class) • App created by <span className="font-semibold text-[#181715] dark:text-[#E8E4DC]">Hafiz Muhammad Huzaifa Shamim</span>
      </div>
    </div>
  );
};
