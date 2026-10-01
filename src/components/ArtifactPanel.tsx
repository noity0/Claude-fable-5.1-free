import React, { useState, useEffect } from 'react';
import {
  X,
  Code2,
  Eye,
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  Play,
  Layers,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';
import { Artifact } from '../types';

interface ArtifactPanelProps {
  artifacts: Artifact[];
  activeArtifact: Artifact | null;
  initialViewMode?: 'preview' | 'code';
  onSelectArtifact: (art: Artifact) => void;
  onClose: () => void;
}

export const ArtifactPanel: React.FC<ArtifactPanelProps> = ({
  artifacts,
  activeArtifact,
  initialViewMode = 'preview',
  onSelectArtifact,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>(initialViewMode);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode, activeArtifact?.id]);

  if (!activeArtifact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeArtifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const lang = (activeArtifact.language || '').toLowerCase();
    let ext = 'txt';
    let mimeType = 'text/plain;charset=utf-8';

    if (lang === 'html') {
      ext = 'html';
      mimeType = 'text/html;charset=utf-8';
    } else if (lang === 'svg') {
      ext = 'svg';
      mimeType = 'image/svg+xml;charset=utf-8';
    } else if (lang === 'python' || lang === 'py') {
      ext = 'py';
      mimeType = 'text/x-python;charset=utf-8';
    } else if (lang === 'tsx') {
      ext = 'tsx';
      mimeType = 'text/typescript-jsx;charset=utf-8';
    } else if (lang === 'jsx') {
      ext = 'jsx';
      mimeType = 'text/javascript-jsx;charset=utf-8';
    } else if (lang === 'typescript' || lang === 'ts') {
      ext = 'ts';
      mimeType = 'text/typescript;charset=utf-8';
    } else if (lang === 'javascript' || lang === 'js') {
      ext = 'js';
      mimeType = 'text/javascript;charset=utf-8';
    } else if (lang === 'json') {
      ext = 'json';
      mimeType = 'application/json;charset=utf-8';
    } else if (lang === 'csv' || lang.includes('excel') || lang.includes('sheet') || lang.includes('xlsx')) {
      ext = lang.includes('xlsx') ? 'xlsx' : 'csv';
      mimeType = 'text/csv;charset=utf-8';
    } else if (lang === 'pptx' || lang.includes('slide') || lang.includes('powerpoint')) {
      ext = 'pptx';
      mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else if (lang === 'exe' || lang === 'batch' || lang === 'bat' || lang === 'cmd') {
      ext = lang === 'exe' ? 'exe' : 'bat';
      mimeType = 'application/octet-stream';
    } else if (lang === 'sh' || lang === 'bash') {
      ext = 'sh';
      mimeType = 'application/x-sh;charset=utf-8';
    } else if (lang === 'md' || lang === 'markdown') {
      ext = 'md';
      mimeType = 'text/markdown;charset=utf-8';
    } else if (lang === 'css') {
      ext = 'css';
      mimeType = 'text/css;charset=utf-8';
    } else if (lang === 'sql') {
      ext = 'sql';
      mimeType = 'text/sql;charset=utf-8';
    }

    const blob = new Blob([activeArtifact.content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeArtifact.identifier || activeArtifact.title.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Prepare iframe HTML for web preview
  const generatePreviewDoc = () => {
    const content = activeArtifact.content;
    const lang = (activeArtifact.language || '').toLowerCase();
    const isReact =
      lang === 'tsx' ||
      lang === 'jsx' ||
      activeArtifact.type.includes('react') ||
      content.includes('import React') ||
      content.includes('export default') ||
      content.includes('useState');

    // If it's already an HTML document
    if (content.includes('<html') || content.includes('<!DOCTYPE')) {
      return content;
    }

    // If it's an SVG
    if (content.trim().startsWith('<svg')) {
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body {
      margin: 0;
      padding: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #faf9f5;
      font-family: system-ui, sans-serif;
    }
    svg {
      max-width: 100%;
      height: auto;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      background: white;
      border-radius: 12px;
      padding: 16px;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>
`;
    }

    // If it's a React component
    if (isReact) {
      // Clean import / export statements for browser Babel execution
      const cleanedCode = content
        .replace(/import\s+React\s*,\s*\{[^}]*\}\s+from\s+['"][^'"]+['"];?/g, '')
        .replace(/import\s+React\s+from\s+['"][^'"]+['"];?/g, '')
        .replace(/import\s*\{[^}]*\}\s+from\s+['"][^'"]+['"];?/g, '')
        .replace(/import\s+[^;]+from\s+['"][^'"]+['"];?/g, '')
        .replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 'function $1')
        .replace(/export\s+default\s+/g, 'const DefaultExport = ');

      return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${activeArtifact.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #faf9f5;
      color: #1a1917;
      margin: 0;
      padding: 16px;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback } = React;
    
    try {
      ${cleanedCode}
      
      const ComponentToRender = typeof DefaultExport !== 'undefined' 
        ? DefaultExport 
        : (typeof App !== 'undefined' ? App : (typeof PomodoroTimer !== 'undefined' ? PomodoroTimer : null));

      if (ComponentToRender) {
        ReactDOM.createRoot(document.getElementById('root')).render(<ComponentToRender />);
      } else {
        document.getElementById('root').innerHTML = '<div class="p-6 text-center text-gray-500 font-mono text-sm">React component ready. Check Code tab to view full source code.</div>';
      }
    } catch(err) {
      document.getElementById('root').innerHTML = '<div class="p-4 bg-red-50 text-red-700 rounded-xl font-mono text-xs"><b>Preview Note:</b> ' + err.message + '<br/><span class="text-gray-500 mt-2 block">Switch to Code tab to copy or download complete file.</span></div>';
    }
  </script>
</body>
</html>
`;
    }

    // If it's CSV / spreadsheet data
    if (lang === 'csv' || content.includes(',') && content.includes('\n') && !content.includes('<')) {
      const rows = content.trim().split('\n').map(r => r.split(','));
      return `
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="p-6 bg-slate-50 font-sans">
  <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
    <div class="px-4 py-3 bg-slate-100 border-b border-slate-200 font-bold text-sm text-slate-700">
      📊 Spreadsheet View
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        ${rows.map((row, i) => `
          <tr class="${i === 0 ? 'bg-slate-50 font-semibold text-slate-800 border-b' : 'border-b hover:bg-slate-50'}">
            ${row.map(cell => `<td class="p-2.5 border-r border-slate-100">${cell.trim()}</td>`).join('')}
          </tr>
        `).join('')}
      </table>
    </div>
  </div>
</body>
</html>
`;
    }

    // Default HTML wrapper with Tailwind CDN & responsive viewport
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${activeArtifact.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 1.5rem;
      background-color: #faf9f5;
      color: #1a1917;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>
`;
  };

  return (
    <div
      className={`bg-white dark:bg-[#1C1B18] border-l border-[#E5E1D8] dark:border-[#2F2C27] flex flex-col transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-full h-full'
          : 'fixed inset-0 z-50 md:static md:z-auto w-full md:w-[480px] lg:w-[560px] xl:w-[620px] h-full shadow-2xl md:shadow-none'
      }`}
    >
      {/* Top Header */}
      <div className="h-14 px-3 sm:px-4 border-b border-[#E5E1D8] dark:border-[#2F2C27] flex items-center justify-between bg-[#FAF9F5] dark:bg-[#201F1C]">
        {/* Left: Mobile Back Button + Artifact Title & Selector */}
        <div className="relative flex items-center gap-2 max-w-[55%]">
          {/* Android Mobile Back Button */}
          <button
            onClick={onClose}
            className="md:hidden flex items-center gap-1 px-2 py-1 rounded-lg text-[#C96442] hover:bg-[#EAE6DD] dark:hover:bg-[#2B2925] font-semibold text-xs shrink-0"
            title="Back to conversation"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Chat</span>
          </button>

          <div className="w-7 h-7 rounded-lg bg-[#D97757]/15 text-[#C96442] dark:text-[#E88F73] hidden sm:flex items-center justify-center shrink-0">
            <Code2 className="w-4 h-4" />
          </div>

          <div
            onClick={() => artifacts.length > 1 && setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-1 overflow-hidden ${
              artifacts.length > 1 ? 'cursor-pointer hover:opacity-80' : ''
            }`}
          >
            <span className="font-semibold text-xs text-[#1F1E1B] dark:text-[#EDE8E0] truncate">
              {activeArtifact.title}
            </span>
            {artifacts.length > 1 && (
              <ChevronDown className="w-3.5 h-3.5 text-[#88847C] shrink-0" />
            )}
          </div>

          {/* Artifact dropdown if multiple */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-[#24221E] border border-[#DDD8CE] dark:border-[#38352F] rounded-xl shadow-xl p-1 z-50">
                <div className="px-2 py-1 text-[10px] font-bold text-[#8C877D] uppercase tracking-wider">
                  Conversation Artifacts ({artifacts.length})
                </div>
                {artifacts.map((art) => (
                  <button
                    key={art.id}
                    onClick={() => {
                      onSelectArtifact(art);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                      art.id === activeArtifact.id
                        ? 'bg-[#FBF5F0] dark:bg-[#342C26] text-[#C96442] font-semibold'
                        : 'text-[#48453F] dark:text-[#C5C0B6] hover:bg-[#F3F0E9] dark:hover:bg-[#2A2824]'
                    }`}
                  >
                    <span className="truncate">{art.title}</span>
                    <span className="text-[10px] uppercase font-mono text-[#8C877D]">
                      {art.language}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: Controls (Preview / Code switch, Copy, Download, Fullscreen, Close) */}
        <div className="flex items-center gap-1.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#ECE8DF] dark:bg-[#2B2925] p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'preview'
                  ? 'bg-white dark:bg-[#1E1D1A] text-[#1F1E1B] dark:text-white font-medium shadow-2xs'
                  : 'text-[#69655D] dark:text-[#A7A299] hover:text-[#1F1E1B]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'code'
                  ? 'bg-white dark:bg-[#1E1D1A] text-[#1F1E1B] dark:text-white font-medium shadow-2xs'
                  : 'text-[#69655D] dark:text-[#A7A299] hover:text-[#1F1E1B]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
          </div>

          {/* Copy Code */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-[#69655D] dark:text-[#A7A299] hover:bg-[#ECE8DF] dark:hover:bg-[#2B2925] transition-colors"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-[#69655D] dark:text-[#A7A299] hover:bg-[#ECE8DF] dark:hover:bg-[#2B2925] transition-colors"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-[#69655D] dark:text-[#A7A299] hover:bg-[#ECE8DF] dark:hover:bg-[#2B2925] transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#69655D] dark:text-[#A7A299] hover:bg-[#ECE8DF] dark:hover:bg-[#2B2925] transition-colors"
            title="Close artifact"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'preview' ? (
          <div className="w-full h-full bg-[#FAF9F5] dark:bg-[#171614] flex flex-col">
            <iframe
              title={activeArtifact.title}
              srcDoc={generatePreviewDoc()}
              sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
              className="w-full h-full border-none bg-white"
            />
          </div>
        ) : (
          <div className="w-full h-full overflow-auto bg-[#1C1A17] text-[#EDEAE3] font-mono text-xs p-4 select-text">
            <pre className="whitespace-pre">
              <code>{activeArtifact.content}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="px-4 py-2 border-t border-[#E5E1D8] dark:border-[#2F2C27] bg-[#FAF9F5] dark:bg-[#201F1C] flex items-center justify-between text-[11px] text-[#7A766E] dark:text-[#9A968D]">
        <span>Identifier: {activeArtifact.identifier}</span>
        <span className="uppercase font-mono font-bold text-[#C96442]">
          {activeArtifact.language}
        </span>
      </div>
    </div>
  );
};
