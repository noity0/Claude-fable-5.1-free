import { MemoryFile } from '../types';

export const INITIAL_MEMORY_FILES: MemoryFile[] = [
  {
    path: '/profile.md',
    name: 'profile',
    description: 'User identity, role, and stable background',
    content: `---
name: profile
description: User identity and stable background context
sources: [chat]
---

- [stated] Full-stack engineer & AI application builder
- [stated] Working with TypeScript, React, Node.js, and modern AI platforms
- [stated] Uses Claude Fable 5.1 for rapid prototyping and complex systems design`,
    updatedAt: new Date().toISOString(),
  },
  {
    path: '/preferences.md',
    name: 'preferences',
    description: 'Behavioral and formatting preferences for responses',
    content: `---
name: preferences
description: How Claude should format and tailor its responses
sources: [chat]
---

- [stated] Prefers clean, modern TypeScript code with proper types
- [stated] Values interactive Artifacts for visual output and working prototypes
- [stated] Appreciates concise, insightful responses without superfluous pleasantries`,
    updatedAt: new Date().toISOString(),
  },
  {
    path: '/topics/tech-stack.md',
    name: 'tech-stack',
    description: 'Preferred libraries, styling frameworks, and technical standards',
    content: `---
name: tech-stack
description: Preferred languages, packages, and architecture patterns
sources: [chat]
---

- [stated] Uses Tailwind CSS for responsive styling
- [stated] Prefers Vite and React for frontend web apps
- [stated] Uses @google/genai SDK for Gemini-powered capabilities`,
    updatedAt: new Date().toISOString(),
  },
  {
    path: '/areas/fable-studio.md',
    name: 'fable-studio',
    description: 'Current workspace project and goals',
    content: `---
name: fable-studio
description: Claude Fable 5.1 chat and artifacts project
sources: [chat]
---

- [stated] Building an interactive Claude Fable 5.1 client powered by Gemini engine
- [stated] Supporting Claude 5 Mythos-class model family selection and live Artifacts`,
    updatedAt: new Date().toISOString(),
  },
];
