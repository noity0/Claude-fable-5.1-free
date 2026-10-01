import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Database,
  Sparkles,
  FileText,
  X,
  Search,
  Edit2,
  Check,
  Cpu,
  User,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Conversation, UserAccount } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
  onClearAllConversations?: () => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenMemory: () => void;
  onOpenPromptInspector: () => void;
  onOpenAbilities: () => void;
  currentUser: UserAccount;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onClearAllConversations,
  isOpen,
  onClose,
  onOpenMemory,
  onOpenPromptInspector,
  onOpenAbilities,
  currentUser,
  onOpenAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Group conversations into Today, Yesterday, Previous 7 Days, Older
  const filteredAndGroupedConversations = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const filtered = conversations.filter((c) =>
      (c.title || 'Untitled Chat').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups: {
      today: Conversation[];
      yesterday: Conversation[];
      pastWeek: Conversation[];
      older: Conversation[];
    } = {
      today: [],
      yesterday: [],
      pastWeek: [],
      older: [],
    };

    filtered.forEach((c) => {
      const diff = now - (c.updatedAt || c.createdAt);
      if (diff < oneDay) {
        groups.today.push(c);
      } else if (diff < 2 * oneDay) {
        groups.yesterday.push(c);
      } else if (diff < 7 * oneDay) {
        groups.pastWeek.push(c);
      } else {
        groups.older.push(c);
      }
    });

    return groups;
  }, [conversations, searchQuery]);

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setEditTitle(conv.title || 'Untitled Chat');
  };

  const handleSaveRename = (convId: string, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    if (onRenameConversation && editTitle.trim()) {
      onRenameConversation(convId, editTitle.trim());
    }
    setEditingConvId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#F5F3ED] dark:bg-[#181715] border-r border-[#E5E1D8] dark:border-[#2C2A26] flex flex-col transition-transform duration-200 ease-in-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header */}
        <div className="p-3.5 border-b border-[#E5E1D8] dark:border-[#2C2A26] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#D97757] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif font-bold text-sm text-[#1B1917] dark:text-[#EAE6DF] leading-tight">
                  Claude Fable 5.1
                </h1>
                <span className="text-[9px] font-bold px-1 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  TOP
                </span>
              </div>
              <span className="text-[10px] text-[#7A766F] dark:text-[#9A968D]">
                Anthropic Mythos Tier
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 text-[#7A766F] hover:text-[#1B1917]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Start New Chat Action */}
        <div className="p-3 space-y-2">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white dark:bg-[#23211D] border border-[#DDD8CE] dark:border-[#38352F] text-xs font-semibold text-[#1C1A17] dark:text-[#EDEAE3] hover:border-[#D97757] hover:shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D97757]" />
            <span>New Chat</span>
          </button>

          {/* Search History Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8A857B] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-xl text-xs bg-white/70 dark:bg-[#201E1B] border border-[#E0DCD4] dark:border-[#322F2A] text-[#1C1A17] dark:text-[#EDEAE3] placeholder-[#8A857B] outline-none focus:border-[#D97757]"
            />
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-3">
          {conversations.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-[#8A857B] dark:text-[#7A766E]">
              No conversations yet. Start a new chat above!
            </div>
          ) : (
            <>
              {/* Today */}
              {filteredAndGroupedConversations.today.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#8A857B] dark:text-[#7A766E]">
                    Today
                  </div>
                  <div className="space-y-0.5">
                    {filteredAndGroupedConversations.today.map((conv) =>
                      renderConversationItem(conv)
                    )}
                  </div>
                </div>
              )}

              {/* Yesterday */}
              {filteredAndGroupedConversations.yesterday.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#8A857B] dark:text-[#7A766E]">
                    Yesterday
                  </div>
                  <div className="space-y-0.5">
                    {filteredAndGroupedConversations.yesterday.map((conv) =>
                      renderConversationItem(conv)
                    )}
                  </div>
                </div>
              )}

              {/* Past 7 Days */}
              {filteredAndGroupedConversations.pastWeek.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#8A857B] dark:text-[#7A766E]">
                    Previous 7 Days
                  </div>
                  <div className="space-y-0.5">
                    {filteredAndGroupedConversations.pastWeek.map((conv) =>
                      renderConversationItem(conv)
                    )}
                  </div>
                </div>
              )}

              {/* Older */}
              {filteredAndGroupedConversations.older.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#8A857B] dark:text-[#7A766E]">
                    Older
                  </div>
                  <div className="space-y-0.5">
                    {filteredAndGroupedConversations.older.map((conv) =>
                      renderConversationItem(conv)
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Clear History button if chats exist */}
        {conversations.length > 0 && (
          <div className="px-3 py-1.5 border-t border-[#E5E1D8] dark:border-[#2C2A26]">
            {showClearConfirm ? (
              <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300">
                <span>Clear all history?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (onClearAllConversations) onClearAllConversations();
                      setShowClearConfirm(false);
                    }}
                    className="font-bold underline"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="text-[#666]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full text-left text-[11px] text-[#8C877D] hover:text-red-600 transition-colors flex items-center gap-1.5 py-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear all conversations</span>
              </button>
            )}
          </div>
        )}

        {/* Navigation & Utilities */}
        <div className="p-2 border-t border-[#E5E1D8] dark:border-[#2C2A26] space-y-0.5">
          <button
            onClick={() => {
              onOpenAbilities();
              onClose();
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-[#48453F] dark:text-[#C5C0B6] hover:bg-[#EEEBE2] dark:hover:bg-[#24221E] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Claude Abilities Matrix</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400">
              5 Models
            </span>
          </button>

          <button
            onClick={() => {
              onOpenMemory();
              onClose();
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-[#48453F] dark:text-[#C5C0B6] hover:bg-[#EEEBE2] dark:hover:bg-[#24221E] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#D97757]" />
              <span>Local Memory System</span>
            </div>
            <span className="text-[10px] text-[#8A857B]">Cross-Session</span>
          </button>

          <button
            onClick={() => {
              onOpenPromptInspector();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-[#48453F] dark:text-[#C5C0B6] hover:bg-[#EEEBE2] dark:hover:bg-[#24221E] transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[#635F57] dark:text-[#A7A39B]" />
            <span>Prompt & System Rules</span>
          </button>
        </div>

        {/* User Account Bar */}
        <div className="p-2.5 border-t border-[#E5E1D8] dark:border-[#2C2A26] bg-[#ECE9E0] dark:bg-[#1E1C1A]">
          <button
            onClick={() => {
              onOpenAuth();
              onClose();
            }}
            className="w-full p-2 rounded-xl bg-white dark:bg-[#262420] border border-[#DDD8CE] dark:border-[#38352F] hover:border-[#D97757] transition-all flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2 overflow-hidden">
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
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-[#1A1917] dark:text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-[#7A766F] dark:text-[#9A968D] truncate">
                  {currentUser.isGuest ? 'Guest Mode (Click to Sign In)' : currentUser.email}
                </div>
              </div>
            </div>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded shrink-0 ${
                currentUser.isGuest
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                  : 'bg-green-500/15 text-green-700 dark:text-green-300'
              }`}
            >
              {currentUser.isGuest ? 'Guest' : 'Google'}
            </span>
          </button>
        </div>

        {/* Explicit Creator Credit Footer */}
        <div className="p-2.5 bg-[#FAF9F5] dark:bg-[#181715] border-t border-[#E5E1D8] dark:border-[#2C2A26] text-center">
          <div className="text-[11px] text-[#69655D] dark:text-[#A7A299] leading-tight">
            App created by{' '}
            <strong className="font-bold text-[#1A1917] dark:text-white">
              Hafiz Muhammad Huzaifa Shamim
            </strong>
          </div>
        </div>
      </aside>
    </>
  );

  function renderConversationItem(conv: Conversation) {
    const isActive = conv.id === activeConversationId;
    const isEditing = editingConvId === conv.id;

    if (isEditing) {
      return (
        <div
          key={conv.id}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-white dark:bg-[#252320] border border-[#D97757]"
        >
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(conv.id)}
            autoFocus
            className="flex-1 bg-transparent text-xs outline-none text-[#1A1917] dark:text-white"
          />
          <button
            onClick={(e) => handleSaveRename(conv.id, e)}
            className="p-1 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    return (
      <div
        key={conv.id}
        onClick={() => {
          onSelectConversation(conv.id);
          onClose();
        }}
        className={`group relative flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition-colors ${
          isActive
            ? 'bg-[#EAE5DA] dark:bg-[#2C2924] text-[#1B1917] dark:text-white font-medium'
            : 'text-[#48453F] dark:text-[#C5C0B6] hover:bg-[#EEEBE2] dark:hover:bg-[#24221E]'
        }`}
      >
        <MessageSquare className="w-3.5 h-3.5 text-[#888379] shrink-0" />
        <span className="truncate flex-1">{conv.title || 'Untitled Chat'}</span>

        {/* Hover Actions: Rename & Delete */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
          <button
            onClick={(e) => handleStartRename(conv, e)}
            className="p-1 text-[#8A857C] hover:text-[#1A1917] dark:hover:text-white rounded"
            title="Rename chat"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => onDeleteConversation(conv.id, e)}
            className="p-1 text-[#8A857C] hover:text-red-500 rounded"
            title="Delete chat"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }
};
