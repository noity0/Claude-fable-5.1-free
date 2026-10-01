import { Artifact } from '../types';

export function parseArtifactsFromContent(text: string, messageId: string): {
  cleanContent: string;
  artifacts: Artifact[];
} {
  const artifacts: Artifact[] = [];
  let cleanContent = text;

  // Pattern 1: Explicit ```antArtifact or <antArtifact> tags
  const antArtifactRegex = /```antArtifact\s*([\s\S]*?)---+\s*([\s\S]*?)```/g;
  let match;

  while ((match = antArtifactRegex.exec(text)) !== null) {
    const headerBlock = match[1];
    const codeBlock = match[2].trim();

    // Parse header lines: identifier, type, title, language
    const identifierMatch = headerBlock.match(/identifier:\s*"?([^"\n]+)"?/i);
    const typeMatch = headerBlock.match(/type:\s*"?([^"\n]+)"?/i);
    const titleMatch = headerBlock.match(/title:\s*"?([^"\n]+)"?/i);
    const langMatch = headerBlock.match(/language:\s*"?([^"\n]+)"?/i);

    const artifact: Artifact = {
      id: `art-${messageId}-${artifacts.length + 1}`,
      identifier: identifierMatch ? identifierMatch[1].trim() : `artifact-${Date.now()}`,
      type: typeMatch ? typeMatch[1].trim() : 'application/vnd.ant.code',
      title: titleMatch ? titleMatch[1].trim() : 'Generated Artifact',
      language: langMatch ? langMatch[1].trim() : 'text',
      content: codeBlock,
      messageId,
    };

    artifacts.push(artifact);
  }

  // Also check for XML-style <antArtifact identifier="..." type="..." title="...">...</antArtifact>
  const xmlArtifactRegex = /<antArtifact\s+identifier="([^"]+)"\s+type="([^"]+)"(?:\s+language="([^"]*)")?\s+title="([^"]+)">([\s\S]*?)<\/antArtifact>/gi;
  while ((match = xmlArtifactRegex.exec(text)) !== null) {
    const [, identifier, type, language, title, content] = match;
    const existing = artifacts.find((a) => a.identifier === identifier);
    if (!existing) {
      artifacts.push({
        id: `art-xml-${messageId}-${artifacts.length + 1}`,
        identifier,
        type,
        title,
        language: language || (type.includes('html') ? 'html' : type.includes('svg') ? 'svg' : 'javascript'),
        content: content.trim(),
        messageId,
      });
    }
  }

  // Fallback: If no antArtifact tag was found, check if there's any code block (> 6 lines or html/svg/json/csv/xml)
  if (artifacts.length === 0) {
    const codeBlockRegex = /```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g;
    let fallbackMatch;
    let idx = 0;
    while ((fallbackMatch = codeBlockRegex.exec(text)) !== null) {
      const rawLang = (fallbackMatch[1] || 'text').toLowerCase();
      const code = fallbackMatch[2].trim();
      const lineCount = code.split('\n').length;

      // Skip empty or trivial 1-2 line blocks
      if (lineCount < 5 && rawLang !== 'html' && rawLang !== 'svg') {
        continue;
      }

      idx++;
      let type = 'application/vnd.ant.code';
      let title = `${rawLang.toUpperCase()} File`;

      if (rawLang === 'html') {
        type = 'text/html';
        title = 'Interactive Web Application';
      } else if (rawLang === 'svg') {
        type = 'image/svg+xml';
        title = 'Vector SVG Graphic';
      } else if (rawLang === 'tsx' || rawLang === 'jsx') {
        type = 'application/vnd.ant.react';
        title = 'React Component';
      } else if (rawLang === 'json') {
        title = 'Data JSON Document';
      } else if (rawLang === 'csv') {
        title = 'Spreadsheet Data (CSV)';
      } else if (rawLang === 'md' || rawLang === 'markdown') {
        type = 'text/markdown';
        title = 'Document / Presentation Notes';
      } else if (rawLang === 'python' || rawLang === 'py') {
        title = 'Python Program / Script';
      } else if (rawLang === 'bash' || rawLang === 'sh') {
        title = 'Executable Shell Script';
      }

      artifacts.push({
        id: `art-auto-${messageId}-${idx}`,
        identifier: `artifact-${idx}`,
        type,
        title,
        language: rawLang,
        content: code,
        messageId,
      });
    }
  }

  return { cleanContent, artifacts };
}
