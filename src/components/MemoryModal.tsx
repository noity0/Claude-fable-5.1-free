import React, { useState } from 'react';
import {
  X,
  Database,
  FileText,
  Plus,
  Trash2,
  Save,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { MemoryFile } from '../types';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoryFiles: MemoryFile[];
  onSaveFile: (file: MemoryFile) => void;
  onDeleteFile: (path: string) => void;
  onAddFile: (file: MemoryFile) => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  memoryFiles,
  onSaveFile,
  onDeleteFile,
  onAddFile,
}) => {
  const [selectedPath, setSelectedPath] = useState<string>(
    memoryFiles[0]?.path || '/profile.md'
  );
  const [editingContent, setEditingContent] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [newPath, setNewPath] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const activeFile = memoryFiles.find((f) => f.path === selectedPath);

  React.useEffect(() => {
    if (activeFile) {
      setEditingContent(activeFile.content);
    }
  }, [selectedPath, memoryFiles]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (activeFile) {
      onSaveFile({
        ...activeFile,
        content: editingContent,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleCreateFile = () => {
    if (!newPath.startsWith('/')) {
      alert('Path must start with a slash (e.g. /topics/hobbies.md)');
      return;
    }
    const newFile: MemoryFile = {
      path: newPath,
      name: newName || 'custom',
      description: newDesc || 'User defined topic',
      content: `---
name: ${newName || 'custom'}
description: ${newDesc || 'User defined memory file'}
sources: [chat]
---

- [stated] `,
      updatedAt: new Date().toISOString(),
    };
    onAddFile(newFile);
    setSelectedPath(newFile.path);
    setIsAdding(false);
    setNewPath('');
    setNewName('');
    setNewDesc('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-4xl h-[85vh] bg-[#FAF9F5] dark:bg-[#1C1B18] rounded-2xl shadow-2xl border border-[#DDD8CE] dark:border-[#38352F] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 px-5 border-b border-[#E5E1D8] dark:border-[#2C2925] flex items-center justify-between bg-white dark:bg-[#22201D]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#D97757]/15 text-[#C96442] dark:text-[#E88F73] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm text-[#1A1917] dark:text-[#EDE8E0]">
                Claude Working Memory Filesystem
              </h2>
              <span className="text-[11px] text-[#7A766F] dark:text-[#9A968D]">
                Persistent across sessions • Handled per Anthropic Calibration standard
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

        {/* Main Body: Two Columns */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: File Explorer */}
          <div className="w-64 border-r border-[#E5E1D8] dark:border-[#2C2925] bg-[#F5F3ED] dark:bg-[#181714] p-3 flex flex-col justify-between">
            <div className="space-y-1 overflow-y-auto">
              <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#8A857B] dark:text-[#7A766E]">
                <span>Files</span>
                <button
                  onClick={() => setIsAdding(true)}
                  className="p-1 text-[#C96442] hover:bg-black/5 dark:hover:bg-white/5 rounded"
                  title="Add Memory File"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {memoryFiles.map((file) => {
                const isSelected = file.path === selectedPath;
                return (
                  <button
                    key={file.path}
                    onClick={() => {
                      setSelectedPath(file.path);
                      setIsAdding(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-start gap-2 transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-[#252320] text-[#1A1917] dark:text-white font-medium shadow-2xs border border-[#DDD8CE] dark:border-[#38352F]'
                        : 'text-[#58544D] dark:text-[#C5C0B6] hover:bg-[#EAE6DC] dark:hover:bg-[#22201D]'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-[#D97757] shrink-0 mt-0.5" />
                    <div className="truncate flex-1">
                      <div className="font-mono text-[11px] truncate">{file.path}</div>
                      <div className="text-[10px] text-[#8A857B] dark:text-[#7A766E] truncate">
                        {file.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Privacy note */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#22201D] border border-[#E5E1D8] dark:border-[#2C2925] text-[10px] text-[#7A766F] dark:text-[#9A968D] space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#1A1917] dark:text-[#EDE8E0]">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                <span>Anthropic Privacy Guard</span>
              </div>
              <p className="leading-tight">
                Protected attributes (health conditions, passwords, race) are excluded. Durable [stated] facts only.
              </p>
            </div>
          </div>

          {/* Right Column: File Editor / Creator */}
          <div className="flex-1 flex flex-col bg-white dark:bg-[#1E1D1A] overflow-hidden">
            {isAdding ? (
              <div className="p-6 space-y-4 max-w-lg">
                <h3 className="font-serif font-bold text-sm text-[#1A1917] dark:text-white">
                  Create New Memory File
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-medium text-[#48453F] dark:text-[#C5C0B6] mb-1">
                      Path (e.g. /topics/reading.md or /areas/mobile-app.md)
                    </label>
                    <input
                      type="text"
                      placeholder="/topics/reading.md"
                      value={newPath}
                      onChange={(e) => setNewPath(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#DDD8CE] dark:border-[#38352F] bg-[#FAF9F5] dark:bg-[#252320]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#48453F] dark:text-[#C5C0B6] mb-1">
                      Slug Name
                    </label>
                    <input
                      type="text"
                      placeholder="reading"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#DDD8CE] dark:border-[#38352F] bg-[#FAF9F5] dark:bg-[#252320]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#48453F] dark:text-[#C5C0B6] mb-1">
                      Description (What it covers)
                    </label>
                    <input
                      type="text"
                      placeholder="User reading tastes and favorite books"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#DDD8CE] dark:border-[#38352F] bg-[#FAF9F5] dark:bg-[#252320]"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleCreateFile}
                      className="px-4 py-2 rounded-xl bg-[#D97757] text-white font-semibold text-xs hover:bg-[#C96442]"
                    >
                      Create File
                    </button>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="px-4 py-2 rounded-xl border border-[#DDD8CE] text-xs hover:bg-black/5"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : activeFile ? (
              <>
                <div className="h-12 px-4 border-b border-[#E5E1D8] dark:border-[#2C2925] flex items-center justify-between bg-[#FAF9F5] dark:bg-[#22201D]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#1A1917] dark:text-[#EDE8E0]">
                      {activeFile.path}
                    </span>
                    <span className="text-[11px] text-[#7A766F] dark:text-[#9A968D]">
                      ({activeFile.description})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeFile.path !== '/profile.md' &&
                      activeFile.path !== '/preferences.md' && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${activeFile.path}?`)) {
                              onDeleteFile(activeFile.path);
                              setSelectedPath('/profile.md');
                            }
                          }}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          title="Delete memory file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D97757] hover:bg-[#C96442] text-white font-semibold text-xs shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Memory</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-hidden flex flex-col">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full flex-1 p-3.5 font-mono text-xs text-[#1F1E1B] dark:text-[#ECE8E1] bg-[#FAF9F5] dark:bg-[#171614] rounded-xl border border-[#DDD8CE] dark:border-[#38352F] resize-none outline-none focus:border-[#D97757]"
                  />
                  <div className="mt-2 text-[11px] text-[#7A766F] dark:text-[#9A968D] flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>
                      Tagged with [stated]. Claude will silently apply these facts to future turns.
                    </span>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#FAF9F5] dark:bg-[#201F1C] border-t border-[#E5E1D8] dark:border-[#2C2925] flex items-center justify-between text-[11px] text-[#7A766F] dark:text-[#9A968D]">
          <span>Offline & Local Storage Synchronized</span>
          <span>
            App created by <strong className="font-semibold text-[#1A1917] dark:text-white">Hafiz Muhammad Huzaifa Shamim</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
