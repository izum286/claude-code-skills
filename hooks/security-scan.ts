#!/usr/bin/env node
/**
 * Security Scan Hook
 *
 * Pre-execution security check for Bash commands:
 * - Detects dangerous git operations (force push, hard reset)
 * - Warns about secrets in command arguments
 * - Prevents accidental exposure of sensitive data
 * - Checks for destructive file operations
 *
 * Behavior: BLOCKS dangerous operations, WARNS about suspicious ones
 */

import { readFileSync } from 'fs';

interface HookInput {
    tool_name: string;
    tool_input: {
        command?: string;
        [key: string]: unknown;
    };
    session_id?: string;
    cwd?: string;
}

interface SecurityIssue {
    severity: 'critical' | 'warning' | 'info';
    type: string;
    message: string;
    recommendation?: string;
}

// Dangerous patterns that should be BLOCKED
const BLOCKED_PATTERNS: { pattern: RegExp; type: string; message: string }[] = [
    {
        pattern: /git\s+push\s+.*--force\s+(origin\s+)?(main|master)/i,
        type: 'FORCE_PUSH_MAIN',
        message: 'Force push to main/master branch detected'
    },
    {
        pattern: /rm\s+-rf\s+[\/~]/,
        type: 'DANGEROUS_DELETE',
        message: 'Recursive delete of root or home directory'
    },
    {
        pattern: /:(){ :|:& };:/,
        type: 'FORK_BOMB',
        message: 'Fork bomb detected'
    },
    {
        pattern: />\s*\/dev\/sd[a-z]/,
        type: 'DISK_WRITE',
        message: 'Direct write to disk device'
    },
    {
        pattern: /mkfs\./,
        type: 'FORMAT_DISK',
        message: 'Disk formatting command detected'
    },
];

// Warning patterns that should show alerts but not block
const WARNING_PATTERNS: { pattern: RegExp; type: string; message: string; recommendation: string }[] = [
    {
        pattern: /git\s+push\s+.*--force/i,
        type: 'FORCE_PUSH',
        message: 'Force push detected',
        recommendation: 'Use --force-with-lease for safer force pushes'
    },
    {
        pattern: /git\s+reset\s+--hard/i,
        type: 'HARD_RESET',
        message: 'Hard reset will discard uncommitted changes',
        recommendation: 'Consider using git stash first'
    },
    {
        pattern: /git\s+clean\s+-[dxf]+/i,
        type: 'GIT_CLEAN',
        message: 'Git clean will permanently delete untracked files',
        recommendation: 'Use -n (dry-run) flag first'
    },
    {
        pattern: /--no-verify/i,
        type: 'SKIP_HOOKS',
        message: 'Skipping git hooks',
        recommendation: 'Hooks are important for quality - skip only when necessary'
    },
    {
        pattern: /curl\s+.*\|\s*(ba)?sh/i,
        type: 'PIPE_TO_SHELL',
        message: 'Piping remote content to shell',
        recommendation: 'Download and inspect script before executing'
    },
    {
        pattern: /chmod\s+777/,
        type: 'PERMISSIVE_CHMOD',
        message: 'Setting world-writable permissions',
        recommendation: 'Use more restrictive permissions like 755 or 644'
    },
    {
        pattern: /npm\s+publish/i,
        type: 'NPM_PUBLISH',
        message: 'Publishing to npm registry',
        recommendation: 'Ensure version is updated and tests pass'
    },
    {
        pattern: /vercel\s+--prod/i,
        type: 'PROD_DEPLOY',
        message: 'Production deployment detected',
        recommendation: 'Ensure all quality gates passed'
    },
];

// Secret patterns in command arguments
const SECRET_IN_COMMAND_PATTERNS: { pattern: RegExp; type: string }[] = [
    { pattern: /(?:password|passwd|pwd)=[^\s]+/i, type: 'PASSWORD_ARG' },
    { pattern: /(?:api[_-]?key|apikey)=[^\s]+/i, type: 'API_KEY_ARG' },
    { pattern: /(?:token|secret|auth)=[^\s]+/i, type: 'SECRET_ARG' },
    { pattern: /AKIA[0-9A-Z]{16}/, type: 'AWS_KEY_ARG' },
    { pattern: /ghp_[A-Za-z0-9]{36}/, type: 'GITHUB_TOKEN_ARG' },
    { pattern: /AIza[0-9A-Za-z_-]{35}/, type: 'GOOGLE_API_KEY_ARG' },
];

function analyzeCommand(command: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check blocked patterns (critical)
    for (const { pattern, type, message } of BLOCKED_PATTERNS) {
        if (pattern.test(command)) {
            issues.push({
                severity: 'critical',
                type,
                message,
                recommendation: 'This operation is blocked for safety'
            });
        }
    }

    // Check warning patterns
    for (const { pattern, type, message, recommendation } of WARNING_PATTERNS) {
        if (pattern.test(command)) {
            // Don't duplicate if already in blocked
            if (!issues.some(i => i.type === type)) {
                issues.push({
                    severity: 'warning',
                    type,
                    message,
                    recommendation
                });
            }
        }
    }

    // Check for secrets in command
    for (const { pattern, type } of SECRET_IN_COMMAND_PATTERNS) {
        if (pattern.test(command)) {
            issues.push({
                severity: 'critical',
                type,
                message: 'Potential secret found in command arguments',
                recommendation: 'Use environment variables instead of inline secrets'
            });
        }
    }

    return issues;
}

function formatOutput(issues: SecurityIssue[], command: string): { output: string; shouldBlock: boolean } {
    const critical = issues.filter(i => i.severity === 'critical');
    const warnings = issues.filter(i => i.severity === 'warning');

    let output = '\n========================================\n';
    output += '[!] SECURITY SCAN RESULTS\n';
    output += '========================================\n\n';

    // Show truncated command
    const displayCommand = command.length > 80
        ? command.substring(0, 77) + '...'
        : command;
    output += `Command: ${displayCommand}\n\n`;

    if (critical.length > 0) {
        output += '[!!!] CRITICAL ISSUES (BLOCKED):\n';
        for (const issue of critical) {
            output += `  - ${issue.type}: ${issue.message}\n`;
            if (issue.recommendation) {
                output += `    Recommendation: ${issue.recommendation}\n`;
            }
        }
        output += '\n';
    }

    if (warnings.length > 0) {
        output += '[!] WARNINGS:\n';
        for (const issue of warnings) {
            output += `  - ${issue.type}: ${issue.message}\n`;
            if (issue.recommendation) {
                output += `    Recommendation: ${issue.recommendation}\n`;
            }
        }
        output += '\n';
    }

    if (critical.length > 0) {
        output += 'STATUS: BLOCKED - Command will not execute\n';
        output += 'Reason: Critical security issues detected\n';
    } else if (warnings.length > 0) {
        output += 'STATUS: ALLOWED with warnings\n';
        output += 'Note: Command will proceed. Review warnings above.\n';
    }

    output += '========================================\n';

    return {
        output,
        shouldBlock: critical.length > 0
    };
}

async function main() {
    try {
        // Read input from stdin
        const input = readFileSync(0, 'utf-8');
        const data: HookInput = JSON.parse(input);

        // Only process Bash tool
        if (data.tool_name !== 'Bash') {
            process.exit(0);
        }

        const command = data.tool_input?.command || '';
        if (!command.trim()) {
            process.exit(0);
        }

        // Analyze command
        const issues = analyzeCommand(command);

        if (issues.length > 0) {
            const { output, shouldBlock } = formatOutput(issues, command);
            console.log(output);

            if (shouldBlock) {
                // Exit with error to block the command
                // Return JSON to indicate blocking
                console.log(JSON.stringify({
                    decision: 'block',
                    reason: 'Critical security issue detected'
                }));
                process.exit(1);
            }
        }

        // Allow command to proceed
        process.exit(0);

    } catch {
        // Silent exit on errors - do not block user workflow
        process.exit(0);
    }
}

main().catch(() => process.exit(0));
