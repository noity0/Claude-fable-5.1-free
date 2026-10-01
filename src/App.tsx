import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ArtifactPanel } from './components/ArtifactPanel';
import { MemoryModal } from './components/MemoryModal';
import { PromptInspectorModal } from './components/PromptInspectorModal';
import { AuthModal } from './components/AuthModal';
import { AbilitiesModal } from './components/AbilitiesModal';
import { CLAUDE_MODELS } from './constants/models';
import { INITIAL_MEMORY_FILES } from './utils/defaultMemory';
import { parseArtifactsFromContent } from './utils/artifactParser';
import {
  Conversation,
  Message,
  ClaudeModelId,
  ToneStyle,
  Artifact,
  MemoryFile,
  UserAccount,
} from './types';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Database, Award } from 'lucide-react';

const STORAGE_KEY_CONVS = 'claude_fable_conversations_v1';
const STORAGE_KEY_ACTIVE_ID = 'claude_fable_active_id_v1';
const STORAGE_KEY_MEMORIES = 'claude_fable_memories_v1';
const STORAGE_KEY_MODEL = 'claude_fable_model_v1';
const STORAGE_KEY_USER = 'claude_fable_user_v1';

export default function App() {
  // User Authentication State (Optional Google vs Guest)
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      id: 'guest-default',
      name: 'Guest User',
      isGuest: true,
      signedInAt: Date.now(),
    };
  });

  // Model & Tone State
  const [currentModel, setCurrentModel] = useState<ClaudeModelId>(() => {
    return (localStorage.getItem(STORAGE_KEY_MODEL) as ClaudeModelId) || 'claude-fable-5-1';
  });
  const [toneStyle, setToneStyle] = useState<ToneStyle>('normal');

  // Memory Filesystem State
  const [memoryFiles, setMemoryFiles] = useState<MemoryFile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MEMORIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_MEMORY_FILES;
      }
    }
    return INITIAL_MEMORY_FILES;
  });

  // Conversations State
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONVS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || '';
  });

  // Streaming State & Abort Controller
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Active Artifact & Panel State (Optional, not auto-opened)
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  const [isArtifactPanelOpen, setIsArtifactPanelOpen] = useState(false);
  const [artifactViewMode, setArtifactViewMode] = useState<'preview' | 'code'>('preview');

  const handleOpenArtifact = (art: Artifact, mode: 'preview' | 'code' = 'preview') => {
    setActiveArtifact(art);
    setArtifactViewMode(mode);
    setIsArtifactPanelOpen(true);
  };

  // Modals & Navigation
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isPromptInspectorOpen, setIsPromptInspectorOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAbilitiesModalOpen, setIsAbilitiesModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeConversationId);
  }, [activeConversationId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(memoryFiles));
  }, [memoryFiles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MODEL, currentModel);
  }, [currentModel]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Current active conversation
  const currentConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  const messages = currentConversation ? currentConversation.messages : [];

  // Collect all artifacts from the current conversation
  const allCurrentArtifacts = messages.flatMap((m) => m.artifacts || []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Create new chat
  const handleNewChat = () => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'New conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: currentModel,
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    setActiveArtifact(null);
    setIsArtifactPanelOpen(false);
  };

  // Rename chat
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  // Clear all chats
  const handleClearAllConversations = () => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
    setConversations([]);
    setActiveConversationId('');
    setActiveArtifact(null);
    setIsArtifactPanelOpen(false);
  };

  // Delete chat
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        setActiveConversationId('');
      }
      setActiveArtifact(null);
      setIsArtifactPanelOpen(false);
    }
  };

  // Compile memory context for the model system prompt
  const getCompiledMemoryContext = () => {
    return memoryFiles
      .map((f) => `### File: ${f.path}\n${f.content.trim()}`)
      .join('\n\n');
  };

  // Send message
  const handleSendMessage = async (text: string, enableSearch: boolean) => {
    if (!text.trim() || isStreaming) return;

    let convId = activeConversationId;
    let targetConv = currentConversation;

    // If no active conversation, create one
    if (!convId || !targetConv) {
      convId = `conv-${Date.now()}`;
      targetConv = {
        id: convId,
        title: text.slice(0, 32) + (text.length > 32 ? '...' : ''),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: currentModel,
      };
      setConversations((prev) => [targetConv!, ...prev]);
      setActiveConversationId(convId);
    } else if (targetConv.messages.length === 0) {
      // Set title on first turn
      const updatedTitle = text.slice(0, 32) + (text.length > 32 ? '...' : '');
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, title: updatedTitle } : c))
      );
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const assistantMessageId = `msg-${Date.now()}-assistant`;
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      modelUsed: currentModel,
      isStreaming: true,
      artifacts: [],
    };

    // Update conversation with user message and empty streaming assistant message
    const updatedMessages = [...(targetConv?.messages || []), userMessage, initialAssistantMessage];
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, messages: updatedMessages, updatedAt: Date.now() } : c))
    );

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: updatedMessages.slice(0, -1).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: currentModel,
          style: toneStyle,
          enableSearch,
          memoryContext: getCompiledMemoryContext(),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                accumulatedText += `\n\n*[Error: ${parsed.error}]*`;
              } else if (parsed.text) {
                accumulatedText += parsed.text;
              }

              // Parse artifacts on the fly
              const { artifacts } = parseArtifactsFromContent(
                accumulatedText,
                assistantMessageId
              );

              // Update conversation state with stream chunk
              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id !== convId) return c;
                  return {
                    ...c,
                    messages: c.messages.map((m) => {
                      if (m.id !== assistantMessageId) return m;
                      return {
                        ...m,
                        content: accumulatedText,
                        artifacts,
                        isStreaming: !parsed.done,
                      };
                    }),
                  };
                })
              );

              // If a new artifact was detected, set it as active without interrupting chat view
              if (artifacts.length > 0) {
                setActiveArtifact(artifacts[artifacts.length - 1]);
              }
            } catch (err) {
              // Ignore non-json lines
            }
          }
        }
      }

      // Finalize parsing and check memory extraction
      const { artifacts: finalArtifacts } = parseArtifactsFromContent(
        accumulatedText,
        assistantMessageId
      );

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id !== assistantMessageId) return m;
              return {
                ...m,
                content: accumulatedText,
                artifacts: finalArtifacts,
                isStreaming: false,
              };
            }),
          };
        })
      );

      if (finalArtifacts.length > 0) {
        setActiveArtifact(finalArtifacts[finalArtifacts.length - 1]);
      }

      // Background pass: Check if durable user memory was revealed
      triggerBackgroundMemoryPass(updatedMessages.slice(0, -1).concat({
        ...initialAssistantMessage,
        content: accumulatedText,
      }));
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Chat error:', error);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== convId) return c;
            return {
              ...c,
              messages: c.messages.map((m) => {
                if (m.id !== assistantMessageId) return m;
                return {
                  ...m,
                  content: m.content + `\n\n*[Connection failed: ${error?.message || 'Unable to connect to Claude Fable engine'}]*`,
                  isStreaming: false,
                };
              }),
            };
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Background memory pass simulation
  const triggerBackgroundMemoryPass = async (chatMessages: Message[]) => {
    try {
      const res = await fetch('/api/memory/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatMessages,
          currentMemories: memoryFiles,
        }),
      });
      const data = await res.json();
      if (data.updates && Array.isArray(data.updates) && data.updates.length > 0) {
        setMemoryFiles((prev) => {
          let updated = [...prev];
          for (const upd of data.updates) {
            const idx = updated.findIndex((f) => f.path === upd.path);
            if (idx >= 0) {
              updated[idx] = {
                ...updated[idx],
                content: `${updated[idx].content.trim()}\n${upd.content}`,
                updatedAt: new Date().toISOString(),
              };
            }
          }
          return updated;
        });
      }
    } catch (e) {
      // Non-blocking
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  const activeModel = CLAUDE_MODELS.find((m) => m.id === currentModel) || CLAUDE_MODELS[0];

  return (
    <div className="flex h-[100dvh] w-full max-w-full overflow-hidden bg-[#FAF9F5] dark:bg-[#1A1917] text-[#1C1A17] dark:text-[#EDE8E0] font-sans antialiased">
      {/* Left Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => {
          setActiveConversationId(id);
          const conv = conversations.find((c) => c.id === id);
          const convArtifacts = conv?.messages.flatMap((m) => m.artifacts || []) || [];
          if (convArtifacts.length > 0) {
            setActiveArtifact(convArtifacts[convArtifacts.length - 1]);
          } else {
            setActiveArtifact(null);
            setIsArtifactPanelOpen(false);
          }
        }}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onClearAllConversations={handleClearAllConversations}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenMemory={() => setIsMemoryModalOpen(true)}
        onOpenPromptInspector={() => setIsPromptInspectorOpen(true)}
        onOpenAbilities={() => setIsAbilitiesModalOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Chat Center & Right Artifact Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          currentModel={currentModel}
          onSelectModel={setCurrentModel}
          toneStyle={toneStyle}
          onSelectToneStyle={setToneStyle}
          onOpenMemory={() => setIsMemoryModalOpen(true)}
          onOpenPromptInspector={() => setIsPromptInspectorOpen(true)}
          onOpenAbilities={() => setIsAbilitiesModalOpen(true)}
          onNewChat={handleNewChat}
          memoryCount={memoryFiles.length}
          activeArtifact={activeArtifact}
          isArtifactPanelOpen={isArtifactPanelOpen}
          onToggleArtifactPanel={() => setIsArtifactPanelOpen(!isArtifactPanelOpen)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Split View: Chat Stream + Artifacts Drawer */}
        <div className="flex-1 flex h-[calc(100vh-3.5rem)] overflow-hidden">
          {/* Chat Stream Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                /* Hero / Welcome screen */
                <div className="max-w-2xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#D97757] flex items-center justify-center text-white shadow-md mb-4">
                    <Sparkles className="w-8 h-8 fill-current" />
                  </div>

                  {/* Author credit badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-semibold mb-3">
                    <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>App created by Hafiz Muhammad Huzaifa Shamim</span>
                  </div>

                  <h2 className="font-serif font-bold text-2xl md:text-3xl text-[#181715] dark:text-[#EDE8E0] mb-2 tracking-tight">
                    Welcome to {activeModel.name}
                  </h2>
                  <p className="text-sm md:text-base text-[#6F6B62] dark:text-[#A7A39A] max-w-lg mb-6 leading-relaxed">
                    Anthropic’s breakthrough {activeModel.tier} model family. Featuring advanced reasoning, live interactive Artifacts, and working memory filesystem.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs text-[#59554D] dark:text-[#BCB8AF]">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#252320] border border-[#DDD8CE] dark:border-[#38352F]">
                      <Zap className="w-3.5 h-3.5 text-[#D97757]" />
                      Mythos-Class Architecture
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#252320] border border-[#DDD8CE] dark:border-[#38352F]">
                      <Database className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      Memory Filesystem
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#252320] border border-[#DDD8CE] dark:border-[#38352F]">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                      Anthropic Constitution
                    </span>
                  </div>
                </div>
              ) : (
                /* Message List */
                <div className="divide-y divide-transparent">
                  {messages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      activeArtifactId={activeArtifact?.id}
                      onOpenArtifact={handleOpenArtifact}
                    />
                  ))}
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              )}
            </div>

            {/* Bottom Chat Input */}
            <div className="shrink-0 bg-gradient-to-t from-[#FAF9F5] via-[#FAF9F5] to-transparent dark:from-[#1A1917] dark:via-[#1A1917] pt-2">
              <ChatInput
                onSendMessage={handleSendMessage}
                isStreaming={isStreaming}
                onStopStreaming={handleStopStreaming}
                hasMessages={messages.length > 0}
              />
            </div>
          </div>

          {/* Right Artifact Panel */}
          {isArtifactPanelOpen && activeArtifact && (
            <ArtifactPanel
              artifacts={allCurrentArtifacts}
              activeArtifact={activeArtifact}
              initialViewMode={artifactViewMode}
              onSelectArtifact={setActiveArtifact}
              onClose={() => setIsArtifactPanelOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Memory Filesystem Modal */}
      <MemoryModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        memoryFiles={memoryFiles}
        onSaveFile={(updatedFile) => {
          setMemoryFiles((prev) =>
            prev.map((f) => (f.path === updatedFile.path ? updatedFile : f))
          );
        }}
        onDeleteFile={(path) => {
          setMemoryFiles((prev) => prev.filter((f) => f.path !== path));
        }}
        onAddFile={(newFile) => {
          setMemoryFiles((prev) => [...prev, newFile]);
        }}
      />

      {/* System Prompt & Architecture Inspector Modal */}
      <PromptInspectorModal
        isOpen={isPromptInspectorOpen}
        onClose={() => setIsPromptInspectorOpen(false)}
        activeModelName={activeModel.name}
      />

      {/* Authentication Modal (Google / Guest) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={setCurrentUser}
      />

      {/* Claude Abilities Matrix Modal */}
      <AbilitiesModal
        isOpen={isAbilitiesModalOpen}
        onClose={() => setIsAbilitiesModalOpen(false)}
        currentModel={currentModel}
        onSelectModel={setCurrentModel}
      />
    </div>
  );
}
