#!/usr/bin/env node
/**
 * Pre-Commit Quality Hook
 *
 * Runs quality checks before git commit commands:
 * - TypeScript validation (tsc --noEmit) - WARN only
 * - Secret scanning - WARN with patterns
 * - Conventional commits validation
 *
 * Behavior: Warns but does NOT block commits (flexible mode)
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

interface HookInput {
    tool_name: string;
    tool_input: {
        command?: string;
        [key: string]: unknown;
    };
    session_id?: string;
    cwd?: string;
}

// Secret patterns to detect
const SECRET_PATTERNS = [
    { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g },
    { name: 'AWS Secret Key', pattern: /(?<![A-Za-z0-9/+=])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9/+=])/g },
    { name: 'GitHub Token', pattern: /gh[pousr]_[A-Za-z0-9_]{36,}/g },
    { name: 'Generic API Key', pattern: /(?:api[_-]?key|apikey|api_secret)['":\s]*['"]?([a-zA-Z0-9_\-]{20,})['"]?/gi },
    { name: 'Private Key', pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g },
    { name: 'JWT Token', pattern: /eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g },
    { name: 'Password in Code', pattern: /(?:password|passwd|pwd)['":\s]*['"]([^'"]{8,})['"]?/gi },
    { name: 'Vercel Token', pattern: /(?:VERCEL_TOKEN|vercel_token)['":\s]*['"]?([a-zA-Z0-9_\-]{20,})['"]?/gi },
    { name: 'Gemini API Key', pattern: /AIza[0-9A-Za-z_-]{35}/g },
];

// Whitelist patterns (false positives)
const WHITELIST_PATTERNS = [
    /process\.env\./,
    /\$\{.*\}/,
    /<.*API_KEY.*>/,
    /example|sample|test|mock|fake|dummy/i,
];

function isGitCommitCommand(command: string): boolean {
    return /git\s+commit/.test(command);
}

function getStagedFiles(cwd: string): string[] {
    try {
        const result = execSync('git diff --cached --name-only', {
            cwd,
            encoding: 'utf-8',
            timeout: 5000,
        });
        return result.trim().split('\n').filter(Boolean);
    } catch {
        return [];
    }
}

function getStagedContent(cwd: string): string {
    try {
        const result = execSync('git diff --cached', {
            cwd,
            encoding: 'utf-8',
            timeout: 10000,
        });
        return result;
    } catch {
        return '';
    }
}

function scanForSecrets(content: string): { pattern: string; match: string }[] {
    const findings: { pattern: string; match: string }[] = [];

    for (const { name, pattern } of SECRET_PATTERNS) {
        const matches = content.match(pattern);
        if (matches) {
            for (const match of matches) {
                // Check whitelist
                const isWhitelisted = WHITELIST_PATTERNS.some(wp => wp.test(match));
                if (!isWhitelisted) {
                    findings.push({
                        pattern: name,
                        match: match.substring(0, 20) + '...' // Truncate for safety
                    });
                }
            }
        }
    }

    return findings;
}

function runTypeScriptCheck(cwd: string): { success: boolean; errors: string } {
    try {
        // Check if tsconfig exists
        if (!existsSync(join(cwd, 'tsconfig.json'))) {
            return { success: true, errors: '' };
        }

        execSync('npx tsc --noEmit', {
            cwd,
            encoding: 'utf-8',
            timeout: 30000, // 30 second timeout
            stdio: 'pipe',
        });
        return { success: true, errors: '' };
    } catch (error: unknown) {
        const execError = error as { stdout?: string; stderr?: string };
        const output = execError.stdout || execError.stderr || 'Unknown TypeScript error';
        // Count errors
        const errorCount = (output.match(/error TS\d+/g) || []).length;
        return {
            success: false,
            errors: `${errorCount} TypeScript error(s) found`
        };
    }
}

function validateConventionalCommit(command: string): boolean {
    // Extract commit message from command
    const messageMatch = command.match(/-m\s+["']([^"']+)["']/);
    if (!messageMatch) {
        return true; // No message flag found, skip validation
    }

    const message = messageMatch[1];
    const conventionalPattern = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?!?:\s.+/;

    return conventionalPattern.test(message);
}

async function main() {
    try {
        // Read input from stdin
        const input = readFileSync(0, 'utf-8');
        const data: HookInput = JSON.parse(input);

        // Only process Bash tool with git commit commands
        if (data.tool_name !== 'Bash') {
            process.exit(0);
        }

        const command = data.tool_input?.command || '';
        if (!isGitCommitCommand(command)) {
            process.exit(0);
        }

        const cwd = data.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
        const warnings: string[] = [];

        // 1. Secret Scanning
        const stagedContent = getStagedContent(cwd);
        const secrets = scanForSecrets(stagedContent);
        if (secrets.length > 0) {
            warnings.push(`[SECRET WARNING] ${secrets.length} potential secret(s) found:`);
            secrets.forEach(s => {
                warnings.push(`  - ${s.pattern}: ${s.match}`);
            });
        }

        // 2. TypeScript Check
        const tscResult = runTypeScriptCheck(cwd);
        if (!tscResult.success) {
            warnings.push(`[TSC WARNING] ${tscResult.errors}`);
        }

        // 3. Conventional Commits
        if (!validateConventionalCommit(command)) {
            warnings.push('[COMMIT WARNING] Message does not follow conventional commits format');
            warnings.push('  Expected: type(scope): message');
            warnings.push('  Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert');
        }

        // Output warnings if any
        if (warnings.length > 0) {
            let output = '\n========================================\n';
            output += '[!] PRE-COMMIT QUALITY CHECK\n';
            output += '========================================\n\n';
            output += warnings.join('\n');
            output += '\n\n';
            output += 'Note: These are WARNINGS only. Commit will proceed.\n';
            output += 'Fix these issues when possible for better code quality.\n';
            output += '========================================\n';

            console.log(output);
        }

        // Always exit 0 (warn only, don't block)
        process.exit(0);

    } catch (err) {
        // Silent exit on errors - do not block user workflow
        process.exit(0);
    }
}

main().catch(() => process.exit(0));
