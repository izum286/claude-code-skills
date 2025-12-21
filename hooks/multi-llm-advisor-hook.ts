#!/usr/bin/env npx tsx
/**
 * Multi-LLM Advisor Hook
 * Triggers on architecture decisions, code reviews, and debugging scenarios
 *
 * Activated via PreToolUse when relevant patterns detected
 */

import * as fs from 'fs';
import * as path from 'path';

interface HookInput {
  tool_input?: {
    command?: string;
    content?: string;
    file_path?: string;
    old_string?: string;
    new_string?: string;
  };
  session_id?: string;
}

interface HookOutput {
  decision: 'approve' | 'block' | 'suggest';
  message?: string;
}

// Keywords that trigger LLM advisor suggestion
const ARCHITECTURE_KEYWORDS = [
  'refactor', 'architecture', 'redesign', 'migrate', 'restructure',
  'new feature', 'implement', 'design pattern', 'scaling', 'performance'
];

const REVIEW_KEYWORDS = [
  'review', 'security', 'vulnerability', 'audit', 'check',
  'best practice', 'code quality', 'typescript strict'
];

const DEBUG_KEYWORDS = [
  'debug', 'error', 'bug', 'fix', 'issue', 'crash', 'exception',
  'not working', 'fails', 'broken', 'undefined', 'null'
];

function detectMode(text: string): 'architecture' | 'review' | 'debug' | null {
  const lowerText = text.toLowerCase();

  // Check for architecture patterns
  if (ARCHITECTURE_KEYWORDS.some(kw => lowerText.includes(kw))) {
    return 'architecture';
  }

  // Check for review patterns
  if (REVIEW_KEYWORDS.some(kw => lowerText.includes(kw))) {
    return 'review';
  }

  // Check for debug patterns
  if (DEBUG_KEYWORDS.some(kw => lowerText.includes(kw))) {
    return 'debug';
  }

  return null;
}

function main() {
  try {
    // Read hook input from stdin
    const stdinBuffer = fs.readFileSync(0, 'utf-8');
    const input: HookInput = JSON.parse(stdinBuffer);

    // Combine all text from input for analysis
    const textToAnalyze = [
      input.tool_input?.command,
      input.tool_input?.content,
      input.tool_input?.new_string
    ].filter(Boolean).join(' ');

    const detectedMode = detectMode(textToAnalyze);

    if (detectedMode) {
      // Log suggestion transparently
      const output: HookOutput = {
        decision: 'approve', // Don't block, just suggest
        message: `
╔════════════════════════════════════════════════════════════════════╗
║  MULTI-LLM ADVISOR AVAILABLE                                       ║
╠════════════════════════════════════════════════════════════════════╣
║  Detected: ${detectedMode.toUpperCase().padEnd(55)}║
║  Keywords found in your request.                                   ║
║                                                                    ║
║  To get additional perspectives from Codex + Gemini:               ║
║  > Use the multi-llm-advisor skill for ${detectedMode.padEnd(27)}║
║                                                                    ║
║  This will call both LLMs and show you their responses.            ║
╚════════════════════════════════════════════════════════════════════╝
`
      };

      console.log(JSON.stringify(output));
    } else {
      // No relevant patterns detected
      console.log(JSON.stringify({ decision: 'approve' }));
    }
  } catch (error) {
    // On error, approve and continue
    console.log(JSON.stringify({ decision: 'approve' }));
  }
}

main();
