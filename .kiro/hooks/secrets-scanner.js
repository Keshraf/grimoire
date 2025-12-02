#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Folders to ignore
const IGNORED_FOLDERS = ["node_modules", ".git", "dist", "build"];

// Secret patterns to detect
const SECRET_PATTERNS = [
  // API keys with common prefixes
  { name: "API Key (sk-)", pattern: /\bsk-[a-zA-Z0-9]{20,}/g },
  { name: "API Key (ctx7sk-)", pattern: /\bctx7sk-[a-zA-Z0-9]{20,}/g },
  { name: "API Key (pk_)", pattern: /\bpk_[a-zA-Z0-9]{20,}/g },
  // AWS keys
  { name: "AWS Access Key", pattern: /\bAKIA[0-9A-Z]{16}\b/g },
  // Generic secrets in assignments
  {
    name: "Generic Secret",
    pattern:
      /(?:api_key|apikey|secret|password|token)\s*[=:]\s*["']([^"']{8,})["']/gi,
  },
  // Base64-encoded strings (32+ chars, likely secrets)
  { name: "Base64 Secret", pattern: /["'][A-Za-z0-9+/]{32,}={0,2}["']/g },
];

function maskSecret(secret) {
  if (secret.length <= 4) return "****";
  return secret.substring(0, 4) + "...";
}

function shouldIgnoreFile(filePath) {
  // Ignore .env files
  if (path.basename(filePath).startsWith(".env")) {
    return true;
  }
  // Ignore files in ignored folders
  const parts = filePath.split(path.sep);
  return parts.some((part) => IGNORED_FOLDERS.includes(part));
}

function scanFileContent(content, filePath) {
  const findings = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    SECRET_PATTERNS.forEach(({ name, pattern }) => {
      // Reset regex lastIndex for global patterns
      pattern.lastIndex = 0;
      let match;

      while ((match = pattern.exec(line)) !== null) {
        const secret = match[1] || match[0];
        findings.push({
          file: filePath,
          line: lineNumber,
          type: name,
          masked: maskSecret(secret),
        });
      }
    });
  });

  return findings;
}

function getStagedFiles() {
  try {
    const output = execSync("git diff --cached --name-only --diff-filter=ACM", {
      encoding: "utf-8",
    });
    return output.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function main() {
  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    console.log("No staged files to scan.");
    process.exit(0);
  }

  let allFindings = [];

  for (const filePath of stagedFiles) {
    if (shouldIgnoreFile(filePath)) {
      continue;
    }

    const fullPath = path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      continue;
    }

    try {
      const content = fs.readFileSync(fullPath, "utf-8");
      const findings = scanFileContent(content, filePath);
      allFindings = allFindings.concat(findings);
    } catch {
      // Skip files that can't be read
    }
  }

  if (allFindings.length > 0) {
    console.log("\n🚨 Potential secrets detected in staged files:\n");
    allFindings.forEach(({ file, line, type, masked }) => {
      console.log(`  ${file}:${line} - ${type}: ${masked}`);
    });
    console.log(
      "\n❌ Commit blocked. Please remove secrets before committing.\n"
    );
    process.exit(1);
  }

  console.log("✅ No secrets detected in staged files.");
  process.exit(0);
}

main();
