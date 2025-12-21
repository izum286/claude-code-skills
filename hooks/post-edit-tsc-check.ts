#!/usr/bin/env node
/**
 * Post-Edit TypeScript Validator Hook
 *
 * Runs after each Edit/Write on .ts/.tsx files:
 * - Performs quick tsc --noEmit check
 * - Shows warnings but does NOT block (flexible mode)
 * - Helps catch type errors early in the development cycle
 *
 * Output: [TSC WARNING] X type errors found in path/to/file.ts
 */

import { readFileSync, existsSync } from 'fs';
import { execSync, ExecSyncOptionsWithStringEncoding } from 'child_process';
import { join, extname, relative } from 'path';

interface HookInput {
    tool_name: string;
    tool_input: {
        file_path?: string;
        [key: string]: unknown;
    };
    tool_output?: string;
    session_id?: string;
    cwd?: string;
}

interface TscError {
    file: string;
    line: number;
    column: number;
    code: string;
    message: string;
}

const TYPESCRIPT_EXTENSIONS = ['.ts', '.tsx'];
const EXCLUDED_PATTERNS = [
    /node_modules/,
    /\.d\.ts$/,
    /\.test\.ts$/,
    /\.spec\.ts$/,
    /dist\//,
    /build\//,
];

function isTypeScriptFile(filePath: string): boolean {
    const ext = extname(filePath).toLowerCase();
    return TYPESCRIPT_EXTENSIONS.includes(ext);
}

function isExcludedFile(filePath: string): boolean {
    return EXCLUDED_PATTERNS.some(pattern => pattern.test(filePath));
}

function findProjectRoot(startPath: string): string | null {
    let current = startPath;
    const maxDepth = 10;
    let depth = 0;

    while (depth < maxDepth) {
        if (existsSync(join(current, 'tsconfig.json'))) {
            return current;
        }
        const parent = join(current, '..');
        if (parent === current) {
            break;
        }
        current = parent;
        depth++;
    }

    return null;
}

function parseTscOutput(output: string): TscError[] {
    const errors: TscError[] = [];
    const lines = output.split('\n');

    // Pattern: path/file.ts(line,col): error TSxxxx: message
    const errorPattern = /^(.+)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/;

    for (const line of lines) {
        const match = line.match(errorPattern);
        if (match) {
            errors.push({
                file: match[1],
                line: parseInt(match[2], 10),
                column: parseInt(match[3], 10),
                code: match[4],
                message: match[5],
            });
        }
    }

    return errors;
}

function runTypeScriptCheck(projectRoot: string, targetFile: string): TscError[] {
    try {
        const options: ExecSyncOptionsWithStringEncoding = {
            cwd: projectRoot,
            encoding: 'utf-8',
            timeout: 45000, // 45 second timeout
            stdio: 'pipe',
            windowsHide: true,
        };

        // Try project-specific tsconfig first
        let tsconfigPath = 'tsconfig.json';
        if (existsSync(join(projectRoot, 'tsconfig.app.json'))) {
            tsconfigPath = 'tsconfig.app.json';
        }

        execSync(`npx tsc --project ${tsconfigPath} --noEmit`, options);
        return []; // No errors

    } catch (error: unknown) {
        const execError = error as { stdout?: string; stderr?: string };
        const output = execError.stdout || execError.stderr || '';
        return parseTscOutput(output);
    }
}

function formatErrorSummary(errors: TscError[], editedFile: string, projectRoot: string): string {
    // Get relative path for edited file
    const relativeEditedFile = relative(projectRoot, editedFile).replace(/\\/g, '/');

    // Group errors by file
    const errorsByFile = new Map<string, TscError[]>();
    for (const error of errors) {
        const relativePath = error.file.replace(/\\/g, '/');
        if (!errorsByFile.has(relativePath)) {
            errorsByFile.set(relativePath, []);
        }
        errorsByFile.get(relativePath)!.push(error);
    }

    // Check if edited file has errors
    const editedFileErrors = errorsByFile.get(relativeEditedFile) || [];
    const otherFileErrors = errors.length - editedFileErrors.length;

    let output = '\n----------------------------------------\n';
    output += '[TSC WARNING] TypeScript Check Results\n';
    output += '----------------------------------------\n\n';

    if (editedFileErrors.length > 0) {
        output += `Errors in edited file (${relativeEditedFile}):\n`;
        const maxErrors = 5; // Show max 5 errors per file
        editedFileErrors.slice(0, maxErrors).forEach(err => {
            output += `  Line ${err.line}: ${err.code} - ${err.message}\n`;
        });
        if (editedFileErrors.length > maxErrors) {
            output += `  ... and ${editedFileErrors.length - maxErrors} more errors\n`;
        }
        output += '\n';
    }

    if (otherFileErrors > 0) {
        output += `Additional errors in other files: ${otherFileErrors}\n`;
    }

    output += `\nTotal: ${errors.length} TypeScript error(s)\n`;
    output += '\nNote: This is a WARNING. Your edit was applied.\n';
    output += 'Run "npm run build" or "tsc --noEmit" for full details.\n';
    output += '----------------------------------------\n';

    return output;
}

async function main() {
    try {
        // Read input from stdin
        const input = readFileSync(0, 'utf-8');
        const data: HookInput = JSON.parse(input);

        // Only process Edit, MultiEdit, Write tools
        if (!['Edit', 'MultiEdit', 'Write'].includes(data.tool_name)) {
            process.exit(0);
        }

        const filePath = data.tool_input?.file_path;
        if (!filePath) {
            process.exit(0);
        }

        // Skip non-TypeScript files
        if (!isTypeScriptFile(filePath)) {
            process.exit(0);
        }

        // Skip excluded files
        if (isExcludedFile(filePath)) {
            process.exit(0);
        }

        // Find project root with tsconfig.json
        const projectRoot = findProjectRoot(filePath);
        if (!projectRoot) {
            // No tsconfig found, skip check
            process.exit(0);
        }

        // Run TypeScript check
        const errors = runTypeScriptCheck(projectRoot, filePath);

        if (errors.length > 0) {
            const summary = formatErrorSummary(errors, filePath, projectRoot);
            console.log(summary);
        }

        // Always exit 0 (warn only, don't block)
        process.exit(0);

    } catch {
        // Silent exit on errors - do not block user workflow
        process.exit(0);
    }
}

main().catch(() => process.exit(0));
