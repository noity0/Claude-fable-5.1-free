import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Code2,
  ExternalLink,
  ChevronRight,
  User,
  Globe,
  Zap,
  Brain,
  Eye,
  Play,
} from 'lucide-react';
import { Message, Artifact } from '../types';
import { CLAUDE_MODELS } from '../constants/models';

interface ChatMessageProps {
  message: Message;
  onOpenArtifact?: (artifact: Artifact, viewMode?: 'preview' | 'code') => void;
  activeArtifactId?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onOpenArtifact,
  activeArtifactId,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const modelInfo =
    CLAUDE_MODELS.find((m) => m.id === message.modelUsed) || CLAUDE_MODELS[0];
  const isFable = modelInfo.id === 'claude-fable-5-1';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [phraseIndex, setPhraseIndex] = useState(0);

  // Model-specific generation phrases during streaming
  const getGenerationPhrases = () => {
    switch (message.modelUsed) {
      case 'claude-haiku-4-5-20251001':
        return [
          'Claude Haiku 4.5 is processing...',
          'Ultra-fast low-latency parsing...',
          'Rapidly compiling response...',
          'Delivering instant output...',
        ];
      case 'claude-opus-5':
        return [
          'Claude Opus 5 is deliberating...',
          'Conducting Level 4 deep analysis...',
          'Synthesizing philosophical depth...',
          'Refining scholarly synthesis...',
        ];
      case 'claude-sonnet-5':
        return [
          'Claude Sonnet 5 is reasoning...',
          'Executing adaptive workflow...',
          'Writing robust code & analysis...',
          'Polishing response...',
        ];
      case 'claude-mythos-5-1':
        return [
          'Claude Mythos 5.1 is computing...',
          'Frontier enterprise orchestration...',
          'Structuring system architecture...',
          'Compiling output...',
        ];
      case 'claude-fable-5-1':
      default:
        return [
          'Claude Fable 5.1 is thinking (Top & Best)...',
          'Synthesizing Level 5 Supreme Mythos reasoning...',
          'Architecting interactive Artifact...',
          'Refining dual-use safety & precision...',
          'Finalizing pinnacle response...',
        ];
    }
  };

  const phrases = getGenerationPhrases();

  // Rotating phrases during generation
  React.useEffect(() => {
    if (!message.isStreaming) return;
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [message.isStreaming, phrases.length]);

  // Helper for bold, italics, underline, code tags, links
  const renderInlineFormatting = (text: string) => {
    // Regex matching:
    // `code`, <u>underline</u>, **bold**, *italic*, [link](url)
    const regex = /(`[^`]+`|<u>[\s\S]*?<\/u>|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (!part) return null;

      // Inline code
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded-md bg-[#ECE8DF] dark:bg-[#322F2A] font-mono text-[12px] text-[#C96442] dark:text-[#E88F73]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // Underline <u>...</u>
      if (part.startsWith('<u>') && part.endsWith('</u>')) {
        return (
          <span key={i} className="underline decoration-[#D97757] decoration-1.5 underline-offset-2">
            {part.slice(3, -4)}
          </span>
        );
      }

      // Bold **text**
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={i} className="font-semibold text-[#181715] dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Italic *text*
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return (
          <em key={i} className="italic text-[#2F2D29] dark:text-[#E0DDD5]">
            {part.slice(1, -1)}
          </em>
        );
      }

      // Markdown links [text](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={i}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C96442] dark:text-[#E88F73] underline hover:opacity-80"
          >
            {linkMatch[1]}
          </a>
        );
      }

      return part;
    });
  };

  // Helper to render content with full markdown formatting (H1-H4, blockquotes, lists, tables, code)
  const renderFormattedContent = (content: string) => {
    // If empty and streaming
    if (!content && message.isStreaming) {
      return (
        <div className="flex items-center gap-2 py-1.5 text-xs text-[#8A857B] dark:text-[#9A968D]">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: modelInfo.accent }}
          />
          <span className="font-medium animate-pulse">{phrases[phraseIndex]}</span>
        </div>
      );
    }

    // Split paragraphs
    const paragraphs = content.split(/\n\n+/);

    return (
      <div className="space-y-3.5 leading-relaxed">
        {paragraphs.map((para, pIdx) => {
          const trimmed = para.trim();

          // Code blocks
          if (para.startsWith('```') && para.endsWith('```')) {
            const firstLineBreak = para.indexOf('\n');
            const lang = para.slice(3, firstLineBreak).trim() || 'code';
            const code = para.slice(firstLineBreak + 1, -3);

            // Skip rendering raw antArtifact header if parsed
            if (lang.toLowerCase().includes('antartifact')) {
              return null;
            }

            return (
              <div
                key={pIdx}
                className="my-3 rounded-xl overflow-hidden border border-[#E0DBD0] dark:border-[#38352F] bg-[#22201D] text-[#EBE8E1] text-xs font-mono"
              >
                <div className="px-3.5 py-1.5 bg-[#1A1917] border-b border-[#33302B] flex items-center justify-between text-[11px] text-[#A6A197]">
                  <span>{lang}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(code)}
                    className="hover:text-white transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <pre className="p-3.5 overflow-x-auto whitespace-pre">
                  <code>{code}</code>
                </pre>
              </div>
            );
          }

          // Heading 1 (# ...)
          if (trimmed.startsWith('# ')) {
            return (
              <h1
                key={pIdx}
                className="text-lg md:text-xl font-serif font-bold text-[#181715] dark:text-white mt-4 mb-2 pb-1 border-b border-[#EAE5DA] dark:border-[#38352F]"
              >
                {renderInlineFormatting(trimmed.slice(2))}
              </h1>
            );
          }

          // Heading 2 (## ...)
          if (trimmed.startsWith('## ')) {
            return (
              <h2
                key={pIdx}
                className="text-base md:text-lg font-serif font-bold text-[#181715] dark:text-white mt-3.5 mb-1.5"
              >
                {renderInlineFormatting(trimmed.slice(3))}
              </h2>
            );
          }

          // Heading 3 (### ...)
          if (trimmed.startsWith('### ')) {
            return (
              <h3
                key={pIdx}
                className="text-sm md:text-base font-serif font-semibold text-[#181715] dark:text-white mt-3 mb-1"
              >
                {renderInlineFormatting(trimmed.slice(4))}
              </h3>
            );
          }

          // Heading 4 (#### ...)
          if (trimmed.startsWith('#### ')) {
            return (
              <h4
                key={pIdx}
                className="text-xs md:text-sm font-semibold uppercase tracking-wider text-[#68645C] dark:text-[#B5B0A6] mt-2.5 mb-1"
              >
                {renderInlineFormatting(trimmed.slice(5))}
              </h4>
            );
          }

          // Blockquotes (> ...)
          if (trimmed.startsWith('>')) {
            const quoteContent = trimmed
              .split('\n')
              .map((l) => l.replace(/^>\s?/, ''))
              .join('\n');
            return (
              <blockquote
                key={pIdx}
                className="my-2.5 pl-3.5 py-1 border-l-3 border-[#D97757] bg-[#F5F2EA]/60 dark:bg-[#252320]/60 rounded-r-lg italic text-[#4A4740] dark:text-[#C5C0B5] text-xs md:text-sm"
              >
                {renderInlineFormatting(quoteContent)}
              </blockquote>
            );
          }

          // Markdown Table (| ... | ... |)
          if (trimmed.startsWith('|') && trimmed.includes('|---')) {
            const rows = trimmed
              .split('\n')
              .filter((r) => r.trim().startsWith('|'))
              .map((r) =>
                r
                  .split('|')
                  .slice(1, -1)
                  .map((c) => c.trim())
              );

            const headerRow = rows[0] || [];
            const dataRows = rows.slice(2);

            return (
              <div
                key={pIdx}
                className="my-3 overflow-x-auto rounded-xl border border-[#E0DBD0] dark:border-[#38352F] bg-white dark:bg-[#22201D]"
              >
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F3EC] dark:bg-[#1E1C1A] border-b border-[#E0DBD0] dark:border-[#38352F]">
                    <tr>
                      {headerRow.map((h, hIdx) => (
                        <th key={hIdx} className="p-2.5 font-semibold text-[#181715] dark:text-white">
                          {renderInlineFormatting(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE5DA] dark:divide-[#2F2C27]">
                    {dataRows.map((dRow, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[#FAF9F5] dark:hover:bg-[#272521]">
                        {dRow.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2.5 text-[#33312D] dark:text-[#DDD9D0]">
                            {renderInlineFormatting(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          // Bullet Lists
          if (
            para.split('\n').some((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '))
          ) {
            const lines = para.split('\n');
            return (
              <ul key={pIdx} className="list-disc pl-5 space-y-1.5 my-2">
                {lines.map((l, lIdx) => (
                  <li key={lIdx}>
                    {renderInlineFormatting(l.replace(/^[-*]\s+/, ''))}
                  </li>
                ))}
              </ul>
            );
          }

          // Numbered lists
          if (para.split('\n').some((line) => /^\d+\.\s+/.test(line.trim()))) {
            const lines = para.split('\n');
            return (
              <ol key={pIdx} className="list-decimal pl-5 space-y-1.5 my-2">
                {lines.map((l, lIdx) => (
                  <li key={lIdx}>
                    {renderInlineFormatting(l.replace(/^\d+\.\s+/, ''))}
                  </li>
                ))}
              </ol>
            );
          }

          // Regular paragraph
          return (
            <p key={pIdx} className="whitespace-pre-line">
              {renderInlineFormatting(para)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`py-4 px-3 md:px-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-[#F7F5EE]/60 dark:bg-[#1C1A17]/60 border-y border-[#EBE7DD]/60 dark:border-[#2B2925]/60'
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-3 md:gap-4">
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-7 h-7 rounded-full bg-[#E5E1D7] dark:bg-[#34312B] flex items-center justify-center text-[#55524B] dark:text-[#C5C0B5]">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: modelInfo.accent }}
            >
              {isFable ? (
                <Sparkles className="w-4 h-4 fill-current" />
              ) : modelInfo.id === 'claude-haiku-4-5-20251001' ? (
                <Zap className="w-4 h-4 fill-current" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden">
          {/* Header row for Assistant message */}
          {!isUser && (
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="font-serif font-bold text-xs text-[#1E1C19] dark:text-[#EDE8E0]">
                {modelInfo.name}
              </span>

              {/* Tier Badge */}
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{
                  backgroundColor: `${modelInfo.accent}20`,
                  color: modelInfo.accent,
                }}
              >
                {modelInfo.tier}
              </span>

              {/* Thinking Level Pill */}
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-[#ECE8DF] dark:bg-[#2C2A26] text-[#69655D] dark:text-[#A7A299]">
                {modelInfo.thinkingLevel.split('—')[0].trim()}
              </span>

              {/* Top & Best Flagship Special Badge for Fable 5.1 */}
              {isFable && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  ★ TOP & BEST
                </span>
              )}

              {message.isStreaming && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full animate-ping"
                  style={{ backgroundColor: modelInfo.accent }}
                />
              )}
            </div>
          )}

          {/* Text Content */}
          <div className="text-sm text-[#272522] dark:text-[#DDD9D0]">
            {renderFormattedContent(message.content)}
          </div>

          {/* Artifact Cards (if artifacts were parsed) */}
          {message.artifacts && message.artifacts.length > 0 && (
            <div className="mt-3.5 space-y-2.5">
              {message.artifacts.map((art) => {
                const isSelected = activeArtifactId === art.id;
                return (
                  <div
                    key={art.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-[#D97757] bg-[#FBF5F0] dark:bg-[#2C231E] shadow-xs'
                        : 'border-[#E0DBD1] dark:border-[#38352F] bg-white dark:bg-[#23211D] hover:border-[#D97757]/60 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#D97757]/15 text-[#C96442] dark:text-[#E88F73] flex items-center justify-center shrink-0">
                        <Code2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs text-[#1F1E1B] dark:text-[#EDE8E0] truncate">
                            {art.title}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#ECE7DE] dark:bg-[#322F2A] text-[#78746B] dark:text-[#A7A39B]">
                            {art.language || 'artifact'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7A766E] dark:text-[#9A968D] truncate">
                          Interactive file generated • Preview is optional
                        </p>
                      </div>
                    </div>

                    {/* Action buttons: Explicit Preview or Code */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => onOpenArtifact && onOpenArtifact(art, 'code')}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#DDD8CE] dark:border-[#38352F] hover:bg-[#F3F0E9] dark:hover:bg-[#2A2824] text-[11px] font-medium text-[#48453F] dark:text-[#C5C0B6] transition-colors"
                      >
                        <Code2 className="w-3.5 h-3.5 text-[#888]" />
                        <span>View Code</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenArtifact && onOpenArtifact(art, 'preview')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#D97757] hover:bg-[#C96442] text-white text-[11px] font-semibold shadow-xs transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Run Preview</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Message Actions */}
          {!isUser && !message.isStreaming && message.content && (
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-[#868278] dark:text-[#969288] hover:text-[#1F1E1B] dark:hover:text-white transition-colors p-1 rounded"
                title="Copy message"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
