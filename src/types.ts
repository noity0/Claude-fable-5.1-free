export type ClaudeModelId =
  | 'claude-fable-5-1'
  | 'claude-mythos-5-1'
  | 'claude-opus-5'
  | 'claude-sonnet-5'
  | 'claude-haiku-4-5-20251001';

export interface ClaudeModelInfo {
  id: ClaudeModelId;
  name: string;
  tagline: string;
  tier: string;
  thinkingLevel: string;
  reasoningPower: string;
  speed: string;
  description: string;
  badge?: string;
  accent: string;
}

export interface Artifact {
  id: string;
  identifier: string;
  type: 'application/vnd.ant.code' | 'text/html' | 'image/svg+xml' | 'text/markdown' | 'application/vnd.ant.react' | string;
  title: string;
  language: string;
  content: string;
  messageId?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  modelUsed?: ClaudeModelId;
  artifacts?: Artifact[];
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: ClaudeModelId;
}

export interface MemoryFile {
  path: string;
  name: string;
  description: string;
  content: string;
  updatedAt: string;
}

export type ToneStyle = 'normal' | 'concise' | 'explanatory' | 'formal';

export interface UserAccount {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  isGuest: boolean;
  signedInAt: number;
}
