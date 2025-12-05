#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");

// Patterns to detect potential secrets
const SECRET_PATTERNS = [
  { name: "OpenAI API Key", pattern: /sk-[a-zA-Z0-9]{20,}/g },
  { name: "Context7 API Key", pattern: /ctx7sk-[a-zA-Z0-9]{20,}/g },
  { name: "Stripe Key", pattern: /pk_(?:live|test)_[a-zA-Z0-9]{20,}/g },
  { name: "Stripe Secret", pattern: /sk_(?:live|test)_[a-zA-Z0-9]{20,}/g },
  { name: "AWS Access Key", pattern: /AKIA[0-9A-Z]{16}/g },
  {
    name: "Generic API Key",
    pattern:
      /(?:api_key|apikey|api-key)\s*[=:]\s*['"]?([a-zA-Z0-9_\-]{16,})['"]?/gi,
  },
  {
    name: "Generic Secret",
    pattern:
      /(?:secret|password|passwd|pwd)\s*[=:]\s*['"]?([a-zA-Z0-9_\-!@#$%^&*]{8,})['"]?/gi,
  },
  {
    name: "Generic Token",
    pattern:
      /(?:token|auth_token|access_token)\s*[=:]\s*['"]?([a-zA-Z0-9_\-]{16,})['"]?/gi,
  },
  {
    name: "Base64 Encoded (long)",
    pattern: /['"][A-Za-z0-9+/]{40,}={0,2}['"]/g,
  },
  {
    name: "JWT Token",
    pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
  },
];

// Folders and files to ignore
const IGNORE_PATTERNS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".env",
  ".env.local",
  ".env.example",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
];

function shouldIgnoreFile(filePath) {
  return IGNORE_PATTERNS.some((pattern) => filePath.includes(pattern));
}

function maskSecret(secret) {
  if (secret.length <= 4) return "****";
  return secret.substring(0, 4) + "...";
}

function getStagedFiles() {
  try {
    const output = execSync("git diff --cached --name-only --diff-filter=ACM", {
      encoding: "utf-8",
    });
    return output
      .trim()
      .split("\n")
      .filter((f) => f.length > 0);
  } catch {
    return [];
  }
}

function scanFileForSecrets(filePath) {
  const findings = [];

  if (!fs.existsSync(filePath)) return findings;

  let content;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    return findings;
  }

  const lines = content.split("\n");

  lines.forEach((line, index) => {
    SECRET_PATTERNS.forEach(({ name, pattern }) => {
      // Reset regex lastIndex for global patterns
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const secret = match[1] || match[0];
        findings.push({
          file: filePath,
          line: index + 1,
          type: name,
          masked: maskSecret(secret),
        });
      }
    });
  });

  return findings;
}

function main() {
  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    console.log("✓ No staged files to scan");
    process.exit(0);
  }

  const filesToScan = stagedFiles.filter((f) => !shouldIgnoreFile(f));
  let allFindings = [];

  filesToScan.forEach((file) => {
    const findings = scanFileForSecrets(file);
    allFindings = allFindings.concat(findings);
  });

  if (allFindings.length > 0) {
    console.error("\n🚨 Potential secrets detected!\n");
    allFindings.forEach(({ file, line, type, masked }) => {
      console.error(`  ${file}:${line} - ${type}: ${masked}`);
    });
    console.error("\n❌ Commit blocked. Remove secrets before committing.\n");
    process.exit(1);
  }

  console.log(`✓ Scanned ${filesToScan.length} file(s) - no secrets found`);
  process.exit(0);
}

main();
